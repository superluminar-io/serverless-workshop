# Messaging

## In this lab …

- Learn how to create a DynamoDB stream and handle asynchronous operations

## DynamoDB Stream

### 📝 Task

Create a DynamoDB stream for the notes table. The AWS Lambda function should take the note, count the words and apply the number of words to the DynamoDB item. You can keep the word counting very simple as it just demonstrates asynchronous data processing.

<br />

![Architecture diagram for DynamoDB stream](/media/messaging/stream.drawio.svg)

### 🔎 Hints

- [DynamoDB stream with AWS CDK](https://docs.aws.amazon.com/cdk/api/v2//docs/aws-cdk-lib.aws_lambda_event_sources-readme.html#dynamodb-streams)

### 🗺  Step-by-Step Guide

1. Create a file for the new construct:
   ```bash
   touch ./src/word-count.ts
   ```
1. Open the file and paste the following code:
   ```typescript
   import {
     aws_dynamodb as dynamodb,
     aws_lambda as lambda,
     aws_lambda_nodejs as lambdaNodeJs,
     aws_lambda_event_sources as lambdaEventSources,
   } from 'aws-cdk-lib';
   import { Construct } from 'constructs';

   export interface WordCountProps {
     notesTable: dynamodb.Table;
   }

   export class WordCount extends Construct {
     constructor(scope: Construct, id: string, props: WordCountProps) {
       super(scope, id);

       const streamFunction = new lambdaNodeJs.NodejsFunction(this, 'stream', {
         environment: {
           TABLE_NAME: props.notesTable.tableName,
         },
       });

       streamFunction.addEventSource(
         new lambdaEventSources.DynamoEventSource(props.notesTable, {
           startingPosition: lambda.StartingPosition.TRIM_HORIZON,
           retryAttempts: 0,
         }),
       );

       props.notesTable.grantWriteData(streamFunction);
     }
   }
   ```
1. Create a new file for the AWS Lambda function:
   ```bash
   touch src/word-count.stream.ts
   ```
1. Implement the AWS Lambda function:
   ```typescript
   import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
   import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
   
   
   export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
     const DB = DynamoDBDocument.from(new DynamoDBClient({}));
   
     for (const record of event.Records) {
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
       });
     }
   };
   ```
1. Update the main stack, so `./src/main.ts`:
   ```typescript
   import { App, Stack, StackProps } from 'aws-cdk-lib';
   import { Construct } from 'constructs';
   import { RestApi } from './rest-api';
   import { WordCount } from './word-count';
 
   export class MyStack extends Stack {
     constructor(scope: Construct, id: string, props: StackProps = {}) {
       super(scope, id, props);
 
       const restApi = new RestApi(this, 'rest-api');
 
       new WordCount(this, 'word-count', {
         notesTable: restApi.notesTable,
       });
     }
   }
   ```
   ⚠️Important: Only update the imports and the class. Everything below the class should be the same.
1. Deploy the CloudFormation stack:
   ```bash
   npm run deploy
   ```
1. Make a HTTP request:
   ```bash
   curl -X POST https://XXXXXX.execute-api.eu-central-1.amazonaws.com/prod/notes --data '{ "title": "Count me", "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae." }' -H 'Content-Type: application/json' -i
   ```
1. Go to the [DynamoDB console](https://console.aws.amazon.com/dynamodbv2) and check the word count.

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
