CREATE TABLE IF NOT EXISTS monuments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    material TEXT NOT NULL,
    style TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    price_from BOOLEAN NOT NULL DEFAULT true,
    install_price INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 60,
    height INTEGER NOT NULL DEFAULT 120,
    depth INTEGER NOT NULL DEFAULT 8,
    image TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]',
    description TEXT NOT NULL DEFAULT '',
    full_description TEXT NOT NULL DEFAULT '',
    in_stock BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'Star',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    material TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL DEFAULT 2024,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS granite_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    origin TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    hardness TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL DEFAULT '#',
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

INSERT INTO monuments (name,slug,material,style,price,price_from,install_price,width,height,depth,image,images,description,full_description,in_stock,sort_order) VALUES
('Классическая стела','klassicheskaya-stela','Чёрный гранит','Классический',24900,true,8000,60,120,8,'/images/monument-1.jpg','["/images/monument-1.jpg"]','Строгий вертикальный памятник из полированного чёрного гранита.','Строгий вертикальный памятник из полированного чёрного гранита абсолют блэк.',true,1),
('Арочный с гравюрой','arochny-s-gravyuroy','Карельский гранит','Арочный',38500,true,10000,70,130,10,'/images/monument-2.jpg','["/images/monument-2.jpg"]','Памятник арочной формы с художественной гравюрой.','Памятник арочной формы из карельского гранита с уникальным природным рисунком.',true,2),
('Двойной горизонтальный','dvojnoj-gorizontalny','Габбро-диабаз','Семейный',52000,true,15000,120,90,10,'/images/monument-3.jpg','["/images/monument-3.jpg"]','Семейный памятник для двух захоронений.','Горизонтальный семейный памятник из габбро-диабаза.',true,3),
('Крест православный','krest-pravoslavny','Чёрный гранит','Религиозный',29900,false,9000,50,150,10,'/images/monument-1.jpg','["/images/monument-1.jpg"]','Православный крест из полированного гранита.','Православный крест канонической формы из полированного чёрного гранита.',true,4),
('Эксклюзивный с портретом','eksklyuzivny-s-portretom','Карельский гранит','Эксклюзивный',78000,true,18000,80,140,12,'/images/monument-2.jpg','["/images/monument-2.jpg"]','Индивидуальный проект с лазерным портретом.','Эксклюзивный памятник, разработанный индивидуально.',false,5),
('Детский ангел','detsky-angel','Белый мрамор','Детский',45000,true,10000,55,100,8,'/images/monument-3.jpg','["/images/monument-3.jpg"]','Нежный памятник в форме ангела из белого мрамора.','Памятник из белого каррарского мрамора в форме ангела.',true,6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (title,description,price,icon,sort_order) VALUES
('Изготовление','Собственное производство в Москве. От эскиза до готового изделия — 14–30 дней.','от 15 000 ₽','Hammer',1),
('Установка','Профессиональная установка с соблюдением всех норм.','от 8 000 ₽','Package',2),
('Доставка','Доставка по Москве и области, а также в регионы.','от 3 500 ₽','Truck',3),
('Гравировка','Лазерная и алмазная гравировка портретов, текстов, орнаментов.','от 2 000 ₽','PenLine',4),
('Благоустройство','Укладка тротуарной плитки, установка ограды, цветники.','от 12 000 ₽','TreePine',5),
('Реставрация','Восстановление старых памятников: полировка, обновление надписей.','от 5 000 ₽','RefreshCw',6)
ON CONFLICT DO NOTHING;

INSERT INTO portfolio (title,material,image,year,sort_order) VALUES
('Семейный мемориал','Чёрный гранит','/images/monument-1.jpg',2024,1),
('Эксклюзивный с горельефом','Карельский гранит','/images/monument-2.jpg',2024,2),
('Православный крест','Габбро-диабаз','/images/monument-3.jpg',2023,3),
('Арочный с портретом','Чёрный гранит','/images/monument-1.jpg',2023,4),
('Детский памятник','Белый мрамор','/images/monument-2.jpg',2024,5),
('Двойной горизонтальный','Карельский гранит','/images/monument-3.jpg',2023,6)
ON CONFLICT DO NOTHING;

INSERT INTO granite_types (name,origin,color,hardness,description,image,sort_order) VALUES
('Чёрный гранит (Абсолют Блэк)','Индия','Глубокий чёрный','7 по шкале Мооса','Самый популярный материал для памятников. Равномерный чёрный цвет, без вкраплений.','/images/monument-3.jpg',1),
('Карельский гранит','Россия, Карелия','Серо-голубой с тёмными вкраплениями','6.5 по шкале Мооса','Уникальный узор из тёмных и светлых минералов создаёт неповторимый вид.','/images/monument-1.jpg',2),
('Габбро-диабаз','Россия, Карелия','Тёмно-серый, почти чёрный','8 по шкале Мооса','Исключительно прочная горная порода. Самый износостойкий материал.','/images/monument-2.jpg',3),
('Белый мрамор','Греция, Италия','Белый с прожилками','3-4 по шкале Мооса','Благородный и изысканный материал. Символизирует чистоту и вечность.','/images/monument-3.jpg',4)
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (label,href,sort_order,visible) VALUES
('Каталог','#catalog',1,true),
('Услуги','#services',2,true),
('Портфолио','#portfolio',3,true),
('О граните','#granite',4,true),
('Контакты','#contacts',5,true)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS page_menu_assignments (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE(page_id, location)
);

CREATE INDEX IF NOT EXISTS idx_page_menu_assignments_location ON page_menu_assignments(location);

INSERT INTO site_settings (key,value) VALUES
('phone','+7 (495) 000-00-00'),
('description','Изготовление и установка памятников из гранита в Москве')
ON CONFLICT (key) DO NOTHING;