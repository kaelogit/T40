-- Seed contact page content (uses existing site_pages table)

INSERT INTO site_pages (page_key, content)
SELECT 'contact', '{
  "hero": {
    "eyebrow": "Client Services",
    "title": "Contact Us",
    "imageUrl": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1600&auto=format&fit=crop"
  },
  "form": {
    "heading": "Send a message",
    "intro": "Whether you have a question about an order, a fragrance recommendation, or a partnership inquiry — we are here to help.",
    "subjectOptions": [
      "Order inquiry",
      "Product question",
      "Wholesale / partnership",
      "Press",
      "Other"
    ],
    "successTitle": "Message sent",
    "successMessage": "Thank you for reaching out. Our team will respond within 1–2 business days."
  },
  "sidebar": {
    "eyebrow": "Direct lines",
    "email": { "label": "Email", "address": "hello@t40perfumes.com" },
    "whatsapp": {
      "label": "WhatsApp",
      "display": "+234 800 000 0000",
      "href": "https://wa.me/2348000000000"
    },
    "studio": {
      "label": "Studio",
      "lines": ["Visits by appointment"]
    },
    "note": "For order updates, include your order number (e.g. T40-XXXXXX) in your message. We typically respond within 24–48 hours on business days."
  }
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_pages WHERE page_key = 'contact');
