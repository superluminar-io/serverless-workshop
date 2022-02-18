import {
  aws_dynamodb as dynamodb,
  aws_lambda_nodejs as lambdaNodeJs,
  aws_apigateway as apigateway,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class RestApi extends Construct {
  public notesTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.notesTable = new dynamodb.Table(this, 'notes-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    const putNote = new lambdaNodeJs.NodejsFunction(this, 'put-note', {
      environment: {
        TABLE_NAME: this.notesTable.tableName,
      },
    });

    const listNotes = new lambdaNodeJs.NodejsFunction(this, 'list-notes', {
      environment: {
        TABLE_NAME: this.notesTable.tableName,
      },
    });

    this.notesTable.grant(putNote, 'dynamodb:PutItem');
    this.notesTable.grant(listNotes, 'dynamodb:Scan');

    const api = new apigateway.RestApi(this, 'api');
    const resource = api.root.addResource('notes');

    resource.addMethod('POST', new apigateway.LambdaIntegration(putNote));
    resource.addMethod('GET', new apigateway.LambdaIntegration(listNotes));
  }
}