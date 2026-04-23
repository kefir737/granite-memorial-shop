"""
Main API for granit-sever.ru — CRUD for all entities stored in PostgreSQL.
Endpoints:
  GET  /monuments          — list all
  GET  /monuments/{id}     — single by id
  GET  /monuments/slug/{slug} — single by slug
  POST /monuments          — create
  PUT  /monuments/{id}     — update
  DELETE /monuments/{id}   — delete

  Same pattern for: services, portfolio, granite_types, menu_items

  GET  /settings           — all settings as {key: value}
  PUT  /settings           — update {key: value, ...}
"""
import json
import os
import psycopg2
import psycopg2.extras


SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p34993028_granite_memorial_sho')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data, status=200):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, status=400):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def row_to_monument(r):
    return {
        'id': r['id'], 'name': r['name'], 'slug': r['slug'],
        'material': r['material'], 'style': r['style'],
        'price': r['price'], 'priceFrom': r['price_from'],
        'installPrice': r['install_price'],
        'width': r['width'], 'height': r['height'], 'depth': r['depth'],
        'image': r['image'],
        'images': r['images'] if isinstance(r['images'], list) else json.loads(r['images'] or '[]'),
        'description': r['description'], 'fullDescription': r['full_description'],
        'inStock': r['in_stock'],
    }


def row_to_service(r):
    return {'id': r['id'], 'title': r['title'], 'description': r['description'],
            'price': r['price'], 'icon': r['icon']}


def row_to_portfolio(r):
    return {'id': r['id'], 'title': r['title'], 'material': r['material'],
            'image': r['image'], 'year': r['year']}


def row_to_granite(r):
    return {'id': r['id'], 'name': r['name'], 'origin': r['origin'],
            'color': r['color'], 'hardness': r['hardness'],
            'description': r['description'], 'image': r['image']}


def row_to_menu(r):
    return {'id': r['id'], 'label': r['label'], 'href': r['href'],
            'order': r['sort_order'], 'visible': r['visible']}


