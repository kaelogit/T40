-- Product columns referenced by storefront UI (previously types-only)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_drop boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS release_date timestamptz,
  ADD COLUMN IF NOT EXISTS early_access_price numeric;

-- Admin allowlist — link Supabase Auth users after creating them in the dashboard
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email);

-- Seed admin allowlist (users must already exist in Supabase Auth)
INSERT INTO admin_users (id, email)
SELECT id, email
FROM auth.users
WHERE id IN (
  'd37354b4-0f5d-4c33-b773-64939902535b'::uuid,
  'c1612034-f0b6-403e-84fc-e73c8ca04eb5'::uuid
)
ON CONFLICT (id) DO NOTHING;
