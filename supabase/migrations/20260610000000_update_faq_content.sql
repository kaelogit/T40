-- Sync FAQ copy with lib/content/defaults/faq.ts (checkout + international shipping)

UPDATE faq_items
SET
  question = 'How long does delivery take?',
  answer = 'Most orders ship within 1–2 business days after payment confirmation. Delivery within Nigeria typically takes 3–7 business days depending on your location. International delivery times vary — we will confirm when your order ships.'
WHERE question IN (
  'How long does delivery take?',
  'How long does delivery take within Nigeria?'
);

UPDATE faq_items
SET answer = 'We ship within Nigeria and to selected international destinations. At checkout, choose Nigeria for Paystack or Other countries for Stripe. Contact us if you need help with your country.'
WHERE question = 'Do you ship internationally?';

UPDATE faq_items
SET answer = 'At checkout, choose your country. Nigeria orders pay with Paystack (cards, bank transfer, USSD). Other countries pay with Stripe (international card). All prices are listed in Nigerian Naira (₦).'
WHERE question = 'Which payment methods do you accept?';

UPDATE faq_items
SET answer = 'Every bottle we sell is sourced through verified channels. T40 Exclusives — including our internationally award-winning Re''Venge, Sweet Noble, and 24th Oud — are crafted and bottled to our house standard.'
WHERE question = 'Are T40 fragrances authentic?';
