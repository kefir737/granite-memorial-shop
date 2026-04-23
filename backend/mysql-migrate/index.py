"""
One-time migration: create tables and seed data in MySQL on Jino.
Call via POST / — runs all migrations, idempotent (CREATE TABLE IF NOT EXISTS).
"""
import json
import os
import pymysql
import pymysql.cursors


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

IMG1 = 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg'
IMG2 = 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg'
IMG3 = 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg'

CREATE_SQL = """
CREATE TABLE IF NOT EXISTS monuments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    material VARCHAR(100) NOT NULL,
    style VARCHAR(100) NOT NULL,
    price INT NOT NULL DEFAULT 0,
    price_from TINYINT(1) NOT NULL DEFAULT 1,
    install_price INT NOT NULL DEFAULT 0,
    width INT NOT NULL DEFAULT 60,
    height INT NOT NULL DEFAULT 120,
    depth INT NOT NULL DEFAULT 8,
    image TEXT NOT NULL,
    images TEXT NOT NULL DEFAULT '[]',
    description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    in_stock TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price VARCHAR(100) NOT NULL DEFAULT '',
    icon VARCHAR(100) NOT NULL DEFAULT 'Star',
    sort_order INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    material VARCHAR(100) NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    year INT NOT NULL DEFAULT 2024,
    sort_order INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS granite_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin VARCHAR(100) NOT NULL DEFAULT '',
    color VARCHAR(100) NOT NULL DEFAULT '',
    hardness VARCHAR(100) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    href VARCHAR(255) NOT NULL DEFAULT '#',
    sort_order INT NOT NULL DEFAULT 0,
    visible TINYINT(1) NOT NULL DEFAULT 1
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT NOT NULL DEFAULT ''
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"""


def get_conn():
    url = os.environ.get('MYSQL_URL', '')
    url = url.replace('mysql://', '')
    userpass, hostdb = url.split('@')
    user, password = userpass.split(':', 1)
    hostport, db = hostdb.split('/', 1)
    host, port = (hostport.split(':') + ['3306'])[:2]
    return pymysql.connect(
        host=host, port=int(port), user=user, password=password, database=db,
        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, autocommit=True,
    )


