const { awscdk, javascript } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'lab4',
  github: false,
  packageManager: javascript.NodePackageManager.NPM,
  deps: [
    'aws-sdk',
  ],
  devDeps: [
    '@types/aws-lambda',
  ],
});
project.synth();