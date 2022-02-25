import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi } from './rest-api';
import { StaticHosting } from './static-hosting';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    new RestApi(this, 'rest-api');

    new StaticHosting(this, 'static-hosting');
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