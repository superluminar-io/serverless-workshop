import * as AWS from 'aws-sdk';

export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
  var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

  for (let record of event.Records) {
    if (record.eventName !== 'INSERT' || !record.dynamodb) {
      return;
    }

    const id = record.dynamodb.Keys?.id.S;
    const message = {
      noteId: id,
    }
   
    await sqs.sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: process.env.QUEUE_URL!,
    }).promise();
  }
};