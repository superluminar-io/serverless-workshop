import { execSync } from 'child_process';
import * as path from 'path';
import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  CfnOutput,
  DockerImage,
  RemovalPolicy,
} from 'aws-cdk-lib';
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
