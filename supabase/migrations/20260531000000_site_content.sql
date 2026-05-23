-- Site content CMS: announcement, blog, FAQ, about page

CREATE TABLE IF NOT EXISTS announcement_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton = true),
  active boolean NOT NULL DEFAULT true,
  badge_label text NOT NULL DEFAULT 'Award winners',
  message_short text NOT NULL,
  message_full text NOT NULL,
  read_link_label text NOT NULL DEFAULT 'Our story',
  read_link_href text NOT NULL DEFAULT '/about#awards',
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS announcement_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  cover_image text NOT NULL,
  author text NOT NULL DEFAULT 'T40 Editorial',
  published_at date NOT NULL,
  read_minutes integer NOT NULL DEFAULT 5,
  category text NOT NULL DEFAULT 'The House',
  body text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (published, published_at DESC);

CREATE TABLE IF NOT EXISTS faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS faq_items_category_idx ON faq_items (category_id, sort_order);

CREATE TABLE IF NOT EXISTS site_pages (
  page_key text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Public read for storefront (anon + authenticated)
ALTER TABLE announcement_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "announcement_settings_public_read" ON announcement_settings FOR SELECT USING (true);
CREATE POLICY "announcement_links_public_read" ON announcement_links FOR SELECT USING (true);
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "faq_categories_public_read" ON faq_categories FOR SELECT USING (true);
CREATE POLICY "faq_items_public_read" ON faq_items FOR SELECT USING (true);
CREATE POLICY "site_pages_public_read" ON site_pages FOR SELECT USING (true);

-- Seed announcement (only if empty)
INSERT INTO announcement_settings (singleton, active, badge_label, message_short, message_full, read_link_label, read_link_href)
SELECT true, true, 'Award winners',
  'Re''Venge, Sweet Noble & 24th Oud — Baltimore honored',
  'Re''Venge, Sweet Noble & 24th Oud — honored by the Mayor of Baltimore for best-selling UK fragrances in the USA.',
  'Our story', '/about#awards'
WHERE NOT EXISTS (SELECT 1 FROM announcement_settings);

INSERT INTO announcement_links (label, href, sort_order)
SELECT v.label, v.href, v.sort_order
FROM (VALUES
  ('Re''Venge', '/product/revenge', 0),
  ('Sweet Noble', '/product/sweet-noble', 1),
  ('24th Oud', '/product/24th-oud', 2)
) AS v(label, href, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM announcement_links LIMIT 1);

-- Seed about page JSON
INSERT INTO site_pages (page_key, content)
SELECT 'about', '{
  "hero": {
    "eyebrow": "The House of T40",
    "title": "Scent Without\nCompromise",
    "subtitle": "Born in United Kingdom, worn worldwide. T40 Perfumes crafts fragrances that honor tradition, embrace innovation, and refuse to fade before you do.",
    "imageUrl": "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop"
  },
  "origin": {
    "eyebrow": "Our Origin",
    "title": "A Nigerian House\nWith Global Reach",
    "paragraphs": [
      "T40 was never meant to be another fragrance retailer. We set out to build a house — one that formulates, bottles, and stands behind every scent we release under our name.",
      "From the first drop of Sweet Noble to the dark elegance of 24th Oud, each creation reflects months of refinement. We source raw materials with the same rigor we apply to blending, because the difference between good and unforgettable lives in the details.",
      "Today, T40 serves clients across Nigeria and beyond — collectors, first-time buyers, and everyone who understands that how you smell is how you are remembered."
    ]
  },
  "awards": {
    "eyebrow": "Baltimore Recognition",
    "title": "Three Fragrances.\nOne Historic Honor.",
    "description": "Re''Venge, Sweet Noble, and 24th Oud were recognized by the Mayor of Baltimore for their distinction as best-selling UK fragrances in the United States — a milestone for Nigerian perfumery on the world stage.",
    "productSlugs": ["revenge", "sweet-noble", "24th-oud"]
  },
  "values": {
    "eyebrow": "The T40 Standard",
    "title": "What We Stand For",
    "items": [
      {"title": "Concentration", "body": "We formulate for longevity. Every T40 Exclusive is built to perform from first spray to final hour."},
      {"title": "Integrity", "body": "Transparent sourcing, honest pricing, and authentic product — no shortcuts, no compromises."},
      {"title": "Identity", "body": "Fragrance should feel like an extension of who you are — not a costume, not a trend."}
    ]
  },
  "milestones": {
    "eyebrow": "Milestones",
    "title": "Our Journey",
    "items": [
      {"year": "2019", "label": "T40 founded in Lagos with a single vision: world-class scent, Nigerian roots."},
      {"year": "2021", "label": "Sweet Noble launches — quickly becoming a signature of the house."},
      {"year": "2023", "label": "24th Oud and Re''Venge join the exclusives line, pushing oud and amber into new territory."},
      {"year": "2025", "label": "Mayor of Baltimore honors three T40 fragrances for best-selling UK perfumes in the USA."}
    ]
  },
  "cta": {
    "title": "Experience T40 Exclusives",
    "description": "Explore the award-winning collection and find the scent that becomes yours.",
    "primaryLabel": "Shop Exclusives",
    "primaryHref": "/shop/t40-exclusives",
    "secondaryLabel": "Read the Baltimore story",
    "secondaryHref": "/blog/baltimore-award-t40-milestone"
  }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_pages WHERE page_key = 'about');
