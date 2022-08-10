import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../src/rest-api.put-note';

describe('valid request', () => {
  it('should return status code 201', async () => {
    const tableName = 'foo';
    process.env.TABLE_NAME = tableName;

    const ddbMock = mockClient(DynamoDBDocument);
    ddbMock.on(PutCommand).resolves({});

    const requestBody = {
      title: 'Hello World',
      content: 'Minim nulla dolore nostrud dolor aliquip minim.',
    };

    const event = {
      body: JSON.stringify(requestBody),
    } as AWSLambda.APIGatewayProxyEvent;

    const response = await handler(event);

    expect(ddbMock.calls()).toHaveLength(1);
    expect(ddbMock.call(0).firstArg.input).toEqual({
      Item: {
        id: expect.any(String),
        title: requestBody.title,
        content: requestBody.content,
      },
      TableName: tableName,
    });

    expect(response).toEqual({
      statusCode: 201,
    });

    ddbMock.reset();
    ddbMock.restore();
  });
});

describe('invalid request body', () => {
  it('should return status code 400', async () => {
    const response = await handler({} as AWSLambda.APIGatewayProxyEvent);

    expect(response).toEqual({
      statusCode: 400,
    });
  });
});
