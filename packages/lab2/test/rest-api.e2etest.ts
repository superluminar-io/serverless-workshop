import fetch from 'node-fetch';

const endpoint = process.env.ENDPOINT;

test('create a note', async () => {
  const response = await fetch(`${endpoint}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Hello World',
      content: 'Ex nisi do ad sint enim.',
    }),
  });

  expect(response.status).toEqual(201);
});

test('list notes', async () => {
  const response = await fetch(`${endpoint}/notes`);

  expect(response.status).toEqual(200);
});
