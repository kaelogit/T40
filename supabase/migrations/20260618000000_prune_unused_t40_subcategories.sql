-- Remove T40 subcategories that no product uses (e.g. seeded travel-companions, hair-perfume).
DELETE FROM product_subcategories ps
WHERE ps.parent_category = 't40-exclusives'
  AND NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.subcategory = ps.slug
  );

DELETE FROM categories c
USING categories parent
WHERE parent.slug = 't40-exclusives'
  AND c.parent_id = parent.id
  AND NOT EXISTS (
    SELECT 1
    FROM products p
    WHERE p.subcategory = c.slug
  );
