-- Product subcategories (admin-managed, tied to a fixed primary category slug)
-- NOTE: The existing `categories` table is for SHOP NAV / filters only — not product assignment.

CREATE TABLE IF NOT EXISTS product_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_category text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (parent_category, slug)
);

CREATE INDEX IF NOT EXISTS product_subcategories_parent_idx
  ON product_subcategories (parent_category, sort_order);

ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_subcategories_public_read" ON product_subcategories;
CREATE POLICY "product_subcategories_public_read"
  ON product_subcategories FOR SELECT USING (is_active = true);

-- Seed T40 Exclusives subcategories (matches original hardcoded list)
INSERT INTO product_subcategories (parent_category, name, slug, sort_order)
SELECT v.parent, v.name, v.slug, v.ord
FROM (VALUES
  ('t40-exclusives', 'Travel Companions', 'travel-companions', 0),
  ('t40-exclusives', 'Feminine Fragrance', 'feminine-fragrance', 1),
  ('t40-exclusives', 'Hair Perfume', 'hair-perfume', 2),
  ('t40-exclusives', 'Oud Perfume', 'oud-perfume', 3)
) AS v(parent, name, slug, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM product_subcategories WHERE parent_category = 't40-exclusives' LIMIT 1
);

-- Optional inventory tracking (null = manual in_stock toggle only)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

COMMENT ON TABLE categories IS
  'Shop navigation tree (collections, scent filters, brand nav). Products do NOT FK here.';
COMMENT ON TABLE product_subcategories IS
  'Admin-managed subcategories for products.category slugs (e.g. t40-exclusives/oud-perfume).';
COMMENT ON COLUMN products.stock_quantity IS
  'When set, inventory is tracked and decremented on paid orders. NULL = use in_stock only.';
