-- Remove origin/location copy from CMS defaults already in the database

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{hero,subtitle}',
  '"T40 Perfumes crafts fragrances that honor tradition, embrace innovation, and refuse to fade before you do."'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{origin,title}',
  '"A House\nWith Global Reach"'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{origin,paragraphs,2}',
  '"Today, T40 serves clients worldwide — collectors, first-time buyers, and everyone who understands that how you smell is how you are remembered."'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{awards,description}',
  '"Re''Venge, Sweet Noble, and 24th Oud were recognized by the Mayor of Baltimore for their distinction as best-selling UK fragrances in the United States — a milestone on the world stage."'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{milestones,items,0,label}',
  '"T40 founded with a single vision: world-class scent, no compromises."'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{sidebar,studio,lines}',
  '["Visits by appointment"]'::jsonb
)
WHERE page_key = 'contact';
