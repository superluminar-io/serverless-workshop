import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as lambdaNodeJs from '@aws-cdk/aws-lambda-nodejs';
import * as sqs from '@aws-cdk/aws-sqs';
import * as sns from '@aws-cdk/aws-sns';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { App, Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // Notes Table
    const notesTable = new dynamodb.Table(this, 'notes-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    // Notes API 
    const listNotes = new lambdaNodeJs.NodejsFunction(this, 'list-notes', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    const putNote = new lambdaNodeJs.NodejsFunction(this, 'put-note', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    notesTable.grant(putNote, 'dynamodb:PutItem');
    notesTable.grant(listNotes, 'dynamodb:Scan');

    const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: putNote,
    });

    const listNotesIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: listNotes,
    });

    const httpApi = new apigateway.HttpApi(this, 'http-api');

    httpApi.addRoutes({
      path: '/notes',
      methods: [apigateway.HttpMethod.POST],
      integration: putNoteIntegration,
    });

    httpApi.addRoutes({
      path: '/notes',
      methods: [apigateway.HttpMethod.GET],
      integration: listNotesIntegration,
    });

    // EventBridge
    const bus = new events.EventBus(this, 'bus');
    
    const rule = new events.Rule(this, 'rule', {
      eventPattern: {
        source: ['custom.notes'],
        detail: {
          wordCount: [ 
            { 
              numeric: [ '>', 10 ],
            },
          ],
        },
      },
      eventBus: bus
    });
    
    const eventBusFunction = new lambdaNodeJs.NodejsFunction(this, 'event-bus');
    rule.addTarget(new targets.LambdaFunction(eventBusFunction));

    // DynamoDB Stream with SQS
    const queue = new sqs.Queue(this, 'queue');
    const queueFunction = new lambdaNodeJs.NodejsFunction(this, 'stream', {
      environment: {
        QUEUE_URL: queue.queueUrl,
      }
    });
    queueFunction.addEventSource(new lambdaEventSources.DynamoEventSource(notesTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      retryAttempts: 0,
    }));
    queue.grantSendMessages(queueFunction);

    const wordCount = new lambdaNodeJs.NodejsFunction(this, 'word-count', {
      environment: {
        TABLE_NAME: notesTable.tableName,
        EVENT_BUS_NAME: bus.eventBusName,
      },
    });
    wordCount.addEventSource(new lambdaEventSources.SqsEventSource(queue));
    notesTable.grant(wordCount, 'dynamodb:GetItem', 'dynamodb:UpdateItem');
    bus.grantPutEventsTo(wordCount);

    // Fire-and-forget fanout with SNS
    const topic = new sns.Topic(this, 'webhook-topic');
    topic.addSubscription(new subscriptions.UrlSubscription('https://enhlp1mddjm7f.x.pipedream.net'));
    
    const snsFunction = new lambdaNodeJs.NodejsFunction(this, 'sns', {
      environment: {
        TOPIC_ARN: topic.topicArn,
      }
    });
    snsFunction.addEventSource(new lambdaEventSources.DynamoEventSource(notesTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
    }));
    topic.grantPublish(snsFunction);

    // CloudFormation stack output
    new CfnOutput(this, 'URL', { value: httpApi.apiEndpoint });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();