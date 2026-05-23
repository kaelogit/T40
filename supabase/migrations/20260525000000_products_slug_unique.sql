-- Required for seed upserts on slug
DROP INDEX IF EXISTS products_slug_unique_idx;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_unique;
ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);

ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at timestamp with time zone;
