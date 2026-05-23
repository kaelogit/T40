-- Update awards & recognition copy (owner-provided international honours)

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{awards}',
  '{
    "eyebrow": "International recognition",
    "title": "17 awards.\nUK, USA & beyond.",
    "description": "T40 fragrances and our founder have been recognized across the UK, USA, and Nigeria — in industry, media, and community awards.",
    "highlights": [
      "Award-winning perfumes — UK & USA",
      "Featured in Ebony Magazine",
      "NIBAD 2025 — Best Product, USA",
      "Noble UK — Industrialist of the Year 2024",
      "Nigerian British Award Winner 2025"
    ],
    "productSlugs": ["revenge", "sweet-noble", "24th-oud"]
  }'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{milestones,items}',
  '[
    {"year": "2019", "label": "T40 founded with a single vision: world-class scent, no compromises."},
    {"year": "2021", "label": "Sweet Noble launches — quickly becoming a signature of the house."},
    {"year": "2023", "label": "24th Oud and Re''Venge join the exclusives line, pushing oud and amber into new territory."},
    {"year": "2024", "label": "Noble UK — Industrialist of the Year."},
    {"year": "2025", "label": "Nigerian British Award Winner; NIBAD 2025 Best Product USA; Ebony Magazine feature — 17 international awards in total."}
  ]'::jsonb
)
WHERE page_key = 'about';

UPDATE site_pages
SET content = jsonb_set(
  content,
  '{cta}',
  '{
    "title": "Experience T40 Exclusives",
    "description": "Explore the award-winning collection and find the scent that becomes yours.",
    "primaryLabel": "Shop Exclusives",
    "primaryHref": "/shop/t40-exclusives",
    "secondaryLabel": "Read our awards story",
    "secondaryHref": "/blog/t40-international-awards"
  }'::jsonb
)
WHERE page_key = 'about';

UPDATE announcement_settings
SET
  badge_label = '17 international awards',
  message_short = 'UK & USA recognition — Ebony, NIBAD 2025, Noble UK & more',
  message_full = 'T40 recognized in the UK and USA — Ebony Magazine, NIBAD 2025 Best Product USA, Noble UK Industrialist of the Year 2024, and Nigerian British Award Winner 2025.',
  updated_at = timezone('utc'::text, now())
WHERE singleton = true;

-- Replace Baltimore blog post with international awards story (keep old slug as redirect target if bookmarked)
UPDATE blog_posts
SET
  slug = 't40-international-awards',
  title = '17 Awards: T40 Recognition Across the UK, USA & Nigeria',
  excerpt = 'From Ebony Magazine to NIBAD 2025 Best Product USA — how T40 fragrances and leadership earned international recognition.',
  body = 'Recognition travels. For T40, it has arrived from the **United Kingdom**, the **United States**, and **Nigeria** — **17 international awards** in total.

### Fragrances that crossed borders

**Re''Venge**, **Sweet Noble**, and **24th Oud** are award-winning perfumes in the UK and USA — scents that earned their place through wearers who kept coming back, not through hype.

### Leadership & industry honours

- **Noble UK** — Industrialist of the Year 2024
- **Nigerian British Award** Winner 2025
- **NIBAD 2025** — Best Product, USA

### In the press

T40 has been featured in **Ebony Magazine** — a milestone that reflects both the quality of what we make and the story behind the house.

### What it means for you

Awards do not change how we formulate, bottle, or stand behind every scent. They confirm what our customers already know: T40 is built for people who take fragrance seriously.

Explore the exclusives that helped put us on the map.',
  updated_at = timezone('utc'::text, now())
WHERE slug = 'baltimore-award-t40-milestone';

-- Insert new post if Baltimore slug was never seeded
INSERT INTO blog_posts (slug, title, excerpt, cover_image, author, published_at, read_minutes, category, body, published)
SELECT
  't40-international-awards',
  '17 Awards: T40 Recognition Across the UK, USA & Nigeria',
  'From Ebony Magazine to NIBAD 2025 Best Product USA — how T40 fragrances and leadership earned international recognition.',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b8?q=80&w=1200&auto=format&fit=crop',
  'T40 Editorial',
  '2025-11-14',
  6,
  'The House',
  'Recognition travels. For T40, it has arrived from the **United Kingdom**, the **United States**, and **Nigeria** — **17 international awards** in total.',
  true
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 't40-international-awards');
