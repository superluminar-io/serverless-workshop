import json
from fnvhash import fnv1a_64
import boto3

dynamodb = boto3.client('dynamodb')

def get_url(event, context):
    short_url = event["pathParameters"]["short_url"]
    result = dynamodb.get_item(
        TableName="url-shortener",
        Key={
            "short_url": {"S": short_url}
        }
    )

    if not "Item" in result:
            return {"statusCode": 404}

    long_url = result["Item"]["url"]["S"]

    return {
        "statusCode": 301,
        "headers": {
            "location": long_url
        }
    }


def create_url(event, context):

    post_parameters = json.loads(event["body"])
    url_to_shorten = post_parameters['url']
    shortened_url = "{:x}".format(fnv1a_64(bytes(url_to_shorten, 'utf-8')))

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

def unfurl(event, context):
    from webpreview import web_preview

    for dynamodb_event in event["Records"]:
        url = dynamodb_event["dynamodb"]["NewImage"]["url"]["S"]
        title, description, image = web_preview(url, timeout=1000)
        print(title, description, image)

    ## zusaetzlich: schreibe html nach s3 - oder counter einbauen und url shortener