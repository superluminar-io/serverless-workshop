import AWSMock from 'aws-sdk-mock';
import { handler } from '../src/main.put-note';

describe('valid request', () => {
  it('should return status code 201', async () => {
    const tableName = 'foo';
    const putItemSpy = jest.fn();
    process.env.TABLE_NAME = tableName;
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, putItemSpy(params));
    });

    const requestBody = {
      title: 'Hello World',
      content: 'Minim nulla dolore nostrud dolor aliquip minim.',
    };

    const event = {
      body: JSON.stringify(requestBody),
    } as AWSLambda.APIGatewayProxyEvent;

    const response = await handler(event);

    expect(putItemSpy).toHaveBeenCalledWith({
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

    AWSMock.restore('DynamoDB.DocumentClient');
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