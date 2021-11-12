# Messaging

## In this lab …

- Learn how to create a DynamoDB stream and handle asynchronous operations
- Learn how to use AWS SQS, AWS SNS, and AWS EventBridge for messages and events

## DynamoDB Stream

### 📝 Task

Create a DynamoDB stream for the notes table. The AWS Lambda function should take the note, count the words and apply the number of words to the DynamoDB item. You can keep the word counting very simple as it just demonstrates asynchronous data processing.

### 🔎 Hints

- [DynamoDB stream with AWS CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html#dynamodb-streams)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the `.projenrc.js` configuration to add new CDK dependencies:
  ```js
  const project = new AwsCdkTypeScriptApp({
    // …
    cdkDependencies: [
      '@aws-cdk/aws-lambda-nodejs',
      '@aws-cdk/aws-apigatewayv2',
      '@aws-cdk/aws-apigatewayv2-integrations',
      '@aws-cdk/aws-dynamodb',
      '@aws-cdk/aws-lambda',
      '@aws-cdk/aws-lambda-event-sources'
    ],
    // …
  });
  ```
1. Extend the CloudFormation stack in `./src/main.ts` file:
  ```ts
  // … (more imports from previous labs)
  import * as lambda from '@aws-cdk/aws-lambda';
  import * as lambdaNodeJs from '@aws-cdk/aws-lambda-nodejs';
  import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';

  export class MyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);

      const notesTable = new dynamodb.Table(this, 'notes-table', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        stream: dynamodb.StreamViewType.NEW_IMAGE,
      });

      const wordCount = new lambdaNodeJs.NodejsFunction(this, 'word-count', {
        environment: {
          TABLE_NAME: notesTable.tableName,
        },
      });
      wordCount.addEventSource(new lambdaEventSources.DynamoEventSource(notesTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        retryAttempts: 0,
      }));
      notesTable.grant(wordCount, 'dynamodb:UpdateItem');

      // … (more resources from previous labs)
    }
  }
  ```
1. Create a new file for the AWS lambda function:
  ```bash
  touch src/main.word-count.ts
  ```
1. Implement the AWS lambda function:
  ```ts
  import * as AWS from 'aws-sdk';

  export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
    const DB = new AWS.DynamoDB.DocumentClient();

    for (let record of event.Records) {
      if (record.eventName !== 'INSERT' || !record.dynamodb || !record.dynamodb.NewImage) {
        return;
      }

      const id = record.dynamodb.Keys?.id.S;
      const newImage = record.dynamodb.NewImage;
      const content = newImage.content?.S;
      const wordCount = content?.split(' ').length;

      await DB.update({
        Key: {
          id,
        },
        AttributeUpdates: {
          wordCount: {
            Value: wordCount,
          },
        },
        TableName: process.env.TABLE_NAME!,
      }).promise();
    }
  };
  ```
1. Deploy the CloudFormation stack:
  ```
  npm run deploy
  ```
1. Make a HTTP request:
  ```bash
  curl -X POST https://XXXXXX.execute-api.eu-central-1.amazonaws.com/notes --data '{ "title": "Count me", "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae." }' -H 'Content-Type: application/json' -i
  ```
1. Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodbv2) and check the word count.

</details>

### ❓ Questions

- What stream types can we configure for the DynamoDB stream, and what are the benefits?
- What is the default batch size, and what do we need to consider for the AWS lambda function configuration?
- What are secenarios where retry policies for DynamoDB streams might be helpful? 
- What happens with the event assuming the AWS Lambda function fails?

## SQS

### 📝 Task

We already introduced a DynamoDB stream and implemented the business logic to count the words of the notes and apply the word count to the DynamoDB item. Now, we want to improve the setup and introduce a queue to decouple the systems and improve the robustness.

Create a queue with AWS SQS and send the DynamoDB stream event to the queue. Process the event in the queue, count the words and apply the word count to the DynamoDB item.

### 🔎 Hints

