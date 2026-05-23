-- Link demo gift sets to included perfumes (required for storefront bundle UI + checkout)

UPDATE products
SET product_type = 'gift_set'
WHERE category = 'gift-sets'
  AND product_type IS DISTINCT FROM 'gift_set';

-- The Signature Trio → Sweet Noble, 24th Oud, Re'Venge
INSERT INTO gift_set_items (gift_set_id, product_id, quantity, sort_order)
SELECT gs.id, p.id, 1, ord.sort_order
FROM products gs
JOIN (
  VALUES
    ('sweet-noble', 0),
    ('24th-oud', 1),
    ('revenge', 2)
) AS ord(slug, sort_order) ON true
JOIN products p ON p.slug = ord.slug
WHERE gs.slug = 'the-signature-trio'
ON CONFLICT (gift_set_id, product_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

-- Evening Collection → four evening-leaning singles from the catalog
INSERT INTO gift_set_items (gift_set_id, product_id, quantity, sort_order)
SELECT gs.id, p.id, 1, ord.sort_order
FROM products gs
JOIN (
  VALUES
    ('24th-oud', 0),
    ('revenge', 1),
    ('tom-ford-oud-wood', 2),
    ('dior-sauvage', 3)
) AS ord(slug, sort_order) ON true
JOIN products p ON p.slug = ord.slug
WHERE gs.slug = 'evening-collection'
ON CONFLICT (gift_set_id, product_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
