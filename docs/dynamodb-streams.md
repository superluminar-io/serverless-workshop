# DynamoDB Streams

## In this lab …

- Learn how to create a DynamoDB stream and handle asynchronous operations
- Learn how to use dead letter queues for AWS Lambda functions

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

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
