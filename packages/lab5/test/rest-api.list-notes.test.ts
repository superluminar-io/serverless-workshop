import AWSMock from 'aws-sdk-mock';
import { handler } from '../src/rest-api.list-notes';

it('should return notes', async () => {
  const item = {
    id: '2021-04-12T18:55:06.295Z',
    title: 'Hello World',
    content: 'Minim nulla dolore nostrud dolor aliquip minim.',
  };

  AWSMock.mock('DynamoDB.DocumentClient', 'scan', (_: any, callback: Function) => {
    callback(null, { Items: [item] });
  });

  const response = await handler();

  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify([item]),
  });

  AWSMock.restore('DynamoDB.DocumentClient');
});
