-- Drop / pre-order / early access removed from the app; clear stale flags.
UPDATE products
SET
  is_drop = false,
  release_date = NULL,
  early_access_price = NULL
WHERE is_drop = true
   OR release_date IS NOT NULL
   OR early_access_price IS NOT NULL;
