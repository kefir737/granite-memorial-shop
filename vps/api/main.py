import json
import os
import base64
import uuid
import hmac
import hashlib
import datetime
import urllib.request
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


# ── row mappers ───────────────────────────────────────────────────────────────

def row_monument(r):
    imgs = r.get("images") or []
    if isinstance(imgs, str):
        try:
            imgs = json.loads(imgs)
        except Exception:
            imgs = []
    return {
        "id": r["id"], "name": r["name"], "slug": r["slug"],
        "material": r["material"], "style": r["style"],
        "price": r["price"], "priceFrom": bool(r["price_from"]),
        "installPrice": r["install_price"],
        "width": r["width"], "height": r["height"], "depth": r["depth"],
        "image": r["image"], "images": imgs,
        "description": r["description"], "fullDescription": r["full_description"],
        "inStock": bool(r["in_stock"]),
    }


def row_service(r):
    return {"id": r["id"], "title": r["title"], "description": r["description"],
            "price": r["price"], "icon": r["icon"]}


def row_portfolio(r):
    return {"id": r["id"], "title": r["title"], "material": r["material"],
            "image": r["image"], "year": r["year"]}


def row_granite(r):
    return {"id": r["id"], "name": r["name"], "origin": r["origin"],
            "color": r["color"], "hardness": r["hardness"],
            "description": r["description"], "image": r["image"]}


def row_menu(r):
    return {"id": r["id"], "label": r["label"], "href": r["href"],
            "order": r["sort_order"], "visible": bool(r["visible"])}


# ── API endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/{path:path}")
@app.post("/api/{path:path}")
@app.put("/api/{path:path}")
@app.delete("/api/{path:path}")
async def api_handler(path: str, request: Request):
    method = request.method
    parts = [p for p in path.strip("/").split("/") if p]
    entity = parts[0] if parts else ""

    body = {}
    if method in ("POST", "PUT"):
        try:
            body = await request.json()
        except Exception:
            body = {}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        if entity == "monuments":
            return handle_monuments(method, parts, body, cur, conn)
        elif entity == "services":
            return handle_services(method, parts, body, cur, conn)
        elif entity == "portfolio":
            return handle_portfolio(method, parts, body, cur, conn)
        elif entity == "granite":
            return handle_granite(method, parts, body, cur, conn)
        elif entity == "menu":
            return handle_menu(method, parts, body, cur, conn)
        elif entity == "settings":
            return handle_settings(method, parts, body, cur, conn)
        else:
            return JSONResponse({"error": "Not found"}, status_code=404)
    finally:
        cur.close()
        conn.close()


