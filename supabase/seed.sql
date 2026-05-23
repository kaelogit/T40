-- T40 Perfumes — demo catalog (run after all migrations)
-- Supabase SQL editor: paste & run
-- CLI: supabase db execute -f supabase/seed.sql

-- ─── Brands (admin inventory) ─────────────────────────
INSERT INTO brands (name, slug, sort_order) VALUES
  ('T40 Perfumes', 't40-perfumes', 1),
  ('Dior', 'dior', 2),
  ('Tom Ford', 'tom-ford', 3),
  ('Lattafa', 'lattafa', 4),
  ('Chanel', 'chanel', 5),
  ('Yves Saint Laurent', 'ysl', 6)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- ─── Products ─────────────────────────────────────────
INSERT INTO products (
  name, slug, brand, category, subcategory, price, sale_price, on_sale, sale_ends_at,
  badge, in_stock, description, images, notes, occasion,
  top_notes, heart_notes, base_notes
) VALUES
  (
    'Sweet Noble', 'sweet-noble', 'T40 Perfumes', 'unisex', NULL,
    185000, NULL, false, NULL, 'BEST SELLER', true,
    'An intoxicating blend recognized across the UK as a captivating masterpiece of modern perfumery.',
    ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop'],
    'floral amber', 'evening',
    ARRAY['Bergamot', 'Pink pepper'], ARRAY['Rose', 'Jasmine'], ARRAY['Musk', 'Sandalwood', 'Amber']
  ),
  (
    '24th Oud', '24th-oud', 'T40 Perfumes', 'men', 'oud-perfume',
    210000, NULL, false, NULL, 'TRENDING', true,
    'A daring collision of dark leather, rare oud, and spice — honored for its unparalleled depth.',
    ARRAY['https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=1200&auto=format&fit=crop'],
    'oud leather', 'evening',
    ARRAY['Saffron', 'Cardamom'], ARRAY['Oud', 'Leather'], ARRAY['Amber', 'Patchouli']
  ),
  (
    'Re''venge', 'revenge', 'T40 Perfumes', 'unisex', NULL,
    175000, NULL, false, NULL, 'TRENDING', true,
    'A statement-making scent with an unforgettable trail for connoisseurs worldwide.',
    ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=1200&auto=format&fit=crop'],
    'amber spice', 'date',
    ARRAY['Ginger', 'Grapefruit'], ARRAY['Tuberose', 'Leather'], ARRAY['Vanilla', 'Tonka']
  ),
  (
    'Oud Wood Eau de Parfum', 'tom-ford-oud-wood', 'Tom Ford', 'unisex', NULL,
    220000, 180000, true, timezone('utc', now()) + interval '1 day', 'FLASH SALE', true,
    'Rare oud, exotic rosewood, and cardamom in a smoky, smooth composition.',
    ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop'],
    'woody earthy', 'evening',
    ARRAY['Cardamom', 'Oud'], ARRAY['Rosewood', 'Sandalwood'], ARRAY['Vanilla', 'Amber']
  ),
  (
    'Sauvage Elixir', 'dior-sauvage-elixir', 'Dior', 'men', NULL,
    150000, 135000, true, timezone('utc', now()) + interval '2 days', 'FLASH SALE', true,
    'Highly concentrated elixir with spicy, woody, and liquorice facets.',
    ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop'],
    'fresh citrus', 'office',
    ARRAY['Cinnamon', 'Nutmeg'], ARRAY['Lavender', 'Licorice'], ARRAY['Patchouli', 'Woody notes']
  ),
  (
    'Libre Eau de Parfum', 'ysl-libre', 'Yves Saint Laurent', 'women', NULL,
    125000, 95000, true, timezone('utc', now()) + interval '12 hours', 'FLASH SALE', true,
    'Bold lavender and orange blossom twisted with sensual amber musk.',
    ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'],
    'floral', 'everyday',
    ARRAY['Lavender', 'Mandarin'], ARRAY['Orange blossom', 'Jasmine'], ARRAY['Amber', 'Musk']
  ),
  (
    'Khamrah', 'lattafa-khamrah', 'Lattafa', 'unisex', NULL,
    45000, 38000, true, timezone('utc', now()) + interval '7 days', 'FLASH SALE', true,
    'Gourmand warmth with cinnamon, praline, and vanilla — viral Middle Eastern icon.',
    ARRAY['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800&auto=format&fit=crop'],
    'gourmand', 'date',
    ARRAY['Cinnamon', 'Nutmeg'], ARRAY['Praline', 'Tuberose'], ARRAY['Vanilla', 'Amberwood']
  ),
  (
    'No. 5 Eau de Parfum', 'chanel-no-5', 'Chanel', 'women', NULL,
    195000, NULL, false, NULL, 'BEST SELLER', true,
    'The legendary aldehydic floral — timeless, powdery, unmistakably Chanel.',
    ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'],
    'floral', 'office',
    ARRAY['Aldehydes', 'Ylang-ylang'], ARRAY['Rose', 'Jasmine'], ARRAY['Sandalwood', 'Vanilla']
  ),
  (
    'Bleu de Chanel', 'bleu-de-chanel', 'Chanel', 'men', NULL,
    168000, NULL, false, NULL, 'TRENDING', true,
    'Woody aromatic freshness with citrus and incense depth.',
    ARRAY['https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop'],
    'fresh citrus', 'office',
    ARRAY['Citrus', 'Mint'], ARRAY['Ginger', 'Jasmine'], ARRAY['Incense', 'Cedar']
  ),
  (
    'Travel Companion Set', 'travel-companion-set', 'T40 Perfumes', 'unisex', 'travel-companions',
    95000, NULL, false, NULL, 'NEW', true,
    'Three 30ml icons for the journey — Sweet Noble, 24th Oud, and Re''venge.',
    ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'],
    'woody earthy', 'everyday',
    ARRAY['Citrus'], ARRAY['Floral'], ARRAY['Wood', 'Musk']
  ),
  (
    'Feminine Discovery', 'feminine-discovery', 'T40 Perfumes', 'women', 'feminine-fragrance',
    120000, NULL, false, NULL, 'NEW', true,
    'A curated trio celebrating soft florals and modern femininity.',
    ARRAY['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop'],
    'floral', 'everyday',
    ARRAY['Pear', 'Freesia'], ARRAY['Rose', 'Peony'], ARRAY['Musk', 'Cedar']
  ),
  (
    'The Signature Trio', 'the-signature-trio', 'T40 Perfumes', 'gift-sets', 'gift-sets',
    250000, NULL, false, NULL, 'NEW', true,
    'Gift set: Sweet Noble, 24th Oud, and Re''venge in 50ml — luxury boxed.',
    ARRAY['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'],
    'amber spice', 'date',
    ARRAY['Bergamot'], ARRAY['Rose', 'Oud'], ARRAY['Amber', 'Musk']
  ),
  (
    'Evening Collection', 'evening-collection', 'T40 Perfumes', 'gift-sets', 'gift-sets',
    320000, NULL, false, NULL, NULL, true,
    'Four evening statements for hosts who entertain after dark.',
    ARRAY['https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=800&auto=format&fit=crop'],
    'oud leather', 'evening',
    ARRAY['Spice'], ARRAY['Oud', 'Leather'], ARRAY['Amber', 'Vanilla']
  ),
  (
    'Hair Perfume Mist', 'hair-perfume-mist', 'T40 Perfumes', 'women', 'hair-perfume',
    65000, NULL, false, NULL, 'NEW', true,
    'Light, alcohol-softened mist designed for hair and décolletage.',
    ARRAY['https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=800&auto=format&fit=crop'],
    'floral', 'everyday',
    ARRAY['Pear'], ARRAY['Jasmine'], ARRAY['White musk']
  ),
  (
    'Oud Intense', 'oud-intense', 'T40 Perfumes', 'men', 'oud-perfume',
    145000, NULL, false, NULL, 'TRENDING', true,
    'Deep oud resin with smoky incense — for oud lovers.',
    ARRAY['https://images.unsplash.com/photo-1541643600914-78a08468325f?q=80&w=800&auto=format&fit=crop'],
    'oud leather', 'evening',
    ARRAY['Incense'], ARRAY['Oud'], ARRAY['Leather', 'Amber']
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  on_sale = EXCLUDED.on_sale,
  sale_ends_at = EXCLUDED.sale_ends_at,
  badge = EXCLUDED.badge,
  in_stock = EXCLUDED.in_stock,
  description = EXCLUDED.description,
  images = EXCLUDED.images,
  notes = EXCLUDED.notes,
  occasion = EXCLUDED.occasion,
  top_notes = EXCLUDED.top_notes,
  heart_notes = EXCLUDED.heart_notes,
  base_notes = EXCLUDED.base_notes;

-- Gift set bundle links (required for product page + checkout)
UPDATE products SET product_type = 'gift_set' WHERE category = 'gift-sets';

INSERT INTO gift_set_items (gift_set_id, product_id, quantity, sort_order)
SELECT gs.id, p.id, 1, ord.sort_order
FROM products gs
JOIN (
  VALUES ('sweet-noble', 0), ('24th-oud', 1), ('revenge', 2)
) AS ord(slug, sort_order) ON true
JOIN products p ON p.slug = ord.slug
WHERE gs.slug = 'the-signature-trio'
ON CONFLICT (gift_set_id, product_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;

INSERT INTO gift_set_items (gift_set_id, product_id, quantity, sort_order)
SELECT gs.id, p.id, 1, ord.sort_order
FROM products gs
JOIN (
  VALUES ('24th-oud', 0), ('revenge', 1), ('tom-ford-oud-wood', 2), ('dior-sauvage', 3)
) AS ord(slug, sort_order) ON true
JOIN products p ON p.slug = ord.slug
WHERE gs.slug = 'evening-collection'
ON CONFLICT (gift_set_id, product_id) DO UPDATE SET sort_order = EXCLUDED.sort_order;
