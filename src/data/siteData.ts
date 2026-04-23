export type Monument = {
  id: number;
  name: string;
  material: string;
  style: string;
  price: number;
  priceFrom: boolean;
  width: number;
  height: number;
  depth: number;
  weight: number;
  complexity: 'простой' | 'средний' | 'сложный';
  image: string;
  description: string;
  inStock: boolean;
};

export type Service = {
  id: number;
  title: string;
  description: string;
  price: string;
  icon: string;
};

export type Portfolio = {
  id: number;
  title: string;
  material: string;
  image: string;
  year: number;
};

export type GraniteType = {
  id: number;
  name: string;
  origin: string;
  color: string;
  hardness: string;
  description: string;
  image: string;
};

export type MenuItem = {
  id: number;
  label: string;
  href: string;
  order: number;
  visible: boolean;
};

export type PageContent = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
};

export type SiteSettings = {
  companyName: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  workHours: string;
  mapUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  metaDescription: string;
};

export const defaultMonuments: Monument[] = [
  {
    id: 1,
    name: 'Классический стелой',
    material: 'Чёрный гранит',
    style: 'Классический',
    price: 24900,
    priceFrom: true,
    width: 60,
    height: 120,
    depth: 8,
    weight: 145,
    complexity: 'простой',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg',
    description: 'Строгий вертикальный памятник из полированного чёрного гранита. Подходит для большинства типов захоронений.',
    inStock: true,
  },
  {
    id: 2,
    name: 'Арочный с гравюрой',
    material: 'Карельский гранит',
    style: 'Арочный',
    price: 38500,
    priceFrom: true,
    width: 70,
    height: 130,
    depth: 10,
    weight: 190,
    complexity: 'средний',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg',
    description: 'Памятник арочной формы с художественной гравюрой. Карельский гранит отличается уникальным рисунком и долговечностью.',
    inStock: true,
  },
  {
    id: 3,
    name: 'Двойной горизонтальный',
    material: 'Габбро-диабаз',
    style: 'Семейный',
    price: 52000,
    priceFrom: true,
    width: 120,
    height: 90,
    depth: 10,
    weight: 280,
    complexity: 'средний',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg',
    description: 'Семейный памятник для двух захоронений. Тёмный габбро-диабаз с минимальным уходом и максимальным сроком службы.',
    inStock: true,
  },
  {
    id: 4,
    name: 'Крест православный',
    material: 'Чёрный гранит',
    style: 'Религиозный',
    price: 29900,
    priceFrom: false,
    width: 50,
    height: 150,
    depth: 10,
    weight: 160,
    complexity: 'средний',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg',
    description: 'Православный крест из полированного гранита с традиционным силуэтом. Возможна гравировка образа и текста.',
    inStock: true,
  },
  {
    id: 5,
    name: 'Эксклюзивный с портретом',
    material: 'Карельский гранит',
    style: 'Эксклюзивный',
    price: 78000,
    priceFrom: true,
    width: 80,
    height: 140,
    depth: 12,
    weight: 250,
    complexity: 'сложный',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg',
    description: 'Индивидуальный проект с лазерным портретом и художественной гравировкой. Уникальный памятник, созданный по вашим пожеланиям.',
    inStock: false,
  },
  {
    id: 6,
    name: 'Детский ангел',
    material: 'Белый мрамор',
    style: 'Детский',
    price: 45000,
    priceFrom: true,
    width: 55,
    height: 100,
    depth: 8,
    weight: 120,
    complexity: 'сложный',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg',
    description: 'Нежный памятник в форме ангела из белого мрамора. Специально разработан для детских захоронений.',
    inStock: true,
  },
];

export const defaultServices: Service[] = [
  {
    id: 1,
    title: 'Изготовление',
    description: 'Собственное производство в Москве. От эскиза до готового изделия — 14–30 дней. Контроль качества на каждом этапе.',
    price: 'от 15 000 ₽',
    icon: 'Hammer',
  },
  {
    id: 2,
    title: 'Установка',
    description: 'Профессиональная установка с соблюдением всех норм. Выравнивание, бетонирование, укладка плитки вокруг.',
    price: 'от 8 000 ₽',
    icon: 'Package',
  },
  {
    id: 3,
    title: 'Доставка',
    description: 'Доставка по Москве и области, а также в регионы. Специализированный транспорт с мягкой фиксацией.',
    price: 'от 3 500 ₽',
    icon: 'Truck',
  },
  {
    id: 4,
    title: 'Гравировка',
    description: 'Лазерная и алмазная гравировка портретов, текстов, орнаментов. Точность и долговечность изображения.',
    price: 'от 2 000 ₽',
    icon: 'PenLine',
  },
  {
    id: 5,
    title: 'Благоустройство',
    description: 'Укладка тротуарной плитки, установка ограды, цветники. Полное оформление места захоронения.',
    price: 'от 12 000 ₽',
    icon: 'TreePine',
  },
  {
    id: 6,
    title: 'Реставрация',
    description: 'Восстановление старых памятников: полировка, обновление надписей, замена сколов. Вернём прежний вид.',
    price: 'от 5 000 ₽',
    icon: 'RefreshCw',
  },
];

