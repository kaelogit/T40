-- 1. Create the Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the Main Parent Categories (Using set UUIDs to attach children easily)
INSERT INTO categories (id, name, slug, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'T40 Exclusives', 't40-exclusives', 1),
('22222222-2222-2222-2222-222222222222', 'Shop All', 'shop-all', 2),
('33333333-3333-3333-3333-333333333333', 'Women', 'women', 3),
('44444444-4444-4444-4444-444444444444', 'Men', 'men', 4),
('55555555-5555-5555-5555-555555555555', 'Unisex', 'unisex', 5),
('66666666-6666-6666-6666-666666666666', 'Brands', 'brands', 6),
('77777777-7777-7777-7777-777777777777', 'Shop by Scent', 'scent', 7);

-- 3. Insert T40 Exclusives Subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
('Travel Companions', 'travel-companions', '11111111-1111-1111-1111-111111111111'),
('Feminine Fragrance', 'feminine-fragrance', '11111111-1111-1111-1111-111111111111'),
('Hair Perfume', 'hair-perfume', '11111111-1111-1111-1111-111111111111'),
('Oud Perfume', 'oud-perfume', '11111111-1111-1111-1111-111111111111');

-- 4. Insert Shop All Subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
('Trending', 'trending', '22222222-2222-2222-2222-222222222222'),
('New Arrivals', 'new-arrivals', '22222222-2222-2222-2222-222222222222'),
('Best Sellers', 'best-sellers', '22222222-2222-2222-2222-222222222222'),
('Discovery Sets', 'discovery-sets', '22222222-2222-2222-2222-222222222222'),
('Gift Sets', 'gift-sets', '22222222-2222-2222-2222-222222222222');

-- 5. Insert Brands Subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
('T40 Perfumes', 'brand-t40', '66666666-6666-6666-6666-666666666666'),
('Dior', 'dior', '66666666-6666-6666-6666-666666666666'),
('Tom Ford', 'tom-ford', '66666666-6666-6666-6666-666666666666'),
('Lattafa', 'lattafa', '66666666-6666-6666-6666-666666666666'),
('Chanel', 'chanel', '66666666-6666-6666-6666-666666666666'),
('Creed', 'creed', '66666666-6666-6666-6666-666666666666'),
('Amouage', 'amouage', '66666666-6666-6666-6666-666666666666'),
('Maison Francis Kurkdjian', 'mfk', '66666666-6666-6666-6666-666666666666'),
('Parfums de Marly', 'pdm', '66666666-6666-6666-6666-666666666666'),
('Yves Saint Laurent', 'ysl', '66666666-6666-6666-6666-666666666666');

-- 6. Insert Shop by Scent Subcategories
INSERT INTO categories (name, slug, parent_id) VALUES
('Floral', 'floral', '77777777-7777-7777-7777-777777777777'),
('Woody & Earthy', 'woody-earthy', '77777777-7777-7777-7777-777777777777'),
('Fresh & Citrus', 'fresh-citrus', '77777777-7777-7777-7777-777777777777'),
('Amber & Spice', 'amber-spice', '77777777-7777-7777-7777-777777777777'),
('Gourmand (Sweet)', 'gourmand', '77777777-7777-7777-7777-777777777777'),
('Oud & Leather', 'oud-leather', '77777777-7777-7777-7777-777777777777'),
('Aquatic', 'aquatic', '77777777-7777-7777-7777-777777777777'),
('Musk', 'musk', '77777777-7777-7777-7777-777777777777'),
('Aromatic', 'aromatic', '77777777-7777-7777-7777-777777777777');