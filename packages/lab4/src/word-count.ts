import {
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambdaNodeJs,
  aws_lambda_event_sources as lambdaEventSources,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface WordCountProps {
  notesTable: dynamodb.Table;
}

export class WordCount extends Construct {
  constructor(scope: Construct, id: string, props: WordCountProps) {
    super(scope, id);

    const streamFunction = new lambdaNodeJs.NodejsFunction(this, 'stream', {
      environment: {
        TABLE_NAME: props.notesTable.tableName,
      },
    });

    streamFunction.addEventSource(
      new lambdaEventSources.DynamoEventSource(props.notesTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        retryAttempts: 0,
      }),
    );

    props.notesTable.grantWriteData(streamFunction);
  }
}