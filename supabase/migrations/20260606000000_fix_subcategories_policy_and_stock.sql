-- Safe to re-run if 20260601000000 partially applied (policy already exists, stock columns missing)

DROP POLICY IF EXISTS "product_subcategories_public_read" ON product_subcategories;

DO $$ BEGIN
  CREATE POLICY "product_subcategories_public_read"
    ON product_subcategories FOR SELECT USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;
