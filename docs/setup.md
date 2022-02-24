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

If you can work with your already existing development setup, the AWS CLI needs access to your AWS account. To not override your default configuration, make sure you have configured your AWS CLI with a [named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-profiles) for this workshop.

If you are working with an already existing AWS SSO managed account, make sure you have configured your AWS CLI with a [named profile to use SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

### Configuring a named profile for the AWS CLI

1. Start the configuration by running:
```bash
aws configure --profile serverless-workshop
```
1. You will be one by one asked to provide your credentials for:
```
AWS Access Key ID [None]
AWS Secret Access Key [None]
Default region name [None]
Default output format [None]
```
⚠️ Make sure you use **eu-central-1** as your default region.

1. To easen things in the following labs, set the AWS_PROFILE environment variable to your named profile:
```bash
export AWS_PROFILE=serverless-workshop
```

You should now be able to execute this command:
```bash
aws sts get-caller-identity
```
[//]: # (TODO: Check + update)
### Configuring a named profile to use AWS SSO

1. Start the configuration by running:
```bash
aws configure sso
```
1. You will be asked to provide your credentials for:
```
SSO start URL [None]
SSO region [None]
```
1. The AWS CLI will try to open your browser and then start the login process for your AWS SSO account. 

    ⚠️ If you have several accounts and roles, please choose the right account and role in the terminal before continuing to step 4.
1. You will be one by one asked to provide your input for:
```
CLI default client Region [None]
CLI default output format [None]
CLI profile name [None]
```
⚠️ Make sure you use **eu-central-1** as your default region as well as a meaningful **CLI profile name**, e.g. serverless-workshop

1. To easen things in the following labs, set the AWS_PROFILE environment variable to your named profile:
```bash
export AWS_PROFILE=your-chosen-cli-profile-name
```

You should now be able to execute this command:
```bash
aws sts get-caller-identity
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
8. Enable hidden files in the file explorer. See [documentation](https://docs.aws.amazon.com/cloud9/latest/user-guide/tour-ide.html#tour-ide-environment).
