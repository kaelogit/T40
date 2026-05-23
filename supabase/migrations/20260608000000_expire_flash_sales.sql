-- Auto-clear flash sales when sale_ends_at has passed

CREATE OR REPLACE FUNCTION expire_flash_sales()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE product_variants pv
  SET sale_price = NULL
  FROM products p
  WHERE pv.product_id = p.id
    AND p.on_sale = true
    AND p.sale_ends_at IS NOT NULL
    AND p.sale_ends_at <= timezone('utc', now());

  UPDATE products
  SET
    on_sale = false,
    sale_price = NULL,
    badge = CASE WHEN badge = 'FLASH SALE' THEN NULL ELSE badge END
  WHERE on_sale = true
    AND sale_ends_at IS NOT NULL
    AND sale_ends_at <= timezone('utc', now());

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

GRANT EXECUTE ON FUNCTION expire_flash_sales() TO service_role;
