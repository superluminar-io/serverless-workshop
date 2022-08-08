const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.35.0',
  defaultReleaseBranch: 'main',
  name: 'lab1',
  github: false,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
  ],
  devDeps: [
    '@types/aws-lambda',
  ],
});
// Windows users need this
project.jest.addTestMatch('**/?(*.)+(spec|test).ts?(x)');
project.synth();