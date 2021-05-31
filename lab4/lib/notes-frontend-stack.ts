import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as cdk from "@aws-cdk/core";
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

interface Props extends cdk.StackProps {
  apiEndpoint: string;
}

export class NotesFrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: Props) {
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
                  REACT_APP_API_ENDPOINT=${props.apiEndpoint} npm --prefix ./frontend run build
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