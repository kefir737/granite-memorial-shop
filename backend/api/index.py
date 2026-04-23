"""
Main API for granit-sever.ru — CRUD via MySQL (Jino hosting).
Routing via ?path=entity[/id] query param.
"""
import json
import os
import pymysql
import pymysql.cursors


def get_conn():
    url = os.environ.get('MYSQL_URL', '')
    # Parse mysql://user:pass@host:port/db
    url = url.replace('mysql://', '')
    userpass, hostdb = url.split('@')
    user, password = userpass.split(':', 1)
    hostport, db = hostdb.split('/', 1)
    host, port = (hostport.split(':') + ['3306'])[:2]
    return pymysql.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=db,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def ok(data, status=200):
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': CORS,
            'body': json.dumps({'error': msg}, ensure_ascii=False)}


# ── row mappers ──────────────────────────────────────────────────────────────

def row_monument(r):
    imgs = r.get('images') or '[]'
    if isinstance(imgs, str):
        try:
            imgs = json.loads(imgs)
        except Exception:
            imgs = []
    return {
        'id': r['id'], 'name': r['name'], 'slug': r['slug'],
        'material': r['material'], 'style': r['style'],
        'price': r['price'], 'priceFrom': bool(r['price_from']),
        'installPrice': r['install_price'],
        'width': r['width'], 'height': r['height'], 'depth': r['depth'],
        'image': r['image'], 'images': imgs,
        'description': r['description'], 'fullDescription': r['full_description'],
        'inStock': bool(r['in_stock']),
    }


def row_service(r):
    return {'id': r['id'], 'title': r['title'], 'description': r['description'],
            'price': r['price'], 'icon': r['icon']}


def row_portfolio(r):
    return {'id': r['id'], 'title': r['title'], 'material': r['material'],
            'image': r['image'], 'year': r['year']}


def row_granite(r):
    return {'id': r['id'], 'name': r['name'], 'origin': r['origin'],
            'color': r['color'], 'hardness': r['hardness'],
            'description': r['description'], 'image': r['image']}


def row_menu(r):
    return {'id': r['id'], 'label': r['label'], 'href': r['href'],
            'order': r['sort_order'], 'visible': bool(r['visible'])}


# ── handlers ─────────────────────────────────────────────────────────────────

