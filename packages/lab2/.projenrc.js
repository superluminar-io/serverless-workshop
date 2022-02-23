const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'lab2',
  github: false,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    'aws-sdk',
    'node-fetch@2',
  ],
  devDeps: [
    '@types/aws-lambda',
    'aws-sdk-mock',
    '@types/node-fetch@2',
  ],
});

project.addTask('test:e2e', {
  exec: 'jest --testMatch "**/*.e2etest.ts"',
});

project.synth();