export const defaultPortfolio: Portfolio[] = [
  { id: 1, title: 'Семейный мемориал', material: 'Чёрный гранит', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', year: 2024 },
  { id: 2, title: 'Эксклюзивный с горельефом', material: 'Карельский гранит', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', year: 2024 },
  { id: 3, title: 'Православный крест', material: 'Габбро-диабаз', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', year: 2023 },
  { id: 4, title: 'Арочный с портретом', material: 'Чёрный гранит', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', year: 2023 },
  { id: 5, title: 'Детский памятник', material: 'Белый мрамор', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', year: 2024 },
  { id: 6, title: 'Двойной горизонтальный', material: 'Карельский гранит', image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', year: 2023 },
];

export const defaultGraniteTypes: GraniteType[] = [
  {
    id: 1,
    name: 'Чёрный гранит (Абсолют Блэк)',
    origin: 'Индия',
    color: 'Глубокий чёрный',
    hardness: '7 по шкале Мооса',
    description: 'Самый популярный материал для памятников. Равномерный чёрный цвет, без вкраплений. Прекрасно полируется, надписи и портреты выглядят контрастно и чётко. Не выцветает.',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg',
  },
  {
    id: 2,
    name: 'Карельский гранит',
    origin: 'Россия, Карелия',
    color: 'Серо-голубой с тёмными вкраплениями',
    hardness: '6.5 по шкале Мооса',
    description: 'Уникальный узор из тёмных и светлых минералов создаёт неповторимый вид. Каждое изделие — единственное в своём роде. Прочный и морозостойкий, идеален для российского климата.',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg',
  },
  {
    id: 3,
    name: 'Габбро-диабаз',
    origin: 'Россия, Карелия',
    color: 'Тёмно-серый, почти чёрный',
    hardness: '8 по шкале Мооса',
    description: 'Исключительно прочная горная порода. Самый износостойкий материал среди всех используемых в мемориальном производстве. Устойчив к агрессивной среде и перепадам температур.',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg',
  },
  {
    id: 4,
    name: 'Белый мрамор',
    origin: 'Греция, Италия',
    color: 'Белый с прожилками',
    hardness: '3-4 по шкале Мооса',
    description: 'Благородный и изысканный материал. Символизирует чистоту и вечность. Требует более тщательного ухода, но создаёт неповторимый облик. Используется для детских и женских памятников.',
    image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg',
  },
];

export const defaultMenuItems: MenuItem[] = [
  { id: 1, label: 'Каталог', href: '#catalog', order: 1, visible: true },
  { id: 2, label: 'Услуги', href: '#services', order: 2, visible: true },
  { id: 3, label: 'Портфолио', href: '#portfolio', order: 3, visible: true },
  { id: 4, label: 'О граните', href: '#granite', order: 4, visible: true },
  { id: 5, label: 'Контакты', href: '#contacts', order: 5, visible: true },
];

export const defaultSiteSettings: SiteSettings = {
  companyName: 'ГранитМастер',
  phone: '+7 (495) 123-45-67',
  phone2: '+7 (800) 555-01-01',
  email: 'info@granitmaster.ru',
  address: 'г. Москва, ул. Гранитная, д. 12, стр. 1',
  workHours: 'Пн–Сб: 9:00–19:00, Вс: 10:00–17:00',
  mapUrl: 'https://yandex.ru/map-widget/v1/?ll=37.620393%2C55.753960&z=12',
  heroTitle: 'Памятники из гранита',
  heroSubtitle: 'Собственное производство · Установка · Доставка по России',
  metaDescription: 'Изготовление памятников из гранита в Москве. Широкий каталог, доступные цены, профессиональная установка.',
};
