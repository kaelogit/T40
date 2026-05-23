-- Ensure gift set products have product_type = gift_set (older rows may still be 'single')
UPDATE products
SET product_type = 'gift_set'
WHERE category = 'gift-sets'
  AND product_type IS DISTINCT FROM 'gift_set';
