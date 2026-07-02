-- Point image paths from .jpg to .webp (run after poehali migration)

UPDATE monuments SET image = REPLACE(image, '.jpg', '.webp') WHERE image LIKE '/images/%.jpg';
UPDATE monuments SET images = REPLACE(images::text, '.jpg', '.webp')::jsonb WHERE images::text LIKE '%.jpg%';
UPDATE portfolio SET image = REPLACE(image, '.jpg', '.webp') WHERE image LIKE '/images/%.jpg';
UPDATE granite_types SET image = REPLACE(image, '.jpg', '.webp') WHERE image LIKE '/images/%.jpg';
UPDATE site_settings SET value = REPLACE(value, '.jpg', '.webp') WHERE value LIKE '/images/%.jpg';

UPDATE site_settings SET value = '/images/hero.webp'
WHERE key = 'heroImage' AND (value LIKE '%poehali%' OR value = '/images/hero.jpg' OR value = '');