def seed(cur):
    # Only seed if empty
    cur.execute('SELECT COUNT(*) as cnt FROM monuments')
    if cur.fetchone()['cnt'] > 0:
        return 'already seeded'

    monuments = [
        ('Классическая стела', 'klassicheskaya-stela', 'Чёрный гранит', 'Классический',
         24900, 1, 8000, 60, 120, 8, IMG1,
         json.dumps([IMG1, IMG2], ensure_ascii=False),
         'Строгий вертикальный памятник из полированного чёрного гранита. Подходит для большинства типов захоронений.',
         'Строгий вертикальный памятник из полированного чёрного гранита абсолют блэк. Идеально ровная поверхность создаёт чёткое изображение при гравировке. Подходит для большинства типов захоронений. Изготовление занимает 14–21 день.', 1, 1),
        ('Арочный с гравюрой', 'arochny-s-gravyuroy', 'Карельский гранит', 'Арочный',
         38500, 1, 10000, 70, 130, 10, IMG2,
         json.dumps([IMG2, IMG3], ensure_ascii=False),
         'Памятник арочной формы с художественной гравюрой. Карельский гранит отличается уникальным рисунком.',
         'Памятник арочной формы из карельского гранита с уникальным природным рисунком. Каждый камень неповторим. Художественная гравюра наносится лазерным методом — изображение не выцветает и не стирается.', 1, 2),
        ('Двойной горизонтальный', 'dvojnoj-gorizontalny', 'Габбро-диабаз', 'Семейный',
         52000, 1, 15000, 120, 90, 10, IMG3,
         json.dumps([IMG3, IMG1], ensure_ascii=False),
         'Семейный памятник для двух захоронений. Тёмный габбро-диабаз с минимальным уходом.',
         'Горизонтальный семейный памятник из габбро-диабаза — самого прочного камня в каталоге (8 по шкале Мооса). Рассчитан на два захоронения. Не требует обработки, не трескается от мороза.', 1, 3),
        ('Крест православный', 'krest-pravoslavny', 'Чёрный гранит', 'Религиозный',
         29900, 0, 9000, 50, 150, 10, IMG1,
         json.dumps([IMG1], ensure_ascii=False),
         'Православный крест из полированного гранита с традиционным силуэтом.',
         'Православный крест канонической формы из полированного чёрного гранита. Пропорции соответствуют традиционным образцам. Возможна гравировка лика святого, текста молитвы и эпитафии.', 1, 4),
        ('Эксклюзивный с портретом', 'eksklyuzivny-s-portretom', 'Карельский гранит', 'Эксклюзивный',
         78000, 1, 18000, 80, 140, 12, IMG2,
         json.dumps([IMG2, IMG1], ensure_ascii=False),
         'Индивидуальный проект с лазерным портретом и художественной гравировкой.',
         'Эксклюзивный памятник, разработанный индивидуально. Лазерный портрет высокого разрешения. Художественная гравировка орнаментов, эпитафий, сцен. Срок изготовления 30–45 дней.', 0, 5),
        ('Детский ангел', 'detsky-angel', 'Белый мрамор', 'Детский',
         45000, 1, 10000, 55, 100, 8, IMG3,
         json.dumps([IMG3, IMG2], ensure_ascii=False),
         'Нежный памятник в форме ангела из белого мрамора. Специально для детских захоронений.',
         'Памятник из белого каррарского мрамора в форме ангела. Создан с особой бережностью для детских захоронений. Возможна гравировка имени и дат.', 1, 6),
    ]
    cur.executemany(
        '''INSERT INTO monuments (name,slug,material,style,price,price_from,install_price,
           width,height,depth,image,images,description,full_description,in_stock,sort_order)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
        monuments
    )

    services = [
        ('Изготовление', 'Собственное производство. От эскиза до готового изделия — 14–30 дней. Контроль качества на каждом этапе.', 'от 15 000 ₽', 'Hammer', 1),
        ('Установка', 'Профессиональная установка с соблюдением всех норм. Выравнивание, бетонирование, укладка плитки.', 'от 8 000 ₽', 'Package', 2),
        ('Доставка', 'Доставка по Москве и области, а также в регионы. Специализированный транспорт.', 'от 3 500 ₽', 'Truck', 3),
        ('Гравировка', 'Лазерная и алмазная гравировка портретов, текстов, орнаментов.', 'от 2 000 ₽', 'PenLine', 4),
        ('Благоустройство', 'Укладка тротуарной плитки, установка ограды, цветники.', 'от 12 000 ₽', 'TreePine', 5),
        ('Реставрация', 'Восстановление старых памятников: полировка, обновление надписей, замена сколов.', 'от 5 000 ₽', 'RefreshCw', 6),
    ]
    cur.executemany(
        'INSERT INTO services (title,description,price,icon,sort_order) VALUES (%s,%s,%s,%s,%s)',
        services
    )

    portfolio = [
        ('Семейный мемориал', 'Чёрный гранит', IMG1, 2024, 1),
        ('Эксклюзивный с горельефом', 'Карельский гранит', IMG2, 2024, 2),
        ('Православный крест', 'Габбро-диабаз', IMG3, 2023, 3),
        ('Арочный с портретом', 'Чёрный гранит', IMG1, 2023, 4),
        ('Детский памятник', 'Белый мрамор', IMG2, 2024, 5),
        ('Двойной горизонтальный', 'Карельский гранит', IMG3, 2023, 6),
    ]
    cur.executemany(
        'INSERT INTO portfolio (title,material,image,year,sort_order) VALUES (%s,%s,%s,%s,%s)',
        portfolio
    )

    granite = [
        ('Чёрный гранит (Абсолют Блэк)', 'Индия', 'Глубокий чёрный', '7 по шкале Мооса',
         'Самый популярный материал для памятников. Равномерный чёрный цвет, без вкраплений. Прекрасно полируется. Не выцветает.', IMG3, 1),
        ('Карельский гранит', 'Россия, Карелия', 'Серо-голубой с тёмными вкраплениями', '6.5 по шкале Мооса',
         'Уникальный узор из тёмных и светлых минералов. Каждое изделие — единственное в своём роде. Прочный и морозостойкий.', IMG1, 2),
        ('Габбро-диабаз', 'Россия, Карелия', 'Тёмно-серый, почти чёрный', '8 по шкале Мооса',
         'Исключительно прочная горная порода. Самый износостойкий материал. Устойчив к перепадам температур.', IMG2, 3),
        ('Белый мрамор', 'Греция, Италия', 'Белый с прожилками', '3-4 по шкале Мооса',
         'Благородный материал. Символизирует чистоту и вечность. Используется для детских и женских памятников.', IMG3, 4),
    ]
    cur.executemany(
        'INSERT INTO granite_types (name,origin,color,hardness,description,image,sort_order) VALUES (%s,%s,%s,%s,%s,%s,%s)',
        granite
    )

    menu = [
        ('Каталог', '#catalog', 1, 1),
        ('Услуги', '#services', 2, 1),
        ('Портфолио', '#portfolio', 3, 1),
        ('О граните', '#granite', 4, 1),
        ('Контакты', '#contacts', 5, 1),
    ]
    cur.executemany(
        'INSERT INTO menu_items (label,href,sort_order,visible) VALUES (%s,%s,%s,%s)',
        menu
    )

    settings = [
        ('companyName', 'Гранит Север'),
        ('phone', '+7 (495) 123-45-67'),
        ('phone2', '+7 (800) 555-01-01'),
        ('email', 'info@granit-sever.ru'),
        ('address', 'г. Москва, ул. Гранитная, д. 12, стр. 1'),
        ('workHours', 'Пн–Сб: 9:00–19:00, Вс: 10:00–17:00'),
        ('mapUrl', ''),
        ('heroTitle', 'Памятники из гранита'),
        ('heroSubtitle', 'Собственное производство · Установка · Доставка по России'),
        ('metaDescription', 'Изготовление памятников из гранита. granit-sever.ru'),
        ('notificationEmail', ''),
        ('smtpUser', ''),
        ('smtpHost', 'smtp.yandex.ru'),
        ('smtpPort', '465'),
    ]
    cur.executemany(
        'INSERT INTO site_settings (`key`,`value`) VALUES (%s,%s) ON DUPLICATE KEY UPDATE `value`=`value`',
        settings
    )

    return 'seeded'


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    results = []
    try:
        cur = conn.cursor()
        # Run CREATE TABLE statements one by one
        for stmt in [s.strip() for s in CREATE_SQL.strip().split(';') if s.strip()]:
            cur.execute(stmt)
            results.append(stmt[:60].replace('\n', ' ') + '...')

        seed_result = seed(cur)
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({
                'ok': True,
                'tables_created': len(results),
                'seed': seed_result,
            }, ensure_ascii=False)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': CORS,
            'body': json.dumps({'ok': False, 'error': str(e)}, ensure_ascii=False)
        }
    finally:
        conn.close()
