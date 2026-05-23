-- T40 subcategories are managed in product_subcategories (slug unique per parent).
-- Copy any legacy rows from the shop nav `categories` tree that are not already present.

INSERT INTO product_subcategories (parent_category, name, slug, sort_order, is_active)
SELECT
  't40-exclusives',
  c.name,
  c.slug,
  COALESCE(c.sort_order, 0),
  COALESCE(c.is_active, true)
FROM categories c
JOIN categories p ON c.parent_id = p.id AND p.slug = 't40-exclusives'
WHERE NOT EXISTS (
  SELECT 1
  FROM product_subcategories ps
  WHERE ps.parent_category = 't40-exclusives'
    AND ps.slug = c.slug
);
