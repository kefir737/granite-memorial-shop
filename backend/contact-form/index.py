"""Contact form email sender for granit-sever.ru"""
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    message = body.get('message', '').strip()
    monument_name = body.get('monumentName', '').strip()

    if not name or not phone:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'ok': False, 'error': 'name_phone_required'})}

    smtp_host = os.environ.get('SMTP_HOST', 'smtp.yandex.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    recipient = os.environ.get('EMAIL_RECIPIENT', smtp_user)

    if not smtp_user or not smtp_password:
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': False, 'error': 'smtp_not_configured'})}

    subject = 'New request - granit-sever.ru'
    if monument_name:
        subject += f' ({monument_name})'

    monument_row = f'<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;border-bottom:1px solid #f3f4f6">Monument</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6">{monument_name}</td></tr>' if monument_name else ''
    message_row = f'<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Message</td><td style="padding:8px 0;color:#111;font-size:14px">{message.replace(chr(10), "<br>")}</td></tr>' if message else ''

    html = f"""<div style="font-family:Arial,sans-serif;max-width:580px;padding:24px;border:1px solid #e5e7eb">
<h2 style="color:#111;margin:0 0 20px;font-size:20px">New request from granit-sever.ru</h2>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;border-bottom:1px solid #f3f4f6">Name</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6"><b>{name}</b></td></tr>
<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6">Phone</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6"><b>{phone}</b></td></tr>
{monument_row}{message_row}
</table>
<p style="margin:16px 0 0;color:#9ca3af;font-size:12px">granit-sever.ru</p></div>"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = recipient
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    if smtp_port == 465:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()

    server.login(smtp_user, smtp_password)
    server.sendmail(smtp_user, recipient, msg.as_string())
    server.quit()

    return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}
