const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.35.0',
  defaultReleaseBranch: 'main',
  name: 'lab5',
  github: false,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    'node-fetch@2',
    'fs-extra',
  ],
  devDeps: [
    '@types/aws-lambda',
    'aws-sdk-client-mock',
    '@types/node-fetch@2',
    '@types/fs-extra',
  ],
});

project.addTask('test:e2e', {
  exec: 'jest --testMatch "**/*.e2etest.ts"',
});
// Windows users might need this
project.jest.addTestMatch('**/?(*.)+(spec|test).ts?(x)');
project.jest.addIgnorePattern('.*/frontend/.*\\\.test\\\.[tj]sx?');
project.synth();