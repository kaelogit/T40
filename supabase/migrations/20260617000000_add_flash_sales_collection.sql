-- Flash Sales collection under Shop All (nav + filter reference)
INSERT INTO categories (name, slug, parent_id, sort_order)
SELECT 'Flash Sales', 'flash-sales', p.id, 3
FROM categories p
WHERE p.slug = 'shop-all'
  AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'flash-sales');
