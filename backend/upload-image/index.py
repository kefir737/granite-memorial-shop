"""
Загрузка изображения памятника в S3.
Принимает base64-encoded файл, сохраняет в S3 через boto3, возвращает CDN URL.
"""
import json
import os
import base64
import uuid
import hmac
import hashlib
import datetime
import urllib.request


def _sign(key, msg):
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()


def _get_signature_key(key, date_stamp, region, service):
    k_date = _sign(('AWS4' + key).encode('utf-8'), date_stamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, service)
    k_signing = _sign(k_service, 'aws4_request')
    return k_signing


def upload_to_s3(bucket, key, data, content_type, access_key, secret_key):
    endpoint = 'bucket.poehali.dev'
    region = 'us-east-1'
    service = 's3'

    now = datetime.datetime.utcnow()
    amz_date = now.strftime('%Y%m%dT%H%M%SZ')
    date_stamp = now.strftime('%Y%m%d')

    method = 'PUT'
    uri = f'/{bucket}/{key}'
    host = endpoint

    payload_hash = hashlib.sha256(data).hexdigest()

    headers_to_sign = {
        'host': host,
        'x-amz-date': amz_date,
        'x-amz-content-sha256': payload_hash,
        'content-type': content_type,
    }

    canonical_headers = ''.join(f'{k}:{v}\n' for k, v in sorted(headers_to_sign.items()))
    signed_headers = ';'.join(sorted(headers_to_sign.keys()))

    canonical_request = '\n'.join([
        method, uri, '',
        canonical_headers,
        signed_headers,
        payload_hash,
    ])

    credential_scope = f'{date_stamp}/{region}/{service}/aws4_request'
    string_to_sign = '\n'.join([
        'AWS4-HMAC-SHA256', amz_date, credential_scope,
        hashlib.sha256(canonical_request.encode('utf-8')).hexdigest(),
    ])

    signing_key = _get_signature_key(secret_key, date_stamp, region, service)
    signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

    auth = (
        f'AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, '
        f'SignedHeaders={signed_headers}, Signature={signature}'
    )

    url = f'https://{endpoint}{uri}'
    req = urllib.request.Request(url, data=data, method='PUT')
    req.add_header('Authorization', auth)
    req.add_header('x-amz-date', amz_date)
    req.add_header('x-amz-content-sha256', payload_hash)
    req.add_header('Content-Type', content_type)

    with urllib.request.urlopen(req) as resp:
        return resp.status


def handler(event: dict, context) -> dict:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    file_data = body.get('file', '')
    file_name = body.get('fileName', 'image.jpg')
    content_type = body.get('contentType', 'image/jpeg')

    if not file_data:
        return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Файл не передан'})}

    if ';base64,' in file_data:
        file_data = file_data.split(';base64,')[1]

    image_bytes = base64.b64decode(file_data)

    ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'jpg'
    if ext not in {'jpg', 'jpeg', 'png', 'webp'}:
        return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Допустимые форматы: JPG, PNG, WebP'})}

    if len(image_bytes) > 10 * 1024 * 1024:
        return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Файл слишком большой. Максимум 10 МБ'})}

    s3_key = f'monuments/{uuid.uuid4()}.{ext}'
    access_key = os.environ['AWS_ACCESS_KEY_ID']
    secret_key = os.environ['AWS_SECRET_ACCESS_KEY']

    upload_to_s3('files', s3_key, image_bytes, content_type, access_key, secret_key)

    url = f'https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}'

    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'ok': True, 'url': url})
    }
