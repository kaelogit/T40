-- Gift set combos: one product row + linked included perfumes
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'single'
  CHECK (product_type IN ('single', 'gift_set'));

CREATE TABLE IF NOT EXISTS gift_set_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_set_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (gift_set_id, product_id)
);

CREATE INDEX IF NOT EXISTS gift_set_items_gift_set_id_idx ON gift_set_items (gift_set_id);

-- Optional: what's inside a gift set on order lines (for emails/receipts)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS bundle_details jsonb;
