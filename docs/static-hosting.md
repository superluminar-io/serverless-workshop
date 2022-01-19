# Static Hosting

## In this lab …

- Learn how to deploy static websites (or single page applications) with AWS
- Learn how to pass environment variables to the frontend application

## Frontend Application

### 📝 Task

First things first. We need a frontend app to deploy a static website. You can use whatever you want, we use [Create React App](https://github.com/facebook/create-react-app) in the step-by-step guide.

Create a frontend app in a new subfolder.

### 🔎 Hints

- [Creating a TypeScript app with Create React App](https://create-react-app.dev/docs/getting-started/#creating-a-typescript-app)

### 🗺  Step-by-Step Guide

1. Run create-react-app to bootstrap a new CRA project:
  ```bash
  npx create-react-app frontend --template typescript
  ```
1. Create a `.env` file inside the frontend folder:
  ```bash
  touch frontend/.env
  ```
1. Set the environment variable in the `.env` file to disable Jest version checking:
  ```
  SKIP_PREFLIGHT_CHECK=true 
  ```
1. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```
   Go to http://localhost:3000 and enjoy the app!


## CloudFormation Stack

### 📝 Task

Now that we have created a frontend app, we want to extend the infrastructure to deploy the frontend app.

Create a new CloudFormation stack for the static hosting. The stack should include a S3 bucket for the assets, a CloudFront distributon and deployment steps to bundle the frontend assets.

### 🔎 Hints

- [Documentation AWS CDK Stacks](https://docs.aws.amazon.com/cdk/latest/guide/stacks.html)
- [AWS Construct to deploy a S3 bucket with CloudFront distribution and cache invalidation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-s3-deployment-readme.html#cloudfront-invalidation)
- [Documentation Invalidating Files in CloudFront (watch out for solutions to invalidate all files)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
- [Bundle JS assets locally with AWS CDK S3 Deployment (scroll down to the last section)](https://aws.amazon.com/blogs/devops/building-apps-with-aws-cdk/)

### 🗺  Step-by-Step Guide

1. Extend the list of CDK dependencies in the `.projenrc.js` configuration:
  ```js
   const project = new AwsCdkTypeScriptApp({
    // …
    cdkDependencies: [
      '@aws-cdk/aws-lambda-nodejs',
      '@aws-cdk/aws-apigatewayv2',
      '@aws-cdk/aws-apigatewayv2-integrations',
      '@aws-cdk/aws-dynamodb',
      '@aws-cdk/aws-s3-deployment',
      '@aws-cdk/aws-cloudfront-origins',
      '@aws-cdk/aws-cloudfront',
    ],
    deps: [
      'aws-sdk',
      'node-fetch@2',
      'fs-extra',
    ],
    devDeps: [
      'esbuild@0',
      '@types/aws-lambda',
      'aws-sdk-mock',
      '@types/node-fetch',
      '@types/fs-extra',
    ],
    // …
  });
   ```
1. Run `npm run projen` in the root project to install the new dependencies and re-generate the auto-generated files.
1. Extend the CloudFormation stack in the `./src/main.ts` file:
   ```typescript
   // … (imports from previous labs)
   import { execSync } from 'child_process';
   import * as path from 'path';
   import * as cloudfront from '@aws-cdk/aws-cloudfront';
   import * as origins from '@aws-cdk/aws-cloudfront-origins';
   import * as s3 from '@aws-cdk/aws-s3';
   import * as s3deploy from '@aws-cdk/aws-s3-deployment';
   import * as fs from 'fs-extra';

   export class MyStack extends Stack {
     constructor(scope: Construct, id: string, props: StackProps = {}) {
       super(scope, id, props);

       // … (resources from previous labs)

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
1. Deploy the latest changes:
   ```bash
   npm run deploy
   ```
1. Get the frontend URL from the CloudFormation output and visit the site.

### ❓ Questions

- What is the impact of the S3 bucket configuration?
- What are the differences between static hosting with CloudFront and an S3 bucket with _static website hosting_ enabled?
- How do we manage cache invalidation?

---

You can find the complete implementation of this lab [here](https://github.com/superluminar-io/serverless-workshop/tree/main/packages/lab5).
