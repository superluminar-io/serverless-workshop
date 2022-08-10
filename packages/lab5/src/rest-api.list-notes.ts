import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export const handler = async () => {
  const DB = DynamoDBDocument.from(new DynamoDBClient({}));

  const response = await DB.scan({
    TableName: process.env.TABLE_NAME!,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items),
  };
};