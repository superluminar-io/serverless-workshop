import * as AWS from 'aws-sdk';

export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
  const DB = new AWS.DynamoDB.DocumentClient();

  for (let record of event.Records) {
    if (record.eventName !== 'INSERT' || !record.dynamodb || !record.dynamodb.NewImage) {
      return;
    }

    const id = record.dynamodb.Keys?.id.S;
    const newImage = record.dynamodb.NewImage;
    const content = newImage.content?.S;
    const wordCount = content?.split(' ').length;

    await DB.update({
      Key: {
        id,
      },
      AttributeUpdates: {
        wordCount: {
          Value: wordCount,
        },
      },
      TableName: process.env.TABLE_NAME!,
    }).promise();
  }
};