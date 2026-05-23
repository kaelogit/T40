-- Demo product with 30 / 50 / 100 ml variants
-- Run in Supabase SQL Editor AFTER:
--   20260601000000_subcategories_and_stock.sql
--   20260602000000_product_variants.sql
--
-- Storefront: /product/size-demo-oud
-- Card quick-add: 100ML @ ₦185,000 (highest ml)
-- PDP: size picker with exact prices per size

INSERT INTO products (
  name,
  slug,
  brand,
  category,
  price,
  in_stock,
  stock_quantity,
  low_stock_threshold,
  badge,
  description,
  images,
  notes,
  occasion,
  top_notes,
  heart_notes,
  base_notes,
  product_type
) VALUES (
  'Size Demo Oud',
  'size-demo-oud',
  'T40 Perfumes',
  'men',
  185000,
  true,
  25,
  5,
  'NEW',
  'Demo product to test 30 / 50 / 100 ml pricing. Card adds 100 ml; PDP lets you pick any size.',
  ARRAY['https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=1200&auto=format&fit=crop'],
  'oud leather',
  'evening',
  ARRAY['Saffron', 'Cardamom'],
  ARRAY['Oud', 'Leather'],
  ARRAY['Amber', 'Patchouli'],
  'single'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock,
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  notes = EXCLUDED.notes,
  occasion = EXCLUDED.occasion,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes,
  product_type = EXCLUDED.product_type;

-- Replace any existing variants (including migration backfill single row)
DELETE FROM product_variants
WHERE product_id = (SELECT id FROM products WHERE slug = 'size-demo-oud');

INSERT INTO product_variants (product_id, label, price, sale_price, sort_order, is_default, is_active)
SELECT
  p.id,
  v.label,
  v.price,
  NULL,
  v.sort_order,
  v.is_default,
  true
FROM products p
CROSS JOIN (VALUES
  ('30 ml',  85000::numeric,  0, false),
  ('50 ml', 135000::numeric,  1, false),
  ('100 ml', 185000::numeric, 2, true)
) AS v(label, price, sort_order, is_default)
WHERE p.slug = 'size-demo-oud';

-- Verify
SELECT
  p.name,
  p.slug,
  p.price AS product_list_price,
  p.stock_quantity,
  pv.label,
  pv.price AS variant_price,
  pv.is_default
FROM products p
JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
WHERE p.slug = 'size-demo-oud'
ORDER BY pv.sort_order;
