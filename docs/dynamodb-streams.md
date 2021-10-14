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
      '@aws-cdk/aws-lambda-event-sources'
    ],
    // …
  });
  ```
1. Extend the CloudFormation stack in `./src/main.ts` file:
  ```ts
  
  ```

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
