-- Per-product size/price variants (source of truth for pricing — no multipliers)

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  price numeric NOT NULL CHECK (price > 0),
  sale_price numeric CHECK (sale_price IS NULL OR sale_price >= 0),
  stock_quantity integer CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5,
  sort_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (product_id, label)
);

CREATE INDEX IF NOT EXISTS product_variants_product_idx
  ON product_variants (product_id, sort_order);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_variants_public_read"
  ON product_variants FOR SELECT USING (is_active = true);

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL;

-- Backfill: one default variant per product from current price
INSERT INTO product_variants (product_id, label, price, sale_price, is_default, sort_order)
SELECT
  p.id,
  '',
  p.price,
  CASE WHEN p.on_sale = true AND p.sale_price IS NOT NULL THEN p.sale_price ELSE NULL END,
  true,
  0
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
);

COMMENT ON TABLE product_variants IS
  'Size/price SKUs. label empty = single fixed price. Flash sale uses sale_price per variant when products.on_sale is true.';
COMMENT ON COLUMN order_items.variant_id IS
  'FK to purchased variant; size/unit_price/product_name are snapshots at order time.';
