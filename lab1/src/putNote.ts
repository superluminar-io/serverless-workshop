import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent } from "aws-lambda";

const DB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent) => {
  const body = JSON.parse(event.body || "{}");

  if (!body.title || !body.content) {
    return {
      statusCode: 400,
    };
  }

  await DB.put({
    Item: {
      id: new Date().toISOString(),
      title: body.title,
      content: body.content,
    },
    TableName: process.env.TABLE_NAME!,
  }).promise();

  return {
    statusCode: 201,
  };
};