def handle_monuments(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        if len(path_parts) == 1:
            cur.execute(f'SELECT * FROM {s}.monuments ORDER BY sort_order, id')
            return ok([row_to_monument(r) for r in cur.fetchall()])
        if len(path_parts) == 2:
            if path_parts[1].isdigit():
                cur.execute(f'SELECT * FROM {s}.monuments WHERE id = %s', (int(path_parts[1]),))
            else:
                cur.execute(f'SELECT * FROM {s}.monuments WHERE slug = %s', (path_parts[1],))
            r = cur.fetchone()
            return ok(row_to_monument(r)) if r else err('Not found', 404)
        if len(path_parts) == 3 and path_parts[1] == 'slug':
            cur.execute(f'SELECT * FROM {s}.monuments WHERE slug = %s', (path_parts[2],))
            r = cur.fetchone()
            return ok(row_to_monument(r)) if r else err('Not found', 404)

    if method == 'POST':
        b = body
        cur.execute(
            f'''INSERT INTO {s}.monuments
            (name, slug, material, style, price, price_from, install_price,
             width, height, depth, image, images, description, full_description, in_stock, sort_order)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *''',
            (b.get('name',''), b.get('slug',''), b.get('material',''), b.get('style',''),
             b.get('price',0), b.get('priceFrom',True), b.get('installPrice',0),
             b.get('width',60), b.get('height',120), b.get('depth',8),
             b.get('image',''), json.dumps(b.get('images',[]), ensure_ascii=False),
             b.get('description',''), b.get('fullDescription',''),
             b.get('inStock',True), b.get('sortOrder',0))
        )
        conn.commit()
        return ok(row_to_monument(cur.fetchone()), 201)

    if method == 'PUT' and len(path_parts) == 2 and path_parts[1].isdigit():
        b = body
        cur.execute(
            f'''UPDATE {s}.monuments SET
            name=%s, slug=%s, material=%s, style=%s, price=%s, price_from=%s,
            install_price=%s, width=%s, height=%s, depth=%s, image=%s, images=%s,
            description=%s, full_description=%s, in_stock=%s
            WHERE id=%s RETURNING *''',
            (b.get('name'), b.get('slug'), b.get('material'), b.get('style'),
             b.get('price'), b.get('priceFrom'), b.get('installPrice'),
             b.get('width'), b.get('height'), b.get('depth'),
             b.get('image'), json.dumps(b.get('images',[]), ensure_ascii=False),
             b.get('description'), b.get('fullDescription'), b.get('inStock'),
             int(path_parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return ok(row_to_monument(r)) if r else err('Not found', 404)

    if method == 'DELETE' and len(path_parts) == 2 and path_parts[1].isdigit():
        cur.execute(f'DELETE FROM {s}.monuments WHERE id=%s', (int(path_parts[1]),))
        conn.commit()
        return ok({'deleted': True})

    return err('Not found', 404)


def handle_services(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        cur.execute(f'SELECT * FROM {s}.services ORDER BY sort_order, id')
        return ok([row_to_service(r) for r in cur.fetchall()])

    if method == 'PUT' and len(path_parts) == 2 and path_parts[1].isdigit():
        b = body
        cur.execute(
            f'UPDATE {s}.services SET title=%s, description=%s, price=%s, icon=%s WHERE id=%s RETURNING *',
            (b.get('title'), b.get('description'), b.get('price'), b.get('icon'), int(path_parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return ok(row_to_service(r)) if r else err('Not found', 404)

    if method == 'PUT' and len(path_parts) == 1:
        rows = body if isinstance(body, list) else []
        for item in rows:
            cur.execute(
                f'UPDATE {s}.services SET title=%s, description=%s, price=%s, icon=%s WHERE id=%s',
                (item.get('title'), item.get('description'), item.get('price'), item.get('icon'), item.get('id'))
            )
        conn.commit()
        cur.execute(f'SELECT * FROM {s}.services ORDER BY sort_order, id')
        return ok([row_to_service(r) for r in cur.fetchall()])

    return err('Not found', 404)


def handle_portfolio(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        cur.execute(f'SELECT * FROM {s}.portfolio ORDER BY sort_order, id')
        return ok([row_to_portfolio(r) for r in cur.fetchall()])

    if method == 'POST':
        b = body
        cur.execute(
            f'INSERT INTO {s}.portfolio (title, material, image, year, sort_order) VALUES (%s,%s,%s,%s,%s) RETURNING *',
            (b.get('title',''), b.get('material',''), b.get('image',''), b.get('year',2024), b.get('sortOrder',0))
        )
        conn.commit()
        return ok(row_to_portfolio(cur.fetchone()), 201)

    if method == 'DELETE' and len(path_parts) == 2 and path_parts[1].isdigit():
        cur.execute(f'DELETE FROM {s}.portfolio WHERE id=%s', (int(path_parts[1]),))
        conn.commit()
        return ok({'deleted': True})

    return err('Not found', 404)


def handle_granite(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        cur.execute(f'SELECT * FROM {s}.granite_types ORDER BY sort_order, id')
        return ok([row_to_granite(r) for r in cur.fetchall()])

    if method == 'PUT' and len(path_parts) == 2 and path_parts[1].isdigit():
        b = body
        cur.execute(
            f'UPDATE {s}.granite_types SET name=%s, origin=%s, color=%s, hardness=%s, description=%s, image=%s WHERE id=%s RETURNING *',
            (b.get('name'), b.get('origin'), b.get('color'), b.get('hardness'),
             b.get('description'), b.get('image'), int(path_parts[1]))
        )
        conn.commit()
        r = cur.fetchone()
        return ok(row_to_granite(r)) if r else err('Not found', 404)

    return err('Not found', 404)


def handle_menu(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        cur.execute(f'SELECT * FROM {s}.menu_items ORDER BY sort_order, id')
        return ok([row_to_menu(r) for r in cur.fetchall()])

    if method == 'PUT':
        items = body if isinstance(body, list) else []
        cur.execute(f'DELETE FROM {s}.menu_items')
        for i, item in enumerate(items):
            cur.execute(
                f'INSERT INTO {s}.menu_items (id, label, href, sort_order, visible) VALUES (%s,%s,%s,%s,%s)',
                (item.get('id', i+1), item.get('label',''), item.get('href','#'), item.get('order', i+1), item.get('visible', True))
            )
        conn.commit()
        cur.execute(f'SELECT * FROM {s}.menu_items ORDER BY sort_order, id')
        return ok([row_to_menu(r) for r in cur.fetchall()])

    return err('Not found', 404)


def handle_settings(method, path_parts, body, conn):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    s = SCHEMA

    if method == 'GET':
        cur.execute(f'SELECT key, value FROM {s}.site_settings')
        return ok({r['key']: r['value'] for r in cur.fetchall()})

    if method == 'PUT':
        for key, value in (body if isinstance(body, dict) else {}).items():
            cur.execute(
                f'INSERT INTO {s}.site_settings (key, value) VALUES (%s, %s) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value',
                (key, str(value))
            )
        conn.commit()
        cur.execute(f'SELECT key, value FROM {s}.site_settings')
        return ok({r['key']: r['value'] for r in cur.fetchall()})

    return err('Not found', 404)


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET').upper()

    # Path can come as query param ?path=monuments/1 (platform workaround)
    qs = event.get('queryStringParameters') or {}
    path_raw = qs.get('path', '') or event.get('path', '/').lstrip('/')
    path_parts = [p for p in path_raw.split('/') if p]

    body = {}
    raw = event.get('body') or ''
    if raw:
        try:
            parsed = json.loads(raw)
            body = json.loads(parsed) if isinstance(parsed, str) else parsed
        except Exception:
            body = {}

    if not path_parts:
        return ok({'status': 'ok', 'version': '1.0'})

    entity = path_parts[0]
    rest = path_parts

    conn = get_conn()
    try:
        if entity == 'monuments':
            return handle_monuments(method, rest, body, conn)
        if entity == 'services':
            return handle_services(method, rest, body, conn)
        if entity == 'portfolio':
            return handle_portfolio(method, rest, body, conn)
        if entity in ('granite', 'granite_types'):
            return handle_granite(method, rest, body, conn)
        if entity == 'menu':
            return handle_menu(method, rest, body, conn)
        if entity == 'settings':
            return handle_settings(method, rest, body, conn)
        return err('Unknown endpoint', 404)
    finally:
        conn.close()