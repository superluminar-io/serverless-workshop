# Setup

## In this lab …

- Setup development environment (local or Cloud9)

## Local development setup

For this workshop, we rely on a basic development setup, including:

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- [Node.js / NPM](https://nodejs.org/en/)
- Editor (e.g. [Visual Studio Code](https://code.visualstudio.com/))
- Terminal (e.g. [iTerm2](https://iterm2.com/) or PowerShell)

Make sure you have installed and configured all dependencies on your computer. If you need to create a completely new development setup on your machine, then we recommend Cloud9 as a cloud-based development experience. Cloud9 works well with AWS and comes with all dependencies pre-installed.

The AWS CLI needs access to your AWS account. Make sure you have either configured your [AWS CLI to use an AWS SSO profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) or added some [short-living environment variables](https://aws.amazon.com/blogs/security/aws-single-sign-on-now-enables-command-line-interface-access-for-aws-accounts-using-corporate-credentials/) to your terminal. You should be able to execute this command:

```bash
$ > aws sts get-caller-identity
```

Lastly, make sure you have set the AWS region:

```bash
export AWS_REGION=eu-central-1
```

## Setting up Cloud9

If you don't want to invest time setting up a locally running development environment, then just set up a Cloud9 environment.

1. Log in to your AWS Console and go to [Cloud9](https://console.aws.amazon.com/cloud9/)
2. Click on the button **Create environment**
3. Choose a name (e.g. **Serverless Workshop**)
4. Click on **Next step**
5. Keep the default settings and click on **Next step**
6. Scroll down and click on **Create environment**
7. That's it. You should arrive in the Cloud9 editor.
