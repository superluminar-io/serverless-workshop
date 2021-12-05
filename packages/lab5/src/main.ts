import { execSync } from 'child_process';
import * as path from 'path';

import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as apigatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import { App, Construct, Stack, StackProps, CfnOutput, RemovalPolicy, DockerImage } from '@aws-cdk/core';
import * as fs from 'fs-extra';
import * as lambdaNodeJs from "@aws-cdk/aws-lambda-nodejs";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const notesTable = new dynamodb.Table(this, 'notes-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    const putNote = new lambdaNodeJs.NodejsFunction(this, 'put-note', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    const listNotes = new lambdaNodeJs.NodejsFunction(this, 'list-notes', {
      environment: {
        TABLE_NAME: notesTable.tableName,
      },
    });

    notesTable.grant(putNote, 'dynamodb:PutItem');
    notesTable.grant(listNotes, 'dynamodb:Scan');

    const putNoteIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: putNote,
    });

    const listNotesIntegration = new apigatewayIntegrations.LambdaProxyIntegration({
      handler: listNotes,
    });

    const httpApi = new apigateway.HttpApi(this, 'http-api');

    httpApi.addRoutes({
      path: '/notes',
      methods: [apigateway.HttpMethod.POST],
      integration: putNoteIntegration,
    });

    httpApi.addRoutes({
      path: '/notes',
      methods: [apigateway.HttpMethod.GET],
      integration: listNotesIntegration,
    });

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

    new CfnOutput(this, 'URL', { value: httpApi.apiEndpoint });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();