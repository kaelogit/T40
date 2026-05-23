-- Point About page hero at local product lineup image

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{hero,imageUrl}',
  '"/about/hero.jpg"'::jsonb
)
WHERE page_key = 'about'
  AND (
    content->'hero'->>'imageUrl' IS NULL
    OR content->'hero'->>'imageUrl' LIKE '%unsplash%'
  );
