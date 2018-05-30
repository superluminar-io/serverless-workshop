import json
from fnvhash import fnv1a_64
import boto3
import os

def get_url(event, context):
    body = {
        "message": "Go Serverless v1.0! Your function executed successfully!",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response

def create_url(event, context):

    post_parameters = json.loads(event["body"])
    url_to_shorten = post_parameters['url']
    shortened_url = "{:x}".format(fnv1a_64(bytes(url_to_shorten, 'utf-8')))

    dynamodb = boto3.client('dynamodb')
    dynamodb.put_item(
        TableName="url-shortener",
        Item={
            "short_url": {"S": shortened_url},
            "url":       {"S": url_to_shorten},
        }
    )

    return {
        "statusCode": 201
    }