- [AWS SQS with Lambda triger using AWS CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html#sqs)
- [Grant access to send messages to the queue](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-sqs.Queue.html#grantwbrsendwbrmessagesgrantee) 
- [Sending messages to a queue with Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sqs-examples-send-receive-messages.html#sqs-examples-send-receive-messages-sending)
- [Receiving SQS messages in the AWS console](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-using-receive-delete-message.html)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the list of CDK dependencies in the `.projenrc.js` configuration:
  ```js
  const { AwsCdkTypeScriptApp, NodePackageManager } = require('projen');
  const project = new AwsCdkTypeScriptApp({
    // …
    cdkDependencies: [
      '@aws-cdk/aws-lambda-nodejs',
      '@aws-cdk/aws-apigatewayv2',
      '@aws-cdk/aws-apigatewayv2-integrations',
      '@aws-cdk/aws-dynamodb',
      '@aws-cdk/aws-lambda',
      '@aws-cdk/aws-lambda-event-sources',
      '@aws-cdk/aws-sqs',
    ],
    // …
  });
  ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Extend the CloudFormation stack in the `./src/main.ts` file to introduce the queue and send the DynamoDB event to the queue:
  ```ts
    // … (more imports from previous labs)
  import * as sqs from '@aws-cdk/aws-sqs';

  export class MyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);
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
    
      // … (more resources from previous labs)
    }
  }
  ```
1. Create a new file:
  ```bash
  touch src/main.stream.ts
  ```
1. Implement the AWS Lambda function:
  ```ts
  import * as AWS from 'aws-sdk';

  export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
    const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

    for (let record of event.Records) {
      if (record.eventName !== 'INSERT' || !record.dynamodb) {
        return;
      }

      const id = record.dynamodb.Keys?.id.S;
      const message = {
        noteId: id,
      }
    
      await sqs.sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: process.env.QUEUE_URL!,
      }).promise();
    }
  };
  ```
1. Deploy the changes:
  ```bash
  npm run deploy
  ```
1. Create a new note:
  ```bash
  curl -X POST https://XXXXXX.execute-api.eu-central-1.amazonaws.com/notes --data '{ "title": "Hello World", "content": "some text" }' -H 'Content-Type: application/json' -i
  ```
1. Check out the [AWS SQS console](https://console.aws.amazon.com/sqs/). You sould see a message in the queue.
1. Update the `word-count` AWS Lambda function to process the SQS message, so first in the CloudFormation stack:
  ```ts
  export class MyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);
      
      const wordCount = new lambdaNodeJs.NodejsFunction(this, 'word-count', {
        environment: {
          TABLE_NAME: notesTable.tableName,
        },
      });
      wordCount.addEventSource(new lambdaEventSources.SqsEventSource(queue));

      notesTable.grant(wordCount, 'dynamodb:GetItem', 'dynamodb:UpdateItem');
      // … (more resources from previous labs)
    }
  }
  ```
1. And the AWS Lambda implementation, so `./src/main.word-count.ts`:
  ```ts
  import * as AWS from 'aws-sdk';

  export const handler = async (event: AWSLambda.SQSEvent) => {
    const DB = new AWS.DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME!;

    for (let record of event.Records) {
      const body = JSON.parse(record.body);
      const id = body.noteId;
      const note = await DB.get({
        TableName: tableName,
        Key: {
          id: body.noteId,
        },
      }).promise();

      if (!note.Item) {
        return;
      }

      const content = note.Item.content;
      const wordCount = content.split(' ').length;

      await DB.update({
        Key: {
          id,
        },
        AttributeUpdates: {
          wordCount: {
            Value: wordCount,
          },
        },
        TableName: tableName,
      }).promise();
    }
  };
  ```
1. Deploy the latest changes:
  ```ts
  npm run deploy
  ```
1. After the deployment, the AWS Lambda function starts processing the messages in the queue and applies the word count to the DynamoDB items. Feel free to create more notes and observe the system.

</details>

## SNS

### 📝 Task

Another scenario for events is a simple fire-and-forget fanout. We want to introduce [SNS](https://aws.amazon.com/sns/) to trigger a [webhook](https://en.wikipedia.org/wiki/Webhook) and inform external services about new notes. 

Create a new DynamoDB stream and send a message to an SNS topic for every new note. Create an HTTP endpoint with [requestbin](requestbin.com) and subscribe the endpoint to the SNS topic. The endpoint acts as an example for a webhook.

### 🔎 Hints

- [SNS topic with url subscription using AWS CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-sns-readme.html#subscriptions)
- [Publish a message with Node.js](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sns-examples-publishing-messages.html#sns-examples-publishing-text-messages)
- [Grant publish access with AWS CDK](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-sns.Topic.html#grantwbrpublishgrantee)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the list of CDK dependencies in the `.projenrc.js` configuration:
  ```js
  const { AwsCdkTypeScriptApp, NodePackageManager } = require('projen');
  const project = new AwsCdkTypeScriptApp({
    // …
    cdkDependencies: [
      '@aws-cdk/aws-lambda-nodejs',
      '@aws-cdk/aws-apigatewayv2',
      '@aws-cdk/aws-apigatewayv2-integrations',
      '@aws-cdk/aws-dynamodb',
      '@aws-cdk/aws-lambda',
      '@aws-cdk/aws-lambda-event-sources',
      '@aws-cdk/aws-sqs',
      '@aws-cdk/aws-sns',
      '@aws-cdk/aws-sns-subscriptions'
    ],
    // …
  });
  ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Create a public endpoint with [requestbin](https://requestbin.com/r) and copy the endpoint url.
1. Extend the CloudFormation stack in `./src/main.ts` file. Don't forget to replace **YOUR_REQUESTBIN_ENDPOINT** with your endpoint.
  ```ts
  // … (more imports from previous labs)
  import * as sns from '@aws-cdk/aws-sns';
  import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';

  export class MyStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);

      const topic = new sns.Topic(this, 'webhook-topic');
      topic.addSubscription(new subscriptions.UrlSubscription('YOUR_REQUESTBIN_ENDPOINT'));
      
      const snsFunction = new lambdaNodeJs.NodejsFunction(this, 'sns', {
        environment: {
          TOPIC_ARN: topic.topicArn,
        }
      });
      snsFunction.addEventSource(new lambdaEventSources.DynamoEventSource(notesTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      }));
      topic.grantPublish(snsFunction);

      // … (more resources from previous labs)
    }
  }
  ```
1. Create a new file:
  ```bash
  touch src/main.sns.ts
  ```
1. Implement the AWS Lambda function:
  ```ts
  import * as AWS from 'aws-sdk';

  export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
    const sns = new AWS.SNS({apiVersion: '2010-03-31'});
    const topicArn = process.env.TOPIC_ARN;

    for (let record of event.Records) {
      if (record.eventName !== 'INSERT' || !record.dynamodb) {
        return;
      }

      const id = record.dynamodb.Keys?.id.S;
      const content = record.dynamodb.NewImage?.content.S;
      const title = record.dynamodb.NewImage?.title.S;

      const message = {
        id,
        content,
        title
      }
    
      await sns.publish({
        Message: JSON.stringify(message),
        TopicArn: topicArn,
      }).promise()
    }
  };
  ```
1. Deploy the changes:
  ```bash
  npm run deploy
  ```
1. Go to requestbin. You should see the first request coming in. With the first request, we basically need to accept the subscription to receive further events. In the post body, you should find a **SubscribeURL**. Copy the URL and open it in a new tab. The subscription is now confirmed.
1. Create a new note:
  ```bash
  curl -X POST https://XXXXXX.execute-api.eu-central-1.amazonaws.com/notes --data '{ "title": "Hello World", "content": "some text" }' -H 'Content-Type: application/json' -i
  ```
1. Go to requestbin again. You should see another request with the note we just created.

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
