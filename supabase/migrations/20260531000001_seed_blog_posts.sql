-- Seed FAQ categories and items from original static content
DO $$
DECLARE
  cat_orders uuid;
  cat_payments uuid;
  cat_fragrance uuid;
  cat_returns uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM faq_categories LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO faq_categories (title, sort_order) VALUES ('Orders & Delivery', 0) RETURNING id INTO cat_orders;
  INSERT INTO faq_items (category_id, question, answer, sort_order) VALUES
    (cat_orders, 'How long does delivery take?', 'Most orders ship within 1–2 business days after payment confirmation. Delivery within Nigeria typically takes 3–7 business days depending on your location. International delivery times vary — we will confirm when your order ships.', 0),
    (cat_orders, 'Do you ship internationally?', 'We ship within Nigeria and to selected international destinations. At checkout, choose Nigeria for Paystack or Other countries for Stripe. Contact us if you need help with your country.', 1),
    (cat_orders, 'Can I change my delivery address after ordering?', 'If your order has not shipped yet, reach out via our contact page with your order number and the corrected address. Once dispatched, we cannot redirect packages.', 2);

  INSERT INTO faq_categories (title, sort_order) VALUES ('Payments', 1) RETURNING id INTO cat_payments;
  INSERT INTO faq_items (category_id, question, answer, sort_order) VALUES
    (cat_payments, 'Which payment methods do you accept?', 'At checkout, choose your country. Nigeria orders pay with Paystack (cards, bank transfer, USSD). Other countries pay with Stripe (international card). All prices are listed in Nigerian Naira (₦).', 0),
    (cat_payments, 'Is my payment secure?', 'Yes. Payments are processed through PCI-compliant providers. T40 never stores your full card details on our servers.', 1),
    (cat_payments, 'Can I use a coupon code?', 'Yes. Enter your code at checkout before payment. Coupons apply to eligible subtotals only and cannot be combined unless stated otherwise.', 2);

  INSERT INTO faq_categories (title, sort_order) VALUES ('Fragrance & Authenticity', 2) RETURNING id INTO cat_fragrance;
  INSERT INTO faq_items (category_id, question, answer, sort_order) VALUES
    (cat_fragrance, 'Are T40 fragrances authentic?', 'Every bottle we sell is sourced through verified channels. T40 Exclusives — including our internationally award-winning Re''Venge, Sweet Noble, and 24th Oud — are crafted and bottled to our house standard.', 0),
    (cat_fragrance, 'How should I store my perfume?', 'Keep bottles away from direct sunlight and extreme heat. Store upright in a cool, dry place. Proper storage preserves the integrity of top, heart, and base notes for years.', 1),
    (cat_fragrance, 'What is the difference between Eau de Parfum and Extrait?', 'Eau de Parfum typically contains 15–20% fragrance oil and lasts 6–8 hours on skin. Extrait or parfum concentrations are richer and longer-wearing. Product pages note concentration where applicable.', 2);

  INSERT INTO faq_categories (title, sort_order) VALUES ('Returns & Exchanges', 3) RETURNING id INTO cat_returns;
  INSERT INTO faq_items (category_id, question, answer, sort_order) VALUES
    (cat_returns, 'What is your return policy?', 'Unopened, sealed fragrances in original packaging may be returned within 14 days of delivery for a store credit or exchange, subject to inspection. Opened bottles cannot be returned for hygiene reasons.', 0),
    (cat_returns, 'What if my order arrives damaged?', 'Photograph the package and product within 48 hours of delivery and contact us with your order number. We will arrange a replacement or refund for verified damage.', 1);
END $$;
