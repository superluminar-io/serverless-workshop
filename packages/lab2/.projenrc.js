const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.35.0',
  defaultReleaseBranch: 'main',
  name: 'lab2',
  github: false,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    'node-fetch@2.6.1',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
  ],
  devDeps: [
    '@types/aws-lambda',
    '@types/node-fetch@2',
    'aws-sdk-client-mock',
  ],
});

project.addTask('test:e2e', {
  exec: 'jest --testMatch "**/*.e2etest.ts"',
});
// Windows users might need this
project.jest.addTestMatch('**/?(*.)+(spec|test).ts?(x)');
project.synth();
