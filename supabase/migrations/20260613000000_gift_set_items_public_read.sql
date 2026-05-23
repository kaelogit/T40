-- Storefront reads gift_set_items with the anon key; without a policy rows are invisible.

ALTER TABLE gift_set_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gift_set_items_public_read ON gift_set_items;
CREATE POLICY gift_set_items_public_read
  ON gift_set_items
  FOR SELECT
  USING (true);
