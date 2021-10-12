# Testing

## In this lab …

- Write unit tests for AWS lambda functions
- Write integration tests for the REST API

## Unit Testing

### 📝 Task

Write unit tests for the AWS Lambda functions. Running the command `npm test` should execute your unit tests and pass all tests.

### 🔎 Hints

- [Mock the DynamoDB DocumentClient with Jest](https://stackoverflow.com/a/60478596)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the list of dev dependencies in the `.projenrc.js` configuration:
  ```js
  const { AwsCdkTypeScriptApp, NodePackageManager } = require('projen');
  const project = new AwsCdkTypeScriptApp({
    // …
    devDeps: [
      'esbuild@0',
      '@types/aws-lambda',
      'aws-sdk-mock'
    ],
    // …
  });
  project.synth();
  ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Create a new file:
  ```bash
  touch ./test/main.list-notes.test.ts
  ```
1. Add the following code to the test file:
  ```typescript
  import AWSMock from 'aws-sdk-mock';
  import { handler } from '../src/main.list-notes';

  it('should return notes', async () => {
    const item = {
      id: '2021-04-12T18:55:06.295Z',
      title: 'Hello World',
      content: 'Minim nulla dolore nostrud dolor aliquip minim.',
    };

    AWSMock.mock('DynamoDB.DocumentClient', 'scan', (_, callback: Function) => {
      callback(null, { Items: [item] });
    });

    const response = await handler();

    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify([item]),
    });

    AWSMock.restore('DynamoDB.DocumentClient');
  });
  ```
1. Create a new file:
   ```bash
   touch test/main.put-note.test.ts
   ```
1. Add the following code to the test file:
  ```typescript
  import AWSMock from 'aws-sdk-mock';
  import { handler } from '../src/main.put-note';

  describe("valid request", () => {
    it("should return status code 201", async () => {
      const tableName = 'foo';
      const putItemSpy = jest.fn();
      process.env.TABLE_NAME = tableName;
      AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
        callback(null, putItemSpy(params));
      });

      const requestBody = {
        title: "Hello World",
        content: "Minim nulla dolore nostrud dolor aliquip minim.",
      };

      const event = {
        body: JSON.stringify(requestBody),
      } as AWSLambda.APIGatewayProxyEvent;
      
      const response = await handler(event);

      expect(putItemSpy).toHaveBeenCalledWith({
        Item: {
          id: expect.any(String),
          title: requestBody.title,
          content: requestBody.content,
        },
        TableName: tableName,
      })

      expect(response).toEqual({
        statusCode: 201,
      });

      AWSMock.restore('DynamoDB.DocumentClient');
    });
  });

  describe("invalid request body", () => {
    it("should return status code 400", async () => {
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

</details>

## Integration Testing

### 📝 Task

Integration tests are super helpful to test the whole stack end-to-end. Write some integration tests that essentially send some HTTP requests and validate the response.

### 🔎 Hints

- [Method to extend the list of Projen tasks](https://github.com/projen/projen/blob/main/API.md#addtaskname-options-)
- [node-fetch is your friend for sending HTTP requests](https://www.npmjs.com/package/node-fetch)
- [Use environment variables to pass the API endpoint](https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the list of dependencies in the `.projenrc.js` configuration:
   ```js
   const project = new AwsCdkTypeScriptApp({
    // …
    deps: [
      'aws-sdk',
      'node-fetch@2'
    ],
    devDeps: [
      'esbuild@0',
      '@types/aws-lambda',
      'aws-sdk-mock',
      '@types/node-fetch'
    ],
    // …
  });
   ```
1. In addition, add a new task to the `.projenrc.js` configuration:
  ```js
  project.addTask('test:e2e', {
    exec: 'jest --testMatch "**/*.e2etest.ts"',
  })
  ```
1. Run `npm run projen` to install the new dependencies and re-generate the auto-generated files.
1. Create a new file:
   ```
   touch ./test/main.e2etest.ts
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
  ENDPOINT=https://XXXXXX.execute-api.eu-central-1.amazonaws.com npm run test:e2e
  ```

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab2).
