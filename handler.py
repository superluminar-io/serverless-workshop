import json
from fnvhash import fnv1a_64
import boto3

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

patch_all()

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
        "statusCode": 201,
        "body": json.dumps({
            "shortened_url": shortened_url
        })
    }

def unfurl(event, context):
    from webpreview import web_preview

    for dynamodb_event in event["Records"]:
        url = dynamodb_event["dynamodb"]["NewImage"]["url"]["S"]
        try:
            title, description, image = web_preview(url, timeout=1000)
        except:
            continue

        item_to_write = {
            "url": {"S": url}
        }

        if title:
            item_to_write["title"] = {"S": title}
        if description:
            item_to_write["description"] = {"S": description}
        if image:
            item_to_write["image"] = {"S": image}

        dynamodb.put_item(
            TableName="url-preview",
            Item=item_to_write
        )
