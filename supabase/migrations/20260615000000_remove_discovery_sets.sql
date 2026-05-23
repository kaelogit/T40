-- Remove discovery-sets as a product category (nav + admin dropped)

UPDATE products
SET category = 'unisex'
WHERE category = 'discovery-sets';

DELETE FROM categories
WHERE slug = 'discovery-sets';
