CREATE TABLE IF NOT EXISTS page_menu_assignments (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(page_id, location)
);

CREATE INDEX IF NOT EXISTS idx_page_menu_assignments_location ON page_menu_assignments(location);