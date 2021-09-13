# Serverless Workshop

## Welcome

This workshop is designed to give you an overview of serverless development with AWS. We will create a REST API with Amazon API Gateway, Lambda and DynamoDB. After creating the API, we will break the system in an interactive GameDay session and try to identify best practices and antipatterns along the way.

Let's get started! 🤩

## Architecture Diagram

The API enables us to create the next awesome notes app. With two routes in place, we can create a new note and list all notes. For both routes, we call Lambda functions and persist our data in a DynamoDB table.

![architecture diagram](./media/architecture.png)

## Prerequisites

- AWS account with admin permissions
- All step-by-step guides are written in English, we recommend selecting _English (US)_ as the language for the AWS console. You find the option in the footer of the console.

## Scope

- Infrastructure as Code with AWS CDK
- Simple Rest API with Amazon API Gateway, Lambda and DynamoDB
- Unit & Integration Testing
- Mini GameDay
- Static Hosting with S3 and CloudFront

## Out of Scope

- Authentication / Authorization
- Custom Domain with SSL Cert
- Deep dive Monitoring, Logging and Tracing
