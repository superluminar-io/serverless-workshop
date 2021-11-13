import * as AWS from 'aws-sdk';

export const handler = async (event: AWSLambda.SQSEvent) => {
  const DB = new AWS.DynamoDB.DocumentClient();
  const eventbridge = new AWS.EventBridge();

  const tableName = process.env.TABLE_NAME!;

  for (let record of event.Records) {
    const body = JSON.parse(record.body);
    const id = body.noteId;
    const note = await DB.get({
      TableName: tableName,
      Key: {
        id: body.noteId,
      },
    }).promise();

    if (!note.Item) {
      return;
    }

    const content = note.Item.content;
    const wordCount = content.split(' ').length;

    await DB.update({
      Key: {
        id,
      },
      AttributeUpdates: {
        wordCount: {
          Value: wordCount,
        },
      },
      TableName: tableName,
    }).promise();
    
    await eventbridge.putEvents({
      Entries: [
        {
          Detail: JSON.stringify({
            id,
            wordCount,
            eventName: 'wordCountCreated'
          }),
          DetailType: 'NotesApi',
          EventBusName: process.env.EVENT_BUS_NAME,
          Source: 'custom.notes',
          Time: new Date(),
        },
      ]
    }).promise();
  }
};