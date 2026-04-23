CREATE TABLE IF NOT EXISTS cemeteries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO cemeteries (name, city, sort_order) VALUES
('Востряковское', 'Москва', 1),
('Хованское', 'Москва', 2),
('Митинское', 'Москва', 3),
('Троекуровское', 'Москва', 4),
('Химкинское', 'Москва', 5),
('Домодедовское', 'Москва', 6)
ON CONFLICT DO NOTHING;