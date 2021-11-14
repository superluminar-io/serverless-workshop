import * as AWS from 'aws-sdk';

export const handler = async () => {
  const DB = new AWS.DynamoDB.DocumentClient();

  const response = await DB.scan({
    TableName: process.env.TABLE_NAME!,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items),
  };
};