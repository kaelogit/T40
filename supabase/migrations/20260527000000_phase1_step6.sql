-- Order confirmation emails + coupons
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;

CREATE TABLE IF NOT EXISTS coupons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order numeric NOT NULL DEFAULT 0,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons (code);
CREATE INDEX IF NOT EXISTS coupons_active_idx ON coupons (active);

-- Sample coupon: 10% off orders ₦50,000+ (max 100 uses)
INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_uses)
VALUES (
  'WELCOME10',
  '10% off your first order',
  'percent',
  10,
  50000,
  100
)
ON CONFLICT (code) DO NOTHING;
