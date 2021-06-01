const scanSpy = jest.fn();
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      scan: scanSpy,
    })),
  },
}));

import { handler } from "../../src/listNotes";

beforeAll(() => {
  process.env.TABLE_NAME = "foo";
});

afterEach(() => {
  jest.resetAllMocks();
});

it("should return notes", async () => {
  const item = {
    id: "2021-04-12T18:55:06.295Z",
    title: "Hello World",
    content: "Minim nulla dolore nostrud dolor aliquip minim.",
  };

  scanSpy.mockImplementation(() => ({
    promise() {
      return Promise.resolve({ Items: [item] });
    },
  }));

  const response = await handler();

  expect(response).toEqual({
    statusCode: 200,
    body: JSON.stringify([item]),
  });
});