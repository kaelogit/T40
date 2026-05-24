ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS compare_at_price numeric CHECK (compare_at_price IS NULL OR compare_at_price > 0);

COMMENT ON COLUMN order_items.compare_at_price IS
  'Original unit price before flash sale — snapshot at order time for receipts and emails.';
