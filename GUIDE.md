# Trainer's Guide

## About this document

The trainer's guide provides guidance on how to plan, prepare, and give the serverless workshop. The document assumes the serverless workshop takes place remotely.

## Before the workshop

### Invitation

Right after the assignment, we write an email to the event organizer to clarify a few things and prepare the invitation for the attendees. 

What we need to check:
- Are Google Meet and Miro okay in your organisation or do we need to consider something?
- Shall we provide AWS accounts for the attendees, or do you provide them? An ideal scenario would be individual playground accounts per attendee, but we can also manage them in one AWS account. Either way, the attendees need admin rights.
- Shall we invite the attendees, or do you create a calendar invitation? If we invite them, please provide the list of attendees.

Template for the email:

```txt
Hi [name], 

my name is [name], and I will be your trainer for the serverless workshop. My colleague [name] joins me.

Before the workshop, we need to check a few things with you:

1. We use some online tools during the workshop to create a lively remote experience. Are Google Meet and Miro okay in your organization, or do we need to consider something?

2. For the hands-on sessions, we use AWS accounts to provision infrastructure and play around in the AWS management console. Shall we provide AWS accounts for the attendees, or do you provide them? An ideal scenario would be individual playground accounts per attendee, but we can also manage them in one AWS account. Either way, the attendees need admin rights.

3. Shall we invite the attendees, or do you send out a calendar invitation? We usually schedule a meeting from 9am to 5pm CE(S)T. Is that okay for you? Could you please provide the list of attendees?

I am looking forward to hearing from you. 

Best, 

[name]
```

Template for the calendar invitation:

```txt
Hello everyone, 

my name is [name] and I'm your trainer for the serverless workshop. My colleague [name] joins me. To join the session, please click on the Google Meet link in the calendar invitation.

The workshop includes hands-on sessions, where we play around with AWS services, deploy infrastructure directly from our computers, and click around in the AWS management console. 

Therefore, we kindly ask you to prepare some tools on your computer:

- IDE (e.g. VS Code)
- Terminal (e.g. iTerm or Integrated Terminal in VS Code)
- Node.js (v16)
- AWS CLI

In any case, we can also provide cloud-based IDEs as an alternative.

If you have questions or problems with the setup, don’t hesitate to write me an e-mail ([email address]). 

See you, 

[name]
```

### Meeting w/ organizer

One week before the workshop, we schedule an informal 30-minutes meeting with the organizer. 

We can use the meeting to:
- Talk about the workshop agenda, the labs, and the Miro board
- Discuss open questions
- Get to know each other
- Double-check everything (like the AWS accounts)

### Quick reminder right before the workshop

One day before the workshop, we send a quick reminder to the attendees. 

Template for the email:

```txt
Hello everyone, 

tomorrow is our serverless workshop. The event will take place remotely. Please join the session by clicking on the Google Meet link attached to the calendar invitation.

To get the most out of the workshop, we recommend to prepare your computer and install some tools. We will use the tools to deploy and update infrastructure directly from our computers.

Prerequisites:
- IDE (e.g. VS Code)
- Terminal (e.g. iTerm or Integrated Terminal in VS Code)
- Node.js (v16)
- AWS CLI

Don’t worry if you can’t prepare your computer, we can also find alternatives with cloud-based IDEs.

See you tomorrow, 

[name]
```

## During the workshop

### Hello World Example

Before going straight to the labs, we found it very helpful to take the time and explain AWS Lambda and CloudFormation shortly. Feel free to follow the steps described here and create a simple hello world example. You can demonstrate the following steps directly on your computer. 

1. Go to the [AWS Lambda Console](https://console.aws.amazon.com/lambda)
2. Click on **Create function**
3. Enter a function name and click on **Create function**
4. Click on the tab **Test** and on the button **Test**
5. Explain the execution and everything visible under **Details**.

At this point, we showcased the essentials of AWS Lambda. You can now continue with the example and create a simple trigger. 

1. Click on **Add trigger**
2. Select **API Gateway**, **Create a new API** and **Open**
3. Click on **Add**
4. Copy the API endpoint and open it in the browser
5. You should see the **Hello from Lambda** message

Take the time and explain the connection between API Gateway and Lambda. 

After that, we take the exact same example and create the resources using AWS CloudFormation. You find two CloudFormation templates in the `./templates` folder. Go to the [CloudFormation console](https://console.aws.amazon.com/cloudformation) and create a new stack. 

### Questions for Lab 1

#### AWS Lambda function

- What resources did you create and why?
- How can you execute the AWS Lambda function using the AWS Management Console?
- Where can you find the log output?

#### Amazon API Gateway

- What is a stack's output and where do you find it?
- What is the response format for AWS Lambda functions when using them with Amazon API Gateway?
- What are the limits for an Amazon API Gateway HTTP API?

#### AWS DynamoDB

- Where do you see the environment variables of the AWS Lambda function using the AWS Management Console?
- When deleting the CloudFormation stack by accident, would the DynamoDB table be removed or not?
- Why is the AWS Lambda function allowed to send requests to the DynamoDB table?
- Why is the partition key enough to create a DynamoDB table instead of a schema?
- What is the maximum size of a note's content?

#### Fetch list of notes

- How many notes are returned in the worst case?
- What is the difference between a DynamoDB Scan and Query operation?

### Questions for Lab 4

#### DynamoDB Stream

- What stream types can we configure for the DynamoDB stream, and what are the benefits?
- What is the default batch size, and what do we need to consider for the AWS lambda function configuration?
- What are secenarios where retry policies for DynamoDB streams might be helpful? 
- What happens with the event assuming the AWS Lambda function fails?

### Questions for Lab 5

- What is the impact of the S3 bucket configuration?
- What are the differences between static hosting with CloudFront and an S3 bucket with _static website hosting_ enabled?
- How do we manage cache invalidation?

## After the workshop

_tbd_
