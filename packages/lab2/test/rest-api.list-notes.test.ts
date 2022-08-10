import { DynamoDBDocument, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../src/rest-api.list-notes';

it('should return notes', async () => {
  const item = {
    id: '2021-04-12T18:55:06.295Z',
    title: 'Hello World',
    content: 'Minim nulla dolore nostrud dolor aliquip minim.',
  };

  const ddbMock = mockClient(DynamoDBDocument);
  ddbMock.on(ScanCommand).resolves({
    Items: [item],
  });

  const response = await handler();

  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify([item]),
  });

  ddbMock.reset();
  ddbMock.restore();
});
