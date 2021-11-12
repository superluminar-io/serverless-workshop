import * as AWS from 'aws-sdk';

export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
  const sns = new AWS.SNS({apiVersion: '2010-03-31'});
  const topicArn = process.env.TOPIC_ARN;

  for (let record of event.Records) {
    if (record.eventName !== 'INSERT' || !record.dynamodb) {
      return;
    }

    const id = record.dynamodb.Keys?.id.S;
    const content = record.dynamodb.NewImage?.content.S;
    const title = record.dynamodb.NewImage?.title.S;

    const message = {
      id,
      content,
      title
    }
   
    await sns.publish({
      Message: JSON.stringify(message),
      TopicArn: topicArn,
    }).promise()
  }
};