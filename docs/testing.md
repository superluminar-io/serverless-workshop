# Testing

## In this lab …

- Write unit tests for AWS lambda functions
- Write integration tests for the REST API

## Unit Testing

### 📝 Task

Write unit tests for the AWS Lambda functions. Running the command `npm test` should execute your unit tests and pass all tests.

### 🔎 Hints

- [Mock the DynamoDB DocumentClient with AWS SDK Mock](https://github.com/m-radzikowski/aws-sdk-client-mock)

### 🗺  Step-by-Step Guide

1. Extend the list of dev dependencies in the `.projenrc.js` configuration:
    ```js
    const { awscdk, javascript } = require('projen');
    const project = new awscdk.AwsCdkTypeScriptApp({
      cdkVersion: '2.35.0',
      defaultReleaseBranch: 'main',
      github: false,
      name: 'notes-api',
      packageManager: javascript.NodePackageManager.NPM,
      deps: [
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/lib-dynamodb',
      ],
      devDeps: [
        '@types/aws-lambda',
        'aws-sdk-client-mock',
      ],
    });
  
    // Windows users might need this
    project.jest.addTestMatch('**/?(*.)+(spec|test).ts?(x)');
    project.synth();
    ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Create a new file:
  ```bash
  touch ./test/rest-api.list-notes.test.ts
  ```
1. Add the following code to the test file:
    ```typescript
    import { DynamoDBDocument, ScanCommand } from '@aws-sdk/lib-dynamodb';
    import { mockClient } from 'aws-sdk-client-mock';
    import { handler } from '../src/rest-api.list-notes';
    
    it('should return notes', async () => {
      const item = {
        id: '2021-04-12T18:55:06.295Z',
        title: 'Hello World',
        content: 'Minim nulla dolore nostrud dolor aliquip minim.',
      };
    
      const ddbMock = mockClient(DynamoDBDocument);
      ddbMock.on(ScanCommand).resolves({
        Items: [item],
      });
    
      const response = await handler();
    
      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify([item]),
      });
    
      ddbMock.reset();
      ddbMock.restore();
    });
    ```
1. Create a new file:
   ```bash
   touch test/rest-api.put-note.test.ts
   ```
1. Add the following code to the test file:
    ```typescript
    import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
    import { mockClient } from 'aws-sdk-client-mock';
    import { handler } from '../src/rest-api.put-note';

    describe('valid request', () => {
      it('should return status code 201', async () => {
        const tableName = 'foo';
        process.env.TABLE_NAME = tableName;

        const ddbMock = mockClient(DynamoDBDocument);
        ddbMock.on(PutCommand).resolves({});

        const requestBody = {
          title: 'Hello World',
          content: 'Minim nulla dolore nostrud dolor aliquip minim.',
        };

        const event = {
          body: JSON.stringify(requestBody),
        } as AWSLambda.APIGatewayProxyEvent;

        const response = await handler(event);

        expect(ddbMock.calls()).toHaveLength(1);
        expect(ddbMock.call(0).firstArg.input).toEqual({
          Item: {
            id: expect.any(String),
            title: requestBody.title,
            content: requestBody.content,
          },
          TableName: tableName,
        });

        expect(response).toEqual({
          statusCode: 201,
        });

        ddbMock.reset();
        ddbMock.restore();
      });
    });

    describe('invalid request body', () => {
      it('should return status code 400', async () => {
        const response = await handler({} as AWSLambda.APIGatewayProxyEvent);

        expect(response).toEqual({
          statusCode: 400,
        });
      });
    });
    ```
1. Run the tests:
   ```bash
   npm test
   ```

## Integration Testing

### 📝 Task

Integration tests are super helpful to test the whole stack end-to-end. Write some integration tests that essentially send some HTTP requests and validate the response.

### 🔎 Hints

- [Write your own Projen tasks](https://github.com/projen/projen/blob/main/docs/tasks.md)
- [node-fetch is your friend for sending HTTP requests](https://www.npmjs.com/package/node-fetch)
- [Use environment variables to pass the API endpoint](https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html)

### 🗺  Step-by-Step Guide

1. Extend the list of dependencies in the `.projenrc.js` configuration:
   ```js
   const { awscdk, javascript } = require('projen');
   const project = new awscdk.AwsCdkTypeScriptApp({
     cdkVersion: '2.35.0',
     defaultReleaseBranch: 'main',
     github: false,
     name: 'notes-api',
     packageManager: javascript.NodePackageManager.NPM,
     deps: [
       'node-fetch@2.6.1',
       '@aws-sdk/client-dynamodb',
       '@aws-sdk/lib-dynamodb',
     ],
     devDeps: [
       '@types/aws-lambda',
       '@types/node-fetch@2',
       'aws-sdk-client-mock',
     ],
   });
 
   // Windows users might need this
   project.jest.addTestMatch('**/?(*.)+(spec|test).ts?(x)'); 
   project.synth();
   ```
1. In addition, add a new task to the `.projenrc.js` configuration before synthing the project:
  ```js
  project.addTask('test:e2e', {
    exec: 'jest --testMatch "**/*.e2etest.ts"',
  });
  ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Create a new file:
   ```
   touch ./test/rest-api.e2etest.ts
   ```
1. Add the following code to the file:
  ```typescript
  import fetch from "node-fetch";

  const endpoint = process.env.ENDPOINT;

  test("create a note", async () => {
    const response = await fetch(`${endpoint}/notes`, {
      method: "POST",
      body: JSON.stringify({
        title: "Hello World",
        content: "Ex nisi do ad sint enim.",
      }),
    });

    expect(response.status).toEqual(201);
  });

  test("list notes", async () => {
    const response = await fetch(`${endpoint}/notes`);

    expect(response.status).toEqual(200);
  });
  ```
1. Run the integration tests:
  ```bash
  ENDPOINT=https://XXXXXX.execute-api.eu-central-1.amazonaws.com/prod npm run test:e2e
  ```

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab2).
