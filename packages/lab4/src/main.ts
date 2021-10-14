import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as lambdaNodeJs from '@aws-cdk/aws-lambda-nodejs';
import { App, Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const notesTable = new dynamodb.Table(this, 'notes-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    const stream = new lambdaNodeJs.NodejsFunction(this, 'stream', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });
    stream.addEventSource(new lambdaEventSources.DynamoEventSource(notesTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      retryAttempts: 0,
    }));

    const putNote = new lambdaNodeJs.NodejsFunction(this, 'put-note', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    const listNotes = new lambdaNodeJs.NodejsFunction(this, 'list-notes', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    notesTable.grant(putNote, 'dynamodb:PutItem');
    notesTable.grant(stream, 'dynamodb:UpdateItem');
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