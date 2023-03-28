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

### AWS SSO 
If you are using an AWS SSO managed account, please follow the instructions for [short-term credentials for the AWS CLI](https://aws.amazon.com/blogs/security/aws-single-sign-on-now-enables-command-line-interface-access-for-aws-accounts-using-corporate-credentials/).

## Setting up Cloud9

If you don't want to invest time setting up a locally running development environment, then just set up a Cloud9 environment.

1. Log in to your AWS Console and go to [Cloud9](https://console.aws.amazon.com/cloud9/)
2. Click on the button **Create environment**
3. Choose a name (e.g. **Serverless Workshop**)
5. Select **m5.large** for **Instance type**. Keep the other settings.
6. Scroll down and click on **Create**
7. That's it. Your environment will be created.
8. Open your Cloud9 IDE and **enable hidden** files in the file explorer. See [documentation](https://docs.aws.amazon.com/cloud9/latest/user-guide/tour-ide.html#tour-ide-environment).
9. Go to Settings, scroll to the section **Experimental** and turn Auto-Save Files on. 
