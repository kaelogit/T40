-- Extend products for shop filters (safe to re-run)
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_subcategory_idx ON products (subcategory);
CREATE INDEX IF NOT EXISTS products_badge_idx ON products (badge);
CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand);
CREATE INDEX IF NOT EXISTS products_on_sale_idx ON products (on_sale);
