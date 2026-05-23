-- Temporary checkout data until Paystack/Stripe confirms payment.
-- Orders are created only when an intent is fulfilled (status -> paid).

CREATE TABLE IF NOT EXISTS checkout_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer jsonb NOT NULL,
  address jsonb NOT NULL,
  priced_items jsonb NOT NULL,
  subtotal numeric NOT NULL CHECK (subtotal >= 0),
  total numeric NOT NULL CHECK (total >= 0),
  discount_amount numeric NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  coupon_code text,
  payment_provider text CHECK (payment_provider IS NULL OR payment_provider IN ('paystack', 'stripe')),
  payment_reference text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS checkout_intents_status_idx ON checkout_intents (status, expires_at);
CREATE INDEX IF NOT EXISTS checkout_intents_payment_ref_idx ON checkout_intents (payment_reference);

-- Ensure sample coupon exists (dashboard + admin coupons list)
INSERT INTO coupons (code, description, discount_type, discount_value, min_order, max_uses, active)
VALUES (
  'WELCOME10',
  '5% off your first order',
  'percent',
  5,
  50000,
  50,
  true
)
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  min_order = EXCLUDED.min_order,
  max_uses = EXCLUDED.max_uses,
  active = true;
