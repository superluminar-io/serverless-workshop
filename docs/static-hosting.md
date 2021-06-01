# Static Hosting

## In this lab …

- Learn how to deploy static websites (or single page applications) with AWS
- Learn how to pass environment variables to the frontend application

## Frontend Application

### Task

First things first. We need a frontend app to deploy a static website. You can use whatever you want, we use [Create React App](https://github.com/facebook/create-react-app) in the step-by-step guide.

Create a frontend app in a new subfolder.

### Hints

- [Creating a TypeScript app with Create React App](https://create-react-app.dev/docs/getting-started/#creating-a-typescript-app)

### Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Run create-react-app to bootstrap a new CRA project:
   ```bash
   npx create-react-app frontend --template typescript
   ```
2. Pinpoint Jest version so we use the same version for the CDK project as well as for the frontend application:
   ```bash
   npm install jest@26.6.0 --save-dev
   ```
3. Feel free to go into the frontend folder and start the application:
   ```bash
   cd frontend
   npm start
   ```
   Go to http://localhost:3000 and enjoy the app!

</details>

## CloudFormation Stack

### Task

Now that we have created a frontend app, we want to extend the infrastructure to deploy the frontend app.

Create a new CloudFormation stack for the static hosting. The stack should include a S3 bucket for the assets, a CloudFront distributon and deployment steps to bundle the frontend assets.

### Hints

- [Documentation AWS CDK Stacks](https://docs.aws.amazon.com/cdk/latest/guide/stacks.html)
- [AWS Construct to deploy a S3 bucket with CloudFront distribution and cache invalidation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html#cloudfront-invalidation)
- [Documentation Invalidating Files in CloudFront (watch out for solutions to invalidate all files)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
- [Bundle JS assets locally with AWS CDK S3 Deployment (scroll down to the last section)](https://aws.amazon.com/blogs/devops/building-apps-with-aws-cdk/)

### Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Install new dependencies (in the root directory of your project):
   ```bash
   npm install @aws-cdk/aws-s3-deployment @aws-cdk/aws-cloudfront-origins @aws-cdk/aws-cloudfront fs-extra
   npm install @types/fs-extra --save-dev
   ```
1. Go to the `lib` folder and create a new file:
   ```bash
   touch lib/notes-frontend-stack.ts
   ```
1. Add the following code to the new file:

   ```typescript
   import { execSync } from "child_process";
   import * as path from "path";
   import * as fs from "fs-extra";
   import * as cdk from "@aws-cdk/core";
   import * as s3 from "@aws-cdk/aws-s3";
   import * as cloudfront from "@aws-cdk/aws-cloudfront";
   import * as origins from "@aws-cdk/aws-cloudfront-origins";
   import * as s3deploy from "@aws-cdk/aws-s3-deployment";

   export class NotesFrontendStack extends cdk.Stack {
     constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

       const bucket = new s3.Bucket(this, "NotesFrontend", {
         removalPolicy: cdk.RemovalPolicy.DESTROY,
         autoDeleteObjects: true,
       });

       const distribution = new cloudfront.Distribution(
         this,
         "NotesFrontendDistribution",
         {
           defaultBehavior: { origin: new origins.S3Origin(bucket) },
           defaultRootObject: "index.html",
         }
       );

       new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
         sources: [
           s3deploy.Source.asset(path.join(__dirname, "../frontend"), {
             bundling: {
               local: {
                 tryBundle(outputDir) {
                   try {
                     execSync("npm --version");
                   } catch {
                     return false;
                   }

                   execSync(`
                  npm --prefix ./frontend i && 
                  npm --prefix ./frontend run build
                `);
                   fs.copySync(
                     path.join(__dirname, "../frontend", "build"),
                     outputDir
                   );

                   return true;
                 },
               },
               image: cdk.DockerImage.fromRegistry("node:lts"),
               command: [],
             },
           }),
         ],
         destinationBucket: bucket,
         distribution,
         distributionPaths: ["/*"],
       });

       new cdk.CfnOutput(this, "URL", {
         value: `https://${distribution.distributionDomainName}`,
       });
     }
   }
   ```

1. Go to the file `bin/notes-api.ts` and add the following code:

   ```typescript
   #!/usr/bin/env node
   import "source-map-support/register";
   import * as cdk from "@aws-cdk/core";
   import { NotesApiStack } from "../lib/notes-api-stack";
   import { NotesFrontendStack } from "../lib/notes-frontend-stack";

   const app = new cdk.App();
   new NotesApiStack(app, "NotesApiStack");
   new NotesFrontendStack(app, "NotesFrontendStack");
   ```

1. Deploy the new CloudFormation stack:
   ```bash
   npx cdk deploy NotesFrontendStack
   ```

</details>

### Questions

- What is the impact of the S3 bucket configuration?
- What are the differences between static hosting with CloudFront and an S3 bucket with _static website hosting_ enabled?
- How do we manage cache invalidation?

## Environment Variables

### Task

This task is tricky and it's okay to jump right into the step-by-step guide. We deployed the frontend app succesfully, but to build the next awesome notes app, we actually need to know the API endpoint. For that, we need to pass the API endpoint to the bundle process to include the URL in the JS assets.

### Hints

- [Environment variables with Create React App](https://create-react-app.dev/docs/adding-custom-environment-variables/)

### Step-by-Step Guide

<details>
<summary>Collapse guide</summary>

1. Extend the CloudFormation stack (`lib/notes-frontend-stack.ts`):

   ```diff
    import { execSync } from 'child_process';
    import * as path from 'path';
    import * as fs from 'fs-extra';
    import * as cdk from "@aws-cdk/core";
    import * as s3 from '@aws-cdk/aws-s3';
    import * as cloudfront from '@aws-cdk/aws-cloudfront';
    import * as origins from '@aws-cdk/aws-cloudfront-origins';
    import * as s3deploy from '@aws-cdk/aws-s3-deployment';

   +interface Props extends cdk.StackProps {
   +  apiEndpoint: string;
   +}
   +
    export class NotesFrontendStack extends cdk.Stack {
   -  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
   +  constructor(scope: cdk.Construct, id: string, props: Props) {
       super(scope, id, props);

       const bucket = new s3.Bucket(this, 'NotesFrontend', {
       removalPolicy: cdk.RemovalPolicy.DESTROY,
       autoDeleteObjects: true,
       });

       const distribution = new cloudfront.Distribution(this, 'NotesFrontendDistribution', {
       defaultBehavior: { origin: new origins.S3Origin(bucket) },
       defaultRootObject: 'index.html'
       });

       new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
       sources: [
           s3deploy.Source.asset(path.join(__dirname, '../frontend'), {
           bundling: {
               local: {
               tryBundle(outputDir) {
                   try {
                   execSync('npm --version');
                   } catch {
                   return false
                   }

                   execSync(`
                   npm --prefix ./frontend i &&
   -                  npm --prefix ./frontend run build
   +                  REACT_APP_API_ENDPOINT=${props.apiEndpoint} npm --prefix ./frontend run build
                   `);
                   fs.copySync(path.join(__dirname, '../frontend', 'build'), outputDir);

                   return true;
               }
               },
               image: cdk.DockerImage.fromRegistry('node:lts'),
               command: [],
           }
           })
       ],
       destinationBucket: bucket,
       distribution,
       distributionPaths: ['/*'],
       });

       new cdk.CfnOutput(this, "URL", { value: `https://${distribution.distributionDomainName}` });
      }
    }
   ```

1. Update the file `bin/notes-api.ts`:

   ```diff
    #!/usr/bin/env node
    import "source-map-support/register";
    import * as cdk from "@aws-cdk/core";
    import { NotesApiStack } from "../lib/notes-api-stack";
    import { NotesFrontendStack } from "../lib/notes-frontend-stack";

    const app = new cdk.App();
    new NotesApiStack(app, "NotesApiStack");
   -new NotesFrontendStack(app, "NotesFrontendStack");
   +new NotesFrontendStack(app, "NotesFrontendStack", {
   +   apiEndpoint: process.env.API_ENDPOINT!
   +});
   ```

1. Update the file `frontend/src/App.tsx`:

   ```diff
    import React from 'react';
    import logo from './logo.svg';
    import './App.css';

    function App() {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
   +        <p>{process.env.REACT_APP_API_ENDPOINT}</p>
          </header>
        </div>
      );
    }

    export default App;
   ```

1. Deploy the frontend stack and provide the API endpoint:
   ```bash
   API_ENDPOINT=https://XXXXXXXXX.execute-api.eu-central-1.amazonaws.com npx cdk deploy NotesFrontendStack
   ```

</details>

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab4).
