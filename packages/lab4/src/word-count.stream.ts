import * as AWS from 'aws-sdk';

export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
  const DB = new AWS.DynamoDB.DocumentClient();
  const tableName = process.env.TABLE_NAME!;

  for (const record of event.Records) {
    if (record.eventName !== 'INSERT' || !record.dynamodb) {
      return;
    }

    const id = record.dynamodb.Keys!.id.S!;
    const content = record.dynamodb.NewImage!.content.S!;
    const wordCount = content.split(' ').length;

    await DB.update({
      Key: {
        id,
      },
      AttributeUpdates: {
        wordCount: {
          Value: wordCount,
        },
      },
      TableName: tableName,
    }).promise();
  }
};