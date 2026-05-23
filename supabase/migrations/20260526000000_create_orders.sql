CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  payment_provider text,
  payment_reference text,
  email text NOT NULL,
  phone text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL DEFAULT 'Nigeria',
  subtotal numeric NOT NULL,
  total numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  product_image text,
  size text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  line_total numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_payment_reference_idx ON orders (payment_reference);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
