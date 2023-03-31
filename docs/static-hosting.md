# Static Hosting

## In this lab …

- Learn how to deploy your new beautiful static notes app (or single page applications) with AWS
- Learn how to pass environment variables to your frontend application

## Frontend Application

### 📝 Task

First things first. We need a frontend app to deploy a static website. You can use whatever you want, we use [Create React App](https://github.com/facebook/create-react-app) in the step-by-step guide.

Create a frontend app in a new subfolder.

### 🔎 Hints

- [Creating a TypeScript app with Create React App](https://create-react-app.dev/docs/getting-started/#creating-a-typescript-app)

### 🗺  Step-by-Step Guide

%% TODO: Do we want to pull here the app from verena and anne?
1. Clone the example app to the directory **frontend** to bootstrap a new CRA project:
  ```bash
  git clone GITHUBXXXXX/frontend ~/notes-api/frontend
  ```
%% TODO: The .env file will be there or??
%% 1. Create a `.env` file inside the frontend folder:
%%   ```bash
%%   touch frontend/.env
%%   ```
%% 1. Set the environment variable in the `.env` file to disable Jest version checking:
%%   ```
%%   SKIP_PREFLIGHT_CHECK=true 
%%   ```
1. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```
   Go to http://localhost:3000 and enjoy the app!

%% TODO: TO DISCUSS either we cut this or we explain that ec2 need permission and add the secgroup 

## CloudFormation Stack

### 📝 Task

Now that we have created a frontend app, we want to extend the infrastructure to deploy the frontend app.

Create a new CloudFormation stack for the static hosting. The stack should include a S3 bucket for the assets, a CloudFront distributon and deployment steps to bundle the frontend assets.

### 🔎 Hints

- [Documentation AWS CDK Stacks](https://docs.aws.amazon.com/cdk/latest/guide/stacks.html)
- [AWS Construct to deploy a S3 bucket with CloudFront distribution and cache invalidation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment-readme.html#cloudfront-invalidation)
- [Documentation Invalidating Files in CloudFront (watch out for solutions to invalidate all files)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
- [Bundle JS assets locally with AWS CDK S3 Deployment (scroll down to the last section)](https://aws.amazon.com/blogs/devops/building-apps-with-aws-cdk/)

### 🗺  Step-by-Step Guide

1. Extend the list of CDK dependencies in the `.projenrc.js` configuration. The final file should look like this:
   ```js
   const { awscdk, javascript } = require('projen');
   const project = new awscdk.AwsCdkTypeScriptApp({
     cdkVersion: '2.1.0',
     defaultReleaseBranch: 'main',
     github: false,
     name: 'notes-api',
     packageManager: javascript.NodePackageManager.NPM,
     deps: [
       '@aws-sdk/client-dynamodb',
       '@aws-sdk/lib-dynamodb',
       'aws-sdk',
       'fs-extra',
     ],
     devDeps: [
       '@types/aws-lambda',
       '@types/fs-extra',
     ],
   });

   project.synth();
    ```
1. Run `npm run projen` in the root project to install the new dependencies and re-generate the auto-generated files.
1. Create a file for the new construct:
   ```bash
   touch ./src/static-hosting.ts 
   ```
1. Open the file and paste the following code:
    ```typescript 
    import { execSync } from 'child_process';
    import * as path from 'path';
    import { 
      aws_cloudfront as cloudfront, 
      aws_cloudfront_origins as origins, 
      aws_s3 as s3, 
      aws_s3_deployment as s3deploy, 
      CfnOutput, 
      DockerImage, 
      RemovalPolicy } from 'aws-cdk-lib';
    import { Construct } from 'constructs';
    import * as fs from 'fs-extra';

    export class StaticHosting extends Construct {
      constructor(scope: Construct, id: string) {
        super(scope, id);

        const bucket = new s3.Bucket(this, 'frontend', {
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const distribution = new cloudfront.Distribution(
          this,
          'frontend-distribution',
          {
            defaultBehavior: { origin: new origins.S3Origin(bucket) },
            defaultRootObject: 'index.html',
          },
        );

        new s3deploy.BucketDeployment(this, 'frontend-deployment', {
          sources: [
            s3deploy.Source.asset(path.join(__dirname, '../frontend'), {
              bundling: {
                local: {
                  tryBundle(outputDir) {
                    try {
                      execSync('npm --version');
                    } catch {
                      return false;
                    }

                    execSync(`
                        npm --prefix ./frontend i &&
                        npm --prefix ./frontend run build
                      `);

                    fs.copySync(
                      path.join(__dirname, '../frontend', 'build'),
                      outputDir,
                    );

                    return true;
                  },
                },
                image: DockerImage.fromRegistry('node:lts'),
                command: [],
              },
            }),
          ],
          destinationBucket: bucket,
          distribution,
          distributionPaths: ['/*'],
        });

        new CfnOutput(this, 'FrontendURL', {
          value: `https://${distribution.distributionDomainName}`,
        });
      }
    }
    ```
1. Update the main stack in the `./src/main.ts` file:
   ```typescript
   import { App, Stack, StackProps } from 'aws-cdk-lib';
   import { Construct } from 'constructs';
   import { RestApi } from './rest-api';
   import { StaticHosting } from './static-hosting';

   export class MyStack extends Stack {
      constructor(scope: Construct, id: string, props: StackProps = {}) {
      super(scope, id, props);

      const restApi = new RestApi(this, 'rest-api');

      new StaticHosting(this, 'static-hosting');
    }
  }
  ```
  ⚠️Important: Only update the imports and the class. Everything below the class should be the same.
1. Deploy the latest changes:
   ```bash
   npm run deploy
   ```
1. Get the frontend URL from the CloudFormation output and visit the site.

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/fullstack-serverless-workshop/tree/main/packages/lab2).
