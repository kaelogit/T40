-- Admin-managed brands (inventory); product.brand still drives shop filters when new brands appear
CREATE TABLE IF NOT EXISTS brands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS brands_is_active_idx ON brands (is_active);
