const putSpy = jest.fn();
jest.mock("aws-sdk", () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({
      put: putSpy,
    })),
  },
}));

import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../src/putNote";

beforeAll(() => {
  process.env.TABLE_NAME = "foo";
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("valid request", () => {
  it("should return status code 201", async () => {
    const requestBody = {
      title: "Hello World",
      content: "Minim nulla dolore nostrud dolor aliquip minim.",
    };

    putSpy.mockImplementation(() => ({
      promise() {
        return Promise.resolve();
      },
    }));

    const event = {
      body: JSON.stringify(requestBody),
    } as APIGatewayProxyEvent;
    const response = await handler(event);

    expect(response).toEqual({
      statusCode: 201,
    });
  });
});

describe("invalid request body", () => {
  it("should return status code 400", async () => {
    const response = await handler({} as APIGatewayProxyEvent);

    expect(response).toEqual({
      statusCode: 400,
    });
  });
});