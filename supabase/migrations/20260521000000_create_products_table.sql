-- supabase/migrations/20260521000000_create_products_table.sql

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  subcategory text,
  price numeric NOT NULL,
  sale_price numeric,
  on_sale boolean DEFAULT false,
  images text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);