CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.monuments (
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

CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.services (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'Star',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.portfolio (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    material TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    year INTEGER NOT NULL DEFAULT 2024,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.granite_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    origin TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT '',
    hardness TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.menu_items (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL DEFAULT '#',
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS t_p34993028_granite_memorial_sho.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);
