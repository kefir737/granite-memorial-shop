import json
import os
import re
import base64
import uuid
import smtplib
import time
import threading
import bcrypt
from html import escape as html_escape
from pathlib import Path
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from email.header import Header
from email.policy import SMTP
from collections import defaultdict

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Rate limiter ──────────────────────────────────────────────────────────────

_rl_lock = threading.Lock()
_rl_attempts: dict = defaultdict(list)   # ip -> [timestamp, ...]
RL_WINDOW = 60        # секунд
RL_MAX = 5            # попыток за окно
RL_BLOCK_TIME = 300   # блокировка 5 минут после превышения
_rl_blocked: dict = {}   # ip -> unblock_at


def rl_check(ip: str) -> bool:
    """True — разрешить, False — заблокировать."""
    now = time.time()
    with _rl_lock:
        if ip in _rl_blocked:
            if now < _rl_blocked[ip]:
                return False
            del _rl_blocked[ip]
        _rl_attempts[ip] = [t for t in _rl_attempts[ip] if now - t < RL_WINDOW]
        if len(_rl_attempts[ip]) >= RL_MAX:
            _rl_blocked[ip] = now + RL_BLOCK_TIME
            return False
        _rl_attempts[ip].append(now)
        return True


def rl_reset(ip: str):
    with _rl_lock:
        _rl_attempts.pop(ip, None)
        _rl_blocked.pop(ip, None)


# ── Auth helpers ──────────────────────────────────────────────────────────────

DEFAULT_PASSWORD = "admin2024"


def get_admin_hash(cur) -> str:
    cur.execute("SELECT value FROM site_settings WHERE key='adminPasswordHash'")
    row = cur.fetchone()
    return row["value"] if row else ""


def set_admin_hash(cur, conn, plain: str):
    h = bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO site_settings (key,value) VALUES ('adminPasswordHash',%s) "
        "ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
        (h,)
    )
    conn.commit()
    return h


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


# ── Constructor sketch email ──────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def get_smtp_config():
    db_conn = get_conn()
    cur = db_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    smtp_cfg = {}
    try:
        cur.execute(
            "SELECT key, value FROM site_settings WHERE key IN "
            "('smtpHost','smtpPort','smtpUser','smtpPassword','notificationEmail')"
        )
        smtp_cfg = {r["key"]: r["value"] for r in cur.fetchall()}
    finally:
        cur.close()
        db_conn.close()

    smtp_host = smtp_cfg.get("smtpHost") or os.environ.get("SMTP_HOST", "smtp.jino.ru")
    smtp_port = int(smtp_cfg.get("smtpPort") or os.environ.get("SMTP_PORT", "587"))
    smtp_user = smtp_cfg.get("smtpUser") or os.environ.get("SMTP_USER", "")
    smtp_password = smtp_cfg.get("smtpPassword") or os.environ.get("SMTP_PASSWORD", "")
    recipients_raw = smtp_cfg.get("notificationEmail") or os.environ.get("EMAIL_RECIPIENT", smtp_user)
    recipients = [r.strip() for r in recipients_raw.split(",") if r.strip()]
    return smtp_host, smtp_port, smtp_user, smtp_password, recipients


def send_html_email(smtp_host, smtp_port, smtp_user, smtp_password, to_addr, subject, html, reply_to=None, attachment=None):
    if smtp_port == 465:
        server = smtplib.SMTP_SSL(smtp_host, smtp_port)
    else:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
    server.login(smtp_user, smtp_password)

    msg = MIMEMultipart(policy=SMTP)
    msg["Subject"] = str(Header(subject, "utf-8"))
    msg["From"] = smtp_user
    msg["To"] = to_addr
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(html, "html", "utf-8"))

    if attachment:
        filename, content, content_type = attachment
        part = MIMEBase("application", "octet-stream")
        part.set_payload(content)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment", filename=("utf-8", "", filename))
        if content_type:
            part.add_header("Content-Type", content_type)
        msg.attach(part)

    server.sendmail(smtp_user, [to_addr], msg.as_bytes())
    server.quit()


async def parse_sketch_form(request: Request):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
        return body.get("img", ""), body.get("email", ""), body.get("imy", ""), body.get("telefon", ""), body.get("urlref", "")
    form = await request.form()
    return form.get("img", ""), form.get("email", ""), form.get("imy", ""), form.get("telefon", ""), form.get("urlref", "")


