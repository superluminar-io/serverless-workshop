# DynamoDB Streams

## In this lab …

- Learn how to create a DynamoDB streams and handle asynchronous operations
- Learn how to use dead letter queues for AWS Lambda functions

## DynamoDB Stream

### 📝 Task

First things first. We need a frontend app to deploy a static website. You can use whatever you want, we use [Create React App](https://github.com/facebook/create-react-app) in the step-by-step guide.

Create a frontend app in a new subfolder.

### 🔎 Hints

- [Creating a TypeScript app with Create React App](https://create-react-app.dev/docs/getting-started/#creating-a-typescript-app)

### 🗺  Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Run create-react-app to bootstrap a new CRA project:
  ```bash
  npx create-react-app frontend --template typescript
  ```

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
