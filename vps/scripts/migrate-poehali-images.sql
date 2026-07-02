-- Replace poehali CDN URLs with local /images/ paths (run once on production DB)

UPDATE monuments SET image = REPLACE(REPLACE(REPLACE(image,
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', '/images/monument-1.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', '/images/monument-2.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', '/images/monument-3.jpg')
WHERE image LIKE '%cdn.poehali.dev%';

UPDATE monuments SET images = REPLACE(REPLACE(REPLACE(images::text,
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', '/images/monument-1.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', '/images/monument-2.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', '/images/monument-3.jpg')::jsonb
WHERE images::text LIKE '%cdn.poehali.dev%';

UPDATE portfolio SET image = REPLACE(REPLACE(REPLACE(image,
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', '/images/monument-1.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', '/images/monument-2.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', '/images/monument-3.jpg')
WHERE image LIKE '%cdn.poehali.dev%';

UPDATE granite_types SET image = REPLACE(REPLACE(REPLACE(image,
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', '/images/monument-1.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', '/images/monument-2.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', '/images/monument-3.jpg')
WHERE image LIKE '%cdn.poehali.dev%';

UPDATE site_settings SET value = REPLACE(REPLACE(REPLACE(value,
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg', '/images/monument-1.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/5145858e-0a87-4025-87c5-050692b76940.jpg', '/images/monument-2.jpg'),
  'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/1074cc91-a715-454c-8c17-7d03038739d8.jpg', '/images/monument-3.jpg')
WHERE value LIKE '%cdn.poehali.dev%';

-- heroImage pointing to poehali → local hero
UPDATE site_settings SET value = '/images/hero.jpg'
WHERE key = 'heroImage' AND value LIKE '%cdn.poehali.dev%';