async def handle_send_sketch(request: Request):
    try:
        img, email, imy, telefon, urlref = await parse_sketch_form(request)
        email = (email or "").strip()
        imy = (imy or "Клиент").strip()
        telefon = (telefon or "—").strip()
        page_url = (urlref or "—").strip()

        if not email or not EMAIL_RE.match(email):
            return PlainTextResponse("Укажите корректный email", status_code=400)
        if not img:
            return PlainTextResponse("Эскиз не получен", status_code=400)

        smtp_host, smtp_port, smtp_user, smtp_password, recipients = get_smtp_config()
        if not smtp_user or not smtp_password or not recipients:
            return PlainTextResponse("SMTP не настроен на сервере", status_code=500)

        mail_to = recipients[0]
        image_bytes = base64.b64decode(img)
        attachment = ("eskiz-pamyatnika.png", image_bytes, "image/png")

        manager_html = f"""
            <h2>Новая заявка: узнать стоимость</h2>
            <p><strong>Имя:</strong> {html_escape(imy)}</p>
            <p><strong>Телефон:</strong> {html_escape(telefon)}</p>
            <p><strong>Email клиента:</strong> {html_escape(email)}</p>
            <p><strong>Страница:</strong> {html_escape(page_url)}</p>
            <p>Эскиз памятника во вложении.</p>
        """
        greeting = f", {html_escape(imy)}" if imy != "Клиент" else ""
        client_html = f"""
            <h2>Ваш эскиз памятника</h2>
            <p>Здравствуйте{greeting}!</p>
            <p>Спасибо за обращение. Мы получили ваш эскиз и свяжемся с вами для расчёта стоимости.</p>
            <p>Копия эскиза — во вложении.</p>
        """

        send_html_email(
            smtp_host, smtp_port, smtp_user, smtp_password,
            mail_to, f"Эскиз памятника — {imy}", manager_html,
            reply_to=email, attachment=attachment,
        )
        send_html_email(
            smtp_host, smtp_port, smtp_user, smtp_password,
            email, "Ваш эскиз памятника", client_html,
            attachment=attachment,
        )
        return PlainTextResponse("OK")
    except Exception as exc:
        print(f"Sketch send error: {exc}")
        return PlainTextResponse(str(exc) or "Ошибка отправки письма", status_code=500)


@app.post("/api/send-sketch")
async def send_sketch(request: Request):
    return await handle_send_sketch(request)


@app.post("/save_image.php")
async def save_image_php(request: Request):
    return await handle_send_sketch(request)


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
        elif entity == "leads":
            return handle_leads(method, parts, body, cur, conn)
        elif entity == "auth":
            return await handle_auth(method, parts, body, request, cur, conn)
        elif entity == "sitemap":
            return handle_sitemap(method, parts, cur, conn)
        else:
            return JSONResponse({"error": "Not found"}, status_code=404)
    finally:
        cur.close()
        conn.close()


async def handle_auth(method, parts, body, request, cur, conn):
    ip = request.headers.get("X-Forwarded-For", request.client.host or "").split(",")[0].strip()
    action = parts[1] if len(parts) > 1 else ""

    if method == "POST" and action == "login":
        if not rl_check(ip):
            return JSONResponse({"ok": False, "error": "too_many_attempts"}, status_code=429)
        password = body.get("password", "")
        stored_hash = get_admin_hash(cur)
        ok = False
        if stored_hash:
            ok = bcrypt.checkpw(password.encode(), stored_hash.encode())
        else:
            # Хэш ещё не записан — сравниваем с дефолтным паролем
            ok = (password == DEFAULT_PASSWORD)
            if ok:
                set_admin_hash(cur, conn, DEFAULT_PASSWORD)
        if ok:
            rl_reset(ip)
            return JSONResponse({"ok": True})
        return JSONResponse({"ok": False, "error": "invalid_password"}, status_code=401)

    if method == "POST" and action == "change-password":
        if not rl_check(ip):
            return JSONResponse({"ok": False, "error": "too_many_attempts"}, status_code=429)
        current = body.get("current", "")
        new_pwd = body.get("new", "")
        if len(new_pwd) < 6:
            return JSONResponse({"ok": False, "error": "too_short"}, status_code=400)
        stored_hash = get_admin_hash(cur)
        if not bcrypt.checkpw(current.encode(), stored_hash.encode()):
            return JSONResponse({"ok": False, "error": "invalid_password"}, status_code=401)
        set_admin_hash(cur, conn, new_pwd)
        rl_reset(ip)
        return JSONResponse({"ok": True})

    return JSONResponse({"error": "Not found"}, status_code=404)


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
        data = {r["key"]: r["value"] for r in cur.fetchall()}
        # Never expose secret values to the public settings endpoint.
        data.pop("adminPasswordHash", None)
        if "smtpPassword" in data:
            data["smtpPassword"] = ""
        return JSONResponse(data)

    if method == "PUT":
        payload = body if isinstance(body, dict) else {}
        for key, value in payload.items():
            # Keep existing SMTP password when frontend sends an empty placeholder.
            if key == "smtpPassword" and (value is None or str(value).strip() == ""):
                continue
            cur.execute(
                "INSERT INTO site_settings (key,value) VALUES (%s,%s) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value",
                (key, str(value))
            )
        conn.commit()
        cur.execute("SELECT key, value FROM site_settings")
        data = {r["key"]: r["value"] for r in cur.fetchall()}
        data.pop("adminPasswordHash", None)
        if "smtpPassword" in data:
            data["smtpPassword"] = ""
        return JSONResponse(data)

    return JSONResponse({"error": "Not found"}, status_code=404)


def get_page_assignments(cur, page_id):
    cur.execute("CREATE TABLE IF NOT EXISTS page_menu_assignments (id SERIAL PRIMARY KEY, page_id INTEGER NOT NULL, location TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, UNIQUE(page_id, location))")
    cur.execute("SELECT location FROM page_menu_assignments WHERE page_id=%s ORDER BY sort_order", (page_id,))
    return [r["location"] for r in cur.fetchall()]


def normalize_page_slug(slug):
    s = (slug or "").strip()
    if not s:
        return "/"
    if not s.startswith("/"):
        s = "/" + s
    return s


def row_page(r, assignments=None):
    return {"id": r["id"], "title": r["title"], "slug": r["slug"],
            "template": r["template"], "visible": bool(r["visible"]),
            "content": r["content"], "customHtml": r.get("custom_html", ""),
            "sortOrder": r["sort_order"],
            "seoTitle": r.get("seo_title") or "",
            "seoKeywords": r.get("seo_keywords") or "",
            "seoDescription": r.get("seo_description") or "",
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
            custom_html TEXT NOT NULL DEFAULT '',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    cur.execute("ALTER TABLE pages ADD COLUMN IF NOT EXISTS custom_html TEXT NOT NULL DEFAULT ''")
    cur.execute("ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT ''")
    cur.execute("ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_keywords TEXT NOT NULL DEFAULT ''")
    cur.execute("ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT ''")
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
            """INSERT INTO pages (title,slug,template,visible,content,sort_order,seo_title,seo_keywords,seo_description)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, template=EXCLUDED.template,
               visible=EXCLUDED.visible, content=EXCLUDED.content, sort_order=EXCLUDED.sort_order,
               seo_title=EXCLUDED.seo_title, seo_keywords=EXCLUDED.seo_keywords,
               seo_description=EXCLUDED.seo_description
               RETURNING *""",
            (body.get("title",""), normalize_page_slug(body.get("slug","")), body.get("template","content"),
             bool(body.get("visible",False)), body.get("content",""), body.get("sortOrder",0),
             body.get("seoTitle",""), body.get("seoKeywords",""), body.get("seoDescription",""))
        )
        conn.commit()
        page = dict(cur.fetchone())
        return JSONResponse(row_page(page, []), status_code=201)

    if method == "PUT" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            "UPDATE pages SET title=%s,slug=%s,template=%s,visible=%s,content=%s,custom_html=%s,"
            "seo_title=%s,seo_keywords=%s,seo_description=%s WHERE id=%s RETURNING *",
            (body.get("title"), normalize_page_slug(body.get("slug")), body.get("template"),
             bool(body.get("visible")), body.get("content"),
             body.get("customHtml", ""), body.get("seoTitle", ""),
             body.get("seoKeywords", ""), body.get("seoDescription", ""),
             int(parts[1]))
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


# ── Leads ─────────────────────────────────────────────────────────────────────

def ensure_leads_table(cur, conn):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            message TEXT NOT NULL DEFAULT '',
            source TEXT NOT NULL DEFAULT '',
            processed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """)
    conn.commit()


def row_lead(r):
    return {
        "id": r["id"], "name": r["name"], "phone": r["phone"],
        "message": r["message"], "source": r["source"],
        "processed": bool(r["processed"]),
        "createdAt": r["created_at"].isoformat() if r["created_at"] else None,
    }


def handle_leads(method, parts, body, cur, conn):
    ensure_leads_table(cur, conn)

    if method == "GET":
        cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
        return JSONResponse([row_lead(dict(r)) for r in cur.fetchall()])

    if method == "PATCH" and len(parts) == 2 and parts[1].isdigit():
        cur.execute(
            "UPDATE leads SET processed=%s WHERE id=%s RETURNING *",
            (bool(body.get("processed")), int(parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return JSONResponse(row_lead(dict(r))) if r else JSONResponse({"error": "Not found"}, status_code=404)

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

    # Сохраняем заявку в БД
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        ensure_leads_table(cur, conn)
        source = monument_name if monument_name else "Форма обратной связи"
        cur.execute(
            "INSERT INTO leads (name, phone, message, source) VALUES (%s,%s,%s,%s)",
            (name, phone, message, source)
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()

    # Читаем SMTP-настройки из БД (приоритет) или ENV (fallback)
    db_conn2 = get_conn()
    db_cur2 = db_conn2.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    smtp_cfg = {}
    try:
        db_cur2.execute("SELECT key, value FROM site_settings WHERE key IN ('smtpHost','smtpPort','smtpUser','smtpPassword','notificationEmail')")
        smtp_cfg = {r["key"]: r["value"] for r in db_cur2.fetchall()}
    finally:
        db_cur2.close()
        db_conn2.close()

    smtp_host = smtp_cfg.get("smtpHost") or os.environ.get("SMTP_HOST", "smtp.yandex.ru")
    smtp_port = int(smtp_cfg.get("smtpPort") or os.environ.get("SMTP_PORT", "465"))
    smtp_user = smtp_cfg.get("smtpUser") or os.environ.get("SMTP_USER", "")
    smtp_password = smtp_cfg.get("smtpPassword") or os.environ.get("SMTP_PASSWORD", "")
    recipients_raw = smtp_cfg.get("notificationEmail") or os.environ.get("EMAIL_RECIPIENT", smtp_user)
    recipients = [r.strip() for r in recipients_raw.split(",") if r.strip()]

    if not smtp_user or not smtp_password or not recipients:
        return JSONResponse({"ok": True})

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

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port)
            server.starttls()
        server.login(smtp_user, smtp_password)
        for rcpt in recipients:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_user
            msg["To"] = rcpt
            msg.attach(MIMEText(html, "html", "utf-8"))
            server.sendmail(smtp_user, rcpt, msg.as_string())
        server.quit()
    except Exception:
        pass

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


SITEMAP_RESERVED = frozenset({
    "admin", "api", "contact", "embed", "konstruktor", "monument",
    "upload-image", "uploads", "save_image.php", "sitemap.xml", "robots.txt", "404",
})


def _site_base_url(cur) -> str:
    cur.execute("SELECT value FROM site_settings WHERE key='siteUrl'")
    row = cur.fetchone()
    return (row["value"] if row else "").rstrip("/") or "https://granit-sever.ru"


def _normalize_page_path(slug: str) -> str | None:
    s = (slug or "").strip()
    if not s:
        return None
    if not s.startswith("/"):
        s = "/" + s
    path = s.rstrip("/") or "/"
    if path == "/":
        return None
    segment = path.strip("/").split("/")[0].lower()
    if segment in SITEMAP_RESERVED:
        return None
    if "/" in path.strip("/"):
        return None
    return path


def build_sitemap_urls(cur) -> list[str]:
    site_url = _site_base_url(cur)
    urls: list[str] = [f"{site_url}/"]

    cur.execute(
        "SELECT slug FROM monuments WHERE slug IS NOT NULL AND slug != '' "
        "AND (in_stock=true OR in_stock IS NULL)"
    )
    monument_slugs = {r["slug"] for r in cur.fetchall() if r["slug"]}

    cur.execute("SELECT slug FROM pages WHERE visible=true AND slug IS NOT NULL AND slug != ''")
    page_paths = set()
    for r in cur.fetchall():
        path = _normalize_page_path(r["slug"])
        if path:
            page_paths.add(path)

    if "/konstruktor" not in page_paths:
        urls.append(f"{site_url}/konstruktor")

    for slug in sorted(monument_slugs):
        urls.append(f"{site_url}/monument/{slug}")

    for path in sorted(page_paths):
        urls.append(f"{site_url}{path}")

    seen = set()
    unique: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique.append(u)
    return unique


def render_sitemap_xml(urls: list[str]) -> str:
    today = __import__("datetime").date.today().isoformat()
    items = "\n".join(
        f"  <url><loc>{html_escape(u)}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq></url>"
        for u in urls
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{items}
</urlset>"""


def handle_sitemap(method, parts, cur, conn):
    action = parts[1] if len(parts) > 1 else ""
    if method in ("GET", "POST") and action in ("preview", "regenerate", ""):
        urls = build_sitemap_urls(cur)
        return JSONResponse({
            "ok": True,
            "urlCount": len(urls),
            "urls": urls,
            "sitemapUrl": f"{_site_base_url(cur)}/sitemap.xml",
        })
    return JSONResponse({"error": "Not found"}, status_code=404)


@app.get("/sitemap.xml")
async def sitemap():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        urls = build_sitemap_urls(cur)
        xml = render_sitemap_xml(urls)
    finally:
        cur.close()
        conn.close()
    return Response(content=xml, media_type="application/xml")


@app.get("/health")
def health():
    return {"ok": True}