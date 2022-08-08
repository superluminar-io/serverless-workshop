import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';


export const handler = async (event: AWSLambda.DynamoDBStreamEvent) => {
  const DB = DynamoDBDocument.from(new DynamoDBClient({}));

  for (const record of event.Records) {
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
    });
  }
};