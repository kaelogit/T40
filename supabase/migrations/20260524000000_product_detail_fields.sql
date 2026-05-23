ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS top_notes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS heart_notes text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_notes text[] DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON products (slug) WHERE slug IS NOT NULL;
