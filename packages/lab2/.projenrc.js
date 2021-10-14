const { AwsCdkTypeScriptApp, NodePackageManager } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'lab2',
  github: false,
  packageManager: NodePackageManager.NPM,
  cdkDependencies: [
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-apigatewayv2',
    '@aws-cdk/aws-apigatewayv2-integrations',
    '@aws-cdk/aws-dynamodb',
  ],
  deps: [
    'aws-sdk',
    'node-fetch@2',
  ],
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'esbuild@0',
    '@types/aws-lambda',
    'aws-sdk-mock',
    '@types/node-fetch',
  ],
  // packageName: undefined,      /* The "name" in package.json. */
  // release: undefined,          /* Add release management to this project. */
});

project.addTask('test:e2e', {
  exec: 'jest --testMatch "**/*.e2etest.ts"',
});

project.synth();