def handle_monuments(method, parts, body, cur, conn):
    if method == "GET":
        if len(parts) == 1:
            cur.execute("SELECT * FROM monuments ORDER BY sort_order, id")
            return JSONResponse([row_monument(dict(r)) for r in cur.fetchall()])
        seg = parts[1]
        if seg.isdigit():
            cur.execute("SELECT * FROM monuments WHERE id=%s", (int(seg),))
        else:
            cur.execute("SELECT * FROM monuments WHERE slug=%s", (seg,))
        r = cur.fetchone()
        return JSONResponse(row_monument(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

    if method == "POST":
        cur.execute(
            """INSERT INTO monuments
               (name,slug,material,style,price,price_from,install_price,
                width,height,depth,image,images,description,full_description,in_stock,sort_order)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
            (body.get("name",""), body.get("slug",""), body.get("material",""), body.get("style",""),
             body.get("price",0), bool(body.get("priceFrom",True)), body.get("installPrice",0),
             body.get("width",60), body.get("height",120), body.get("depth",8),
             body.get("image",""), json.dumps(body.get("images",[]), ensure_ascii=False),
             body.get("description",""), body.get("fullDescription",""),
             bool(body.get("inStock",True)), body.get("sortOrder",0))
        )
        conn.commit()
        return JSONResponse(row_monument(dict(cur.fetchone())), status_code=201)

    if method == "PUT" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            """UPDATE monuments SET
               name=%s,slug=%s,material=%s,style=%s,price=%s,price_from=%s,
               install_price=%s,width=%s,height=%s,depth=%s,image=%s,images=%s,
               description=%s,full_description=%s,in_stock=%s
               WHERE id=%s RETURNING *""",
            (body.get("name"), body.get("slug"), body.get("material"), body.get("style"),
             body.get("price"), bool(body.get("priceFrom")), body.get("installPrice"),
             body.get("width"), body.get("height"), body.get("depth"),
             body.get("image"), json.dumps(body.get("images",[]), ensure_ascii=False),
             body.get("description"), body.get("fullDescription"),
             bool(body.get("inStock")), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return JSONResponse(row_monument(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

    if method == "DELETE" and len(parts) == 2 and parts[1].isdigit():
        cur.execute("DELETE FROM monuments WHERE id=%s", (int(parts[1]),))
        conn.commit()
        return JSONResponse({"deleted": True})

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_services(method, parts, body, cur, conn):
    if method == "GET":
        cur.execute("SELECT * FROM services ORDER BY sort_order, id")
        return JSONResponse([row_service(dict(r)) for r in cur.fetchall()])

    if method == "PUT":
        if len(parts) == 2 and parts[1].isdigit():
            cur.execute(
                "UPDATE services SET title=%s,description=%s,price=%s,icon=%s WHERE id=%s RETURNING *",
                (body.get("title"), body.get("description"), body.get("price"), body.get("icon"), int(parts[1]))
            )
            conn.commit()
            r = cur.fetchone()
            return JSONResponse(row_service(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)
        items = body if isinstance(body, list) else []
        for item in items:
            cur.execute(
                "UPDATE services SET title=%s,description=%s,price=%s,icon=%s WHERE id=%s",
                (item.get("title"), item.get("description"), item.get("price"), item.get("icon"), item.get("id"))
            )
        conn.commit()
        cur.execute("SELECT * FROM services ORDER BY sort_order, id")
        return JSONResponse([row_service(dict(r)) for r in cur.fetchall()])

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_portfolio(method, parts, body, cur, conn):
    if method == "GET":
        cur.execute("SELECT * FROM portfolio ORDER BY sort_order, id")
        return JSONResponse([row_portfolio(dict(r)) for r in cur.fetchall()])

    if method == "POST":
        cur.execute(
            "INSERT INTO portfolio (title,material,image,year,sort_order) VALUES (%s,%s,%s,%s,%s) RETURNING *",
            (body.get("title",""), body.get("material",""), body.get("image",""), body.get("year",2024), body.get("sortOrder",0))
        )
        conn.commit()
        return JSONResponse(row_portfolio(dict(cur.fetchone())), status_code=201)

    if method == "DELETE" and len(parts) == 2 and parts[1].isdigit():
        cur.execute("DELETE FROM portfolio WHERE id=%s", (int(parts[1]),))
        conn.commit()
        return JSONResponse({"deleted": True})

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_granite(method, parts, body, cur, conn):
    if method == "GET":
        cur.execute("SELECT * FROM granite_types ORDER BY sort_order, id")
        return JSONResponse([row_granite(dict(r)) for r in cur.fetchall()])

    if method == "PUT" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            "UPDATE granite_types SET name=%s,origin=%s,color=%s,hardness=%s,description=%s,image=%s WHERE id=%s RETURNING *",
            (body.get("name"), body.get("origin"), body.get("color"), body.get("hardness"),
             body.get("description"), body.get("image"), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return JSONResponse(row_granite(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_menu(method, parts, body, cur, conn):
    if method == "GET":
        cur.execute("SELECT * FROM menu_items ORDER BY sort_order, id")
        return JSONResponse([row_menu(dict(r)) for r in cur.fetchall()])

    if method == "PUT":
        items = body if isinstance(body, list) else []
        cur.execute("DELETE FROM menu_items")
        for i, item in enumerate(items):
            cur.execute(
                "INSERT INTO menu_items (id,label,href,sort_order,visible) VALUES (%s,%s,%s,%s,%s)",
                (item.get("id", i+1), item.get("label",""), item.get("href","#"),
                 item.get("order", i+1), bool(item.get("visible", True)))
            )
        conn.commit()
        cur.execute("SELECT * FROM menu_items ORDER BY sort_order, id")
        return JSONResponse([row_menu(dict(r)) for r in cur.fetchall()])

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_settings(method, parts, body, cur, conn):
    if method == "GET":
        cur.execute("SELECT key, value FROM site_settings")
        return JSONResponse({r["key"]: r["value"] for r in cur.fetchall()})

    if method == "PUT":
        for key, value in (body if isinstance(body, dict) else {}).items():
            cur.execute(
                "INSERT INTO site_settings (key,value) VALUES (%s,%s) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
                (key, str(value))
            )
        conn.commit()
        cur.execute("SELECT key, value FROM site_settings")
        return JSONResponse({r["key"]: r["value"] for r in cur.fetchall()})

    return JSONResponse({"error": "Not found"}, status_code=404)


# ── Contact form ──────────────────────────────────────────────────────────────

@app.post("/contact")
async def contact(request: Request):
    body = await request.json()
    name = body.get("name", "").strip()
    phone = body.get("phone", "").strip()
    message = body.get("message", "").strip()
    monument_name = body.get("monumentName", "").strip()

    if not name or not phone:
        return JSONResponse({"ok": False, "error": "name_phone_required"}, status_code=400)

    smtp_host = os.environ.get("SMTP_HOST", "smtp.yandex.ru")
    smtp_port = int(os.environ.get("SMTP_PORT", "465"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    recipient = os.environ.get("EMAIL_RECIPIENT", smtp_user)

    if not smtp_user or not smtp_password:
        return JSONResponse({"ok": False, "error": "smtp_not_configured"})

    subject = "Новая заявка — granit-sever.ru"
    if monument_name:
        subject += f" ({monument_name})"

    monument_row = f'<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;border-bottom:1px solid #f3f4f6">Памятник</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6">{monument_name}</td></tr>' if monument_name else ""
    message_row = f'<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top">Сообщение</td><td style="padding:8px 0;color:#111;font-size:14px">{message.replace(chr(10), "<br>")}</td></tr>' if message else ""

    html = f"""<div style="font-family:Arial,sans-serif;max-width:580px;padding:24px;border:1px solid #e5e7eb">
<h2 style="color:#111;margin:0 0 20px;font-size:20px">Новая заявка с granit-sever.ru</h2>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:130px;border-bottom:1px solid #f3f4f6">Имя</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6"><b>{name}</b></td></tr>
<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6">Телефон</td><td style="padding:8px 0;color:#111;font-size:14px;border-bottom:1px solid #f3f4f6"><b>{phone}</b></td></tr>
{monument_row}{message_row}
</table>
<p style="margin:16px 0 0;color:#9ca3af;font-size:12px">granit-sever.ru</p></div>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient
    msg.attach(MIMEText(html, "html", "utf-8"))

    if smtp_port == 465:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()

    server.login(smtp_user, smtp_password)
    server.sendmail(smtp_user, recipient, msg.as_string())
    server.quit()

    return JSONResponse({"ok": True})


# ── Upload image ──────────────────────────────────────────────────────────────

def _sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def _get_signature_key(key, date_stamp, region, service):
    k_date = _sign(("AWS4" + key).encode("utf-8"), date_stamp)
    k_region = _sign(k_date, region)
    k_service = _sign(k_region, service)
    return _sign(k_service, "aws4_request")


def upload_to_s3(bucket, key, data, content_type, access_key, secret_key):
    endpoint = "bucket.poehali.dev"
    region = "us-east-1"
    now = datetime.datetime.utcnow()
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    uri = f"/{bucket}/{key}"
    payload_hash = hashlib.sha256(data).hexdigest()
    headers_to_sign = {"host": endpoint, "x-amz-date": amz_date,
                       "x-amz-content-sha256": payload_hash, "content-type": content_type}
    canonical_headers = "".join(f"{k}:{v}\n" for k, v in sorted(headers_to_sign.items()))
    signed_headers = ";".join(sorted(headers_to_sign.keys()))
    canonical_request = "\n".join(["PUT", uri, "", canonical_headers, signed_headers, payload_hash])
    credential_scope = f"{date_stamp}/{region}/s3/aws4_request"
    string_to_sign = "\n".join(["AWS4-HMAC-SHA256", amz_date, credential_scope,
                                 hashlib.sha256(canonical_request.encode()).hexdigest()])
    signing_key = _get_signature_key(secret_key, date_stamp, region, "s3")
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()
    auth = f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"
    req = urllib.request.Request(f"https://{endpoint}{uri}", data=data, method="PUT")
    req.add_header("Authorization", auth)
    req.add_header("x-amz-date", amz_date)
    req.add_header("x-amz-content-sha256", payload_hash)
    req.add_header("Content-Type", content_type)
    with urllib.request.urlopen(req) as resp:
        return resp.status


@app.post("/upload-image")
async def upload_image(request: Request):
    body = await request.json()
    file_data = body.get("file", "")
    file_name = body.get("fileName", "image.jpg")
    content_type = body.get("contentType", "image/jpeg")

    if not file_data:
        return JSONResponse({"error": "Файл не передан"}, status_code=400)

    if ";base64," in file_data:
        file_data = file_data.split(";base64,")[1]

    image_bytes = base64.b64decode(file_data)
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "jpg"

    if ext not in {"jpg", "jpeg", "png", "webp"}:
        return JSONResponse({"error": "Допустимые форматы: JPG, PNG, WebP"}, status_code=400)

    if len(image_bytes) > 10 * 1024 * 1024:
        return JSONResponse({"error": "Файл слишком большой. Максимум 10 МБ"}, status_code=400)

    s3_key = f"monuments/{uuid.uuid4()}.{ext}"
    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
    upload_to_s3("files", s3_key, image_bytes, content_type, access_key, secret_key)
    url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{s3_key}"

    return JSONResponse({"ok": True, "url": url})


@app.get("/health")
def health():
    return {"ok": True}
