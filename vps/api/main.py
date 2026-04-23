import json
import os
import base64
import uuid
import smtplib
from pathlib import Path
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
            "description": r["description"], "image": r["image"],
            "sortOrder": r.get("sort_order", 0)}


def row_menu(r):
    return {"id": r["id"], "label": r["label"], "href": r["href"],
            "order": r["sort_order"], "visible": bool(r["visible"]),
            "menuType": r.get("menu_type", "header"),
            "parentId": r.get("parent_id")}


# ── API endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/{path:path}")
@app.post("/api/{path:path}")
@app.put("/api/{path:path}")
@app.patch("/api/{path:path}")
@app.delete("/api/{path:path}")
async def api_handler(path: str, request: Request):
    method = request.method
    parts = [p for p in path.strip("/").split("/") if p]
    entity = parts[0] if parts else ""

    body = {}
    if method in ("POST", "PUT", "PATCH"):
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
        elif entity == "pages":
            return handle_pages(method, parts, body, cur, conn)
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

    if method == "PUT" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            "UPDATE portfolio SET title=%s,material=%s,image=%s,year=%s,sort_order=%s WHERE id=%s RETURNING *",
            (body.get("title"), body.get("material"), body.get("image"),
             body.get("year"), body.get("sortOrder", 0), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return JSONResponse(row_portfolio(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

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
            "UPDATE granite_types SET name=%s,origin=%s,color=%s,hardness=%s,description=%s,image=%s,sort_order=%s WHERE id=%s RETURNING *",
            (body.get("name"), body.get("origin"), body.get("color"), body.get("hardness"),
             body.get("description"), body.get("image"), body.get("sortOrder", 0), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return JSONResponse(row_granite(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

    return JSONResponse({"error": "Not found"}, status_code=404)


def handle_menu(method, parts, body, cur, conn):
    cur.execute("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS menu_type TEXT NOT NULL DEFAULT 'header'")
    cur.execute("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS parent_id INTEGER")
    conn.commit()

    if method == "GET":
        cur.execute("SELECT * FROM menu_items ORDER BY sort_order, id")
        return JSONResponse([row_menu(dict(r)) for r in cur.fetchall()])

    if method == "PUT":
        items = body if isinstance(body, list) else []
        cur.execute("DELETE FROM menu_items")

        # Сначала вставляем топ-уровень, запоминаем маппинг старый_id -> новый_id
        id_map = {}
        top = [item for item in items if not item.get("parentId")]
        children = [item for item in items if item.get("parentId")]

        for i, item in enumerate(top):
            old_id = item.get("id")
            cur.execute(
                "INSERT INTO menu_items (label,href,sort_order,visible,menu_type,parent_id) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
                (item.get("label",""), item.get("href","#"),
                 item.get("order", i+1), bool(item.get("visible", True)),
                 item.get("menuType", "header"), None)
            )
            new_id = cur.fetchone()["id"]
            if old_id:
                id_map[old_id] = new_id

        # Потом вставляем детей с правильными новыми parent_id
        for i, item in enumerate(children):
            old_parent = item.get("parentId")
            new_parent = id_map.get(old_parent)
            cur.execute(
                "INSERT INTO menu_items (label,href,sort_order,visible,menu_type,parent_id) VALUES (%s,%s,%s,%s,%s,%s)",
                (item.get("label",""), item.get("href","#"),
                 item.get("order", len(top)+i+1), bool(item.get("visible", True)),
                 item.get("menuType", "header"), new_parent)
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


def get_page_assignments(cur, page_id):
    cur.execute("CREATE TABLE IF NOT EXISTS page_menu_assignments (id SERIAL PRIMARY KEY, page_id INTEGER NOT NULL, location TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, UNIQUE(page_id, location))")
    cur.execute("SELECT location FROM page_menu_assignments WHERE page_id=%s ORDER BY sort_order", (page_id,))
    return [r["location"] for r in cur.fetchall()]


def row_page(r, assignments=None):
    return {"id": r["id"], "title": r["title"], "slug": r["slug"],
            "template": r["template"], "visible": bool(r["visible"]),
            "content": r["content"], "sortOrder": r["sort_order"],
            "menuAssignments": assignments or []}


def handle_pages(method, parts, body, cur, conn):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS pages (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            template TEXT NOT NULL DEFAULT 'content',
            visible BOOLEAN NOT NULL DEFAULT false,
            content TEXT NOT NULL DEFAULT '',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    cur.execute("CREATE TABLE IF NOT EXISTS page_menu_assignments (id SERIAL PRIMARY KEY, page_id INTEGER NOT NULL, location TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, UNIQUE(page_id, location))")
    conn.commit()

    # PATCH /:id/menu — обновить только привязки меню
    if method == "PATCH" and len(parts) == 3 and parts[1].isdigit() and parts[2] == "menu":
        page_id = int(parts[1])
        locations = body.get("locations", [])
        valid = {"header", "footer"}
        locations = [l for l in locations if l in valid]
        # Атомарная синхронизация
        cur.execute("SELECT location FROM page_menu_assignments WHERE page_id=%s", (page_id,))
        existing = {r["location"] for r in cur.fetchall()}
        to_add = set(locations) - existing
        to_remove = existing - set(locations)
        for loc in to_add:
            cur.execute("INSERT INTO page_menu_assignments (page_id, location) VALUES (%s,%s) ON CONFLICT DO NOTHING", (page_id, loc))
        for loc in to_remove:
            cur.execute("DELETE FROM page_menu_assignments WHERE page_id=%s AND location=%s", (page_id, loc))
        conn.commit()
        return JSONResponse({"pageId": page_id, "locations": locations})

    if method == "GET":
        cur.execute("SELECT * FROM pages ORDER BY sort_order, id")
        pages = cur.fetchall()
        result = []
        for p in pages:
            assignments = get_page_assignments(cur, p["id"])
            result.append(row_page(dict(p), assignments))
        return JSONResponse(result)

    if method == "POST":
        cur.execute(
            """INSERT INTO pages (title,slug,template,visible,content,sort_order)
               VALUES (%s,%s,%s,%s,%s,%s)
               ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, template=EXCLUDED.template,
               visible=EXCLUDED.visible, content=EXCLUDED.content, sort_order=EXCLUDED.sort_order
               RETURNING *""",
            (body.get("title",""), body.get("slug",""), body.get("template","content"),
             bool(body.get("visible",False)), body.get("content",""), body.get("sortOrder",0))
        )
        conn.commit()
        page = dict(cur.fetchone())
        return JSONResponse(row_page(page, []), status_code=201)

    if method == "PUT" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            "UPDATE pages SET title=%s,slug=%s,template=%s,visible=%s,content=%s WHERE id=%s RETURNING *",
            (body.get("title"), body.get("slug"), body.get("template"),
             bool(body.get("visible")), body.get("content"), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        if not r:
            return JSONResponse({"error": "Not found"}, status_code=404)
        assignments = get_page_assignments(cur, int(parts[1]))
        return JSONResponse(row_page(dict(r), assignments))

    if method == "DELETE" and len(parts) == 2 and parts[1].isdigit():
        cur.execute("DELETE FROM page_menu_assignments WHERE page_id=%s", (int(parts[1]),))
        cur.execute("DELETE FROM pages WHERE id=%s", (int(parts[1]),))
        conn.commit()
        return JSONResponse({"deleted": True})

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

UPLOADS_DIR = Path("/app/uploads")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/upload-image")
async def upload_image(request: Request):
    body = await request.json()
    file_data = body.get("file", "")
    file_name = body.get("fileName", "image.jpg")

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

    filename = f"{uuid.uuid4()}.{ext}"
    (UPLOADS_DIR).mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / filename).write_bytes(image_bytes)

    url = f"/uploads/{filename}"
    return JSONResponse({"ok": True, "url": url})


@app.get("/health")
def health():
    return {"ok": True}