def handle_monuments(method, parts, body, cur, conn):
    if method == 'GET':
        if len(parts) == 1:
            cur.execute('SELECT * FROM monuments ORDER BY sort_order, id')
            return ok([row_monument(r) for r in cur.fetchall()])
        seg = parts[1]
        if seg.isdigit():
            cur.execute('SELECT * FROM monuments WHERE id=%s', (int(seg),))
        else:
            cur.execute('SELECT * FROM monuments WHERE slug=%s', (seg,))
        r = cur.fetchone()
        return ok(row_monument(r)) if r else err('Not found', 404)

    if method == 'POST':
        b = body
        cur.execute(
            '''INSERT INTO monuments
               (name,slug,material,style,price,price_from,install_price,
                width,height,depth,image,images,description,full_description,in_stock,sort_order)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
            (b.get('name',''), b.get('slug',''), b.get('material',''), b.get('style',''),
             b.get('price',0), int(bool(b.get('priceFrom',True))), b.get('installPrice',0),
             b.get('width',60), b.get('height',120), b.get('depth',8),
             b.get('image',''), json.dumps(b.get('images',[]), ensure_ascii=False),
             b.get('description',''), b.get('fullDescription',''),
             int(bool(b.get('inStock',True))), b.get('sortOrder',0))
        )
        conn.commit()
        cur.execute('SELECT * FROM monuments WHERE id=LAST_INSERT_ID()')
        return ok(row_monument(cur.fetchone()), 201)

    if method == 'PUT' and len(parts) == 2 and parts[1].isdigit():
        b = body
        cur.execute(
            '''UPDATE monuments SET
               name=%s,slug=%s,material=%s,style=%s,price=%s,price_from=%s,
               install_price=%s,width=%s,height=%s,depth=%s,image=%s,images=%s,
               description=%s,full_description=%s,in_stock=%s
               WHERE id=%s''',
            (b.get('name'), b.get('slug'), b.get('material'), b.get('style'),
             b.get('price'), int(bool(b.get('priceFrom'))), b.get('installPrice'),
             b.get('width'), b.get('height'), b.get('depth'),
             b.get('image'), json.dumps(b.get('images',[]), ensure_ascii=False),
             b.get('description'), b.get('fullDescription'),
             int(bool(b.get('inStock'))), int(parts[1]))
        )
        conn.commit()
        cur.execute('SELECT * FROM monuments WHERE id=%s', (int(parts[1]),))
        r = cur.fetchone()
        return ok(row_monument(r)) if r else err('Not found', 404)

    if method == 'DELETE' and len(parts) == 2 and parts[1].isdigit():
        cur.execute('DELETE FROM monuments WHERE id=%s', (int(parts[1]),))
        conn.commit()
        return ok({'deleted': True})

    return err('Not found', 404)


def handle_services(method, parts, body, cur, conn):
    if method == 'GET':
        cur.execute('SELECT * FROM services ORDER BY sort_order, id')
        return ok([row_service(r) for r in cur.fetchall()])

    if method == 'PUT':
        if len(parts) == 2 and parts[1].isdigit():
            b = body
            cur.execute(
                'UPDATE services SET title=%s,description=%s,price=%s,icon=%s WHERE id=%s',
                (b.get('title'), b.get('description'), b.get('price'), b.get('icon'), int(parts[1]))
            )
            conn.commit()
            cur.execute('SELECT * FROM services WHERE id=%s', (int(parts[1]),))
            r = cur.fetchone()
            return ok(row_service(r)) if r else err('Not found', 404)
        # Bulk update list
        items = body if isinstance(body, list) else []
        for item in items:
            cur.execute(
                'UPDATE services SET title=%s,description=%s,price=%s,icon=%s WHERE id=%s',
                (item.get('title'), item.get('description'), item.get('price'), item.get('icon'), item.get('id'))
            )
        conn.commit()
        cur.execute('SELECT * FROM services ORDER BY sort_order, id')
        return ok([row_service(r) for r in cur.fetchall()])

    return err('Not found', 404)


def handle_portfolio(method, parts, body, cur, conn):
    if method == 'GET':
        cur.execute('SELECT * FROM portfolio ORDER BY sort_order, id')
        return ok([row_portfolio(r) for r in cur.fetchall()])

    if method == 'POST':
        b = body
        cur.execute(
            'INSERT INTO portfolio (title,material,image,year,sort_order) VALUES (%s,%s,%s,%s,%s)',
            (b.get('title',''), b.get('material',''), b.get('image',''), b.get('year',2024), b.get('sortOrder',0))
        )
        conn.commit()
        cur.execute('SELECT * FROM portfolio WHERE id=LAST_INSERT_ID()')
        return ok(row_portfolio(cur.fetchone()), 201)

    if method == 'DELETE' and len(parts) == 2 and parts[1].isdigit():
        cur.execute('DELETE FROM portfolio WHERE id=%s', (int(parts[1]),))
        conn.commit()
        return ok({'deleted': True})

    return err('Not found', 404)


def handle_granite(method, parts, body, cur, conn):
    if method == 'GET':
        cur.execute('SELECT * FROM granite_types ORDER BY sort_order, id')
        return ok([row_granite(r) for r in cur.fetchall()])

    if method == 'PUT' and len(parts) == 2 and parts[1].isdigit():
        b = body
        cur.execute(
            'UPDATE granite_types SET name=%s,origin=%s,color=%s,hardness=%s,description=%s,image=%s WHERE id=%s',
            (b.get('name'), b.get('origin'), b.get('color'), b.get('hardness'),
             b.get('description'), b.get('image'), int(parts[1]))
        )
        conn.commit()
        cur.execute('SELECT * FROM granite_types WHERE id=%s', (int(parts[1]),))
        r = cur.fetchone()
        return ok(row_granite(r)) if r else err('Not found', 404)

    return err('Not found', 404)


def handle_menu(method, parts, body, cur, conn):
    if method == 'GET':
        cur.execute('SELECT * FROM menu_items ORDER BY sort_order, id')
        return ok([row_menu(r) for r in cur.fetchall()])

    if method == 'PUT':
        items = body if isinstance(body, list) else []
        cur.execute('DELETE FROM menu_items')
        for i, item in enumerate(items):
            cur.execute(
                'INSERT INTO menu_items (id,label,href,sort_order,visible) VALUES (%s,%s,%s,%s,%s)',
                (item.get('id', i+1), item.get('label',''), item.get('href','#'),
                 item.get('order', i+1), int(bool(item.get('visible', True))))
            )
        conn.commit()
        cur.execute('SELECT * FROM menu_items ORDER BY sort_order, id')
        return ok([row_menu(r) for r in cur.fetchall()])

    return err('Not found', 404)


def handle_settings(method, parts, body, cur, conn):
    if method == 'GET':
        cur.execute('SELECT `key`, `value` FROM site_settings')
        return ok({r['key']: r['value'] for r in cur.fetchall()})

    if method == 'PUT':
        for key, value in (body if isinstance(body, dict) else {}).items():
            cur.execute(
                'INSERT INTO site_settings (`key`,`value`) VALUES (%s,%s) ON DUPLICATE KEY UPDATE `value`=%s',
                (key, str(value), str(value))
            )
        conn.commit()
        cur.execute('SELECT `key`, `value` FROM site_settings')
        return ok({r['key']: r['value'] for r in cur.fetchall()})

    return err('Not found', 404)


# ── main handler ─────────────────────────────────────────────────────────────

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET').upper()
    qs = event.get('queryStringParameters') or {}
    path_raw = qs.get('path', '') or event.get('path', '/').lstrip('/')
    parts = [p for p in path_raw.split('/') if p]

    body = {}
    raw = event.get('body') or ''
    if raw:
        try:
            parsed = json.loads(raw)
            body = json.loads(parsed) if isinstance(parsed, str) else parsed
        except Exception:
            body = {}

    if not parts:
        return ok({'status': 'ok', 'db': 'mysql', 'version': '2.0'})

    entity = parts[0]
    conn = get_conn()
    try:
        cur = conn.cursor()
        if entity == 'monuments':
            return handle_monuments(method, parts, body, cur, conn)
        if entity == 'services':
            return handle_services(method, parts, body, cur, conn)
        if entity == 'portfolio':
            return handle_portfolio(method, parts, body, cur, conn)
        if entity in ('granite', 'granite_types'):
            return handle_granite(method, parts, body, cur, conn)
        if entity == 'menu':
            return handle_menu(method, parts, body, cur, conn)
        if entity == 'settings':
            return handle_settings(method, parts, body, cur, conn)
        return err('Unknown endpoint', 404)
    finally:
        conn.close()
