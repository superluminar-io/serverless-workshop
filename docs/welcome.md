# Frontend to Fullstack: A Serverless Workshop

## Welcome

This workshop is designed to help you expand your skillset beyond frontend know-how to fullstack serverless development with AWS. Together we will create the next greatest note-taking app. We will create a REST API with Amazon API Gateway, Lambda and DynamoDB. After creating the API, we will connect our frontend hosted on S3 to our serverless backend. Allong the way we try to identify best practices and antipatterns.

Let's get started! 🤩

## Architecture Diagram

The API enables us to create the next awesome notes app. With two routes in place, we can create a new note and list all notes. For both routes, we call Lambda functions and persist our data in a DynamoDB table.

![architecture diagram](./media/architecture.png)

## Prerequisites

- AWS account with admin permissions
- All step-by-step guides are written in English, we recommend selecting _English (US)_ as the language for the AWS console. You find the option in the footer of the console.

## Scope

- Infrastructure as Code with AWS CDK
- Simple Rest API with Amazon API Gateway
- Serverless computation with Lambda
- NoSql Database with DynamoDB
- Static Hosting with S3 and CloudFront

## Out of Scope

- Authentication / Authorization
- Custom Domain with SSL Cert
- Deep dive Testing, Monitoring, Logging and Tracing
