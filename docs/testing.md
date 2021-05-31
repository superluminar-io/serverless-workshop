# Testing

## In this lab …

- Write unit tests for AWS lambda functions
- Write integration tests for the REST API

## Unit Testing

### Task

Write unit tests for the AWS Lambda functions. Running the command `npm test` should execute your unit tests and pass all tests.

### Hints

- [Mock the DynamoDB DocumentClient with Jest](https://stackoverflow.com/a/60478596)

### Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Delete the test file created by AWS CDK:
   ```bash
   rm ./test/notes-api.test.ts
   ```
1. Create a new folder:
   ```bash
   mkdir ./test/src
   ```
1. Create a new file:

   ```bash
   touch ./test/src/listNotes.test.ts
   ```

1. Add the following code to the test file:

   ```typescript
   const scanSpy = jest.fn();
   jest.mock("aws-sdk", () => ({
     DynamoDB: {
       DocumentClient: jest.fn(() => ({
         scan: scanSpy,
       })),
     },
   }));

   import { handler } from "../../src/listNotes";

   beforeAll(() => {
     process.env.TABLE_NAME = "foo";
   });

   afterEach(() => {
     jest.resetAllMocks();
   });

   it("should return notes", async () => {
     const item = {
       id: "2021-04-12T18:55:06.295Z",
       title: "Hello World",
       content: "Minim nulla dolore nostrud dolor aliquip minim.",
     };

     scanSpy.mockImplementation(() => ({
       promise() {
         return Promise.resolve({ Items: [item] });
       },
     }));

     const response = await handler();

     expect(response).toEqual({
       statusCode: 200,
       body: JSON.stringify([item]),
     });
   });
   ```

1. Create a new file:

   ```bash
   touch test/src/putNotes.test.ts
   ```

1. Add the following code to the test file:

   ```typescript
   const putSpy = jest.fn();
   jest.mock("aws-sdk", () => ({
     DynamoDB: {
       DocumentClient: jest.fn(() => ({
         put: putSpy,
       })),
     },
   }));

   import { APIGatewayProxyEvent } from "aws-lambda";
   import { handler } from "../../src/putNote";

   beforeAll(() => {
     process.env.TABLE_NAME = "foo";
   });

   afterEach(() => {
     jest.resetAllMocks();
   });

   describe("valid request", () => {
     it("should return status code 201", async () => {
       const requestBody = {
         title: "Hello World",
         content: "Minim nulla dolore nostrud dolor aliquip minim.",
       };

       putSpy.mockImplementation(() => ({
         promise() {
           return Promise.resolve();
         },
       }));

       const event = {
         body: JSON.stringify(requestBody),
       } as APIGatewayProxyEvent;
       const response = await handler(event);

       expect(response).toEqual({
         statusCode: 201,
       });
     });
   });

   describe("invalid request body", () => {
     it("should return status code 400", async () => {
       const response = await handler({} as APIGatewayProxyEvent);

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

### Task

Integration tests are super helpful to test the whole stack end-to-end. Write some integration tests that essentially send some HTTP requests and validate the response.

### Hints

- [Separating unit and integration tests in Jest](https://medium.com/coding-stones/separating-unit-and-integration-tests-in-jest-f6dd301f399c)
- [node-fetch is your friend for sending HTTP requests](https://www.npmjs.com/package/node-fetch)
- [Use environment variables to pass the API endpoint](https://www.twilio.com/blog/working-with-environment-variables-in-node-js-html)

### Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Install dependencies:
   ```bash
   npm install node-fetch @types/node-fetch --save-dev
   ```
1. Create a new folder:
   ```
   mkdir ./integration
   ```
1. Create a new file:
   ```
   touch ./integration/api.test.ts
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

1. Create a new file:
   ```bash
   touch jest.integration.config.js
   ```
1. Add the following code to the file:

   ```typescript
   module.exports = {
     roots: ["<rootDir>/integration"],
     testMatch: ["**/*.test.ts"],
     transform: {
       "^.+\\.tsx?$": "ts-jest",
     },
   };
   ```

1. Add this line to `.gitignore`:
   ```
   !jest.integration.config.js
   ```
1. Add a new script for integration tests to the `package.json`:
   ```json
   "scripts": {
       "build": "tsc",
       "watch": "tsc -w",
       "test": "jest",
       "cdk": "cdk",
       "integration": "jest -c jest.integration.config.js"
   },
   ```
1. Run the integration tests:
   ```bash
   ENDPOINT=https://XXXXXX.execute-api.eu-central-1.amazonaws.com npm run integration
   ```

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/lab2).
