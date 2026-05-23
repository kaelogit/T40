-- Cap percent coupons with a maximum discount amount (e.g. 10% off, max ₦5,000)
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS max_discount numeric CHECK (max_discount IS NULL OR max_discount > 0);
