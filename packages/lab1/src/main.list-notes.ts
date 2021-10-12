import * as AWS from 'aws-sdk';

const DB = new AWS.DynamoDB.DocumentClient();

export const handler = async () => {
  const response = await DB.scan({
    TableName: process.env.TABLE_NAME!,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items),
  };
};