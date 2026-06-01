import type { FaqCategory } from "../types";

export const DEFAULT_FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Orders & Delivery",
    items: [
      {
        question: "How long does delivery take?",
        answer:
          "Most orders ship within 1–2 business days after payment confirmation. Delivery within Nigeria typically takes 3–7 business days depending on your location. International delivery times vary — we will confirm when your order ships.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "We ship within Nigeria and to selected international destinations. At checkout, choose Nigeria for Paystack or Other countries for Stripe. Contact us if you need help with your country.",
      },
      {
        question: "How much does shipping cost?",
        answer:
          "Delivery within Lagos is free on orders over ₦80,000. For orders below that threshold, or for delivery outside Lagos, shipping is not charged at checkout — we will contact you after your order is confirmed to discuss delivery options and agree the fee based on your location and order size.",
      },
      {
        question: "Do you offer free delivery in Lagos?",
        answer:
          "Yes. Orders over ₦80,000 delivered within Lagos qualify for free shipping. Add items to your cart to see how close you are to the threshold. Delivery to other states in Nigeria and international destinations is quoted separately after checkout.",
      },
      {
        question: "Can I change my delivery address after ordering?",
        answer:
          "If your order has not shipped yet, reach out via our contact page with your order number and the corrected address. Once dispatched, we cannot redirect packages.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        question: "Which payment methods do you accept?",
        answer:
          "At checkout, choose your country. Nigeria orders pay with Paystack (cards, bank transfer, USSD). Other countries pay with Stripe (international card). All prices are listed in Nigerian Naira (₦).",
      },
      {
        question: "Is my payment secure?",
        answer:
          "Yes. Payments are processed through PCI-compliant providers. T40 never stores your full card details on our servers.",
      },
      {
        question: "Can I use a coupon code?",
        answer:
          "Yes. Enter your code at checkout before payment. Coupons apply to eligible subtotals only and cannot be combined unless stated otherwise.",
      },
    ],
  },
  {
    title: "Fragrance & Authenticity",
    items: [
      {
        question: "Are T40 fragrances authentic?",
        answer:
          "Every bottle we sell is sourced through verified channels. T40 Exclusives — including our internationally award-winning Re'Venge, Sweet Noble, and 24th Oud — are crafted and bottled to our house standard.",
      },
      {
        question: "How should I store my perfume?",
        answer:
          "Keep bottles away from direct sunlight and extreme heat. Store upright in a cool, dry place. Proper storage preserves the integrity of top, heart, and base notes for years.",
      },
      {
        question: "What is the difference between Eau de Parfum and Extrait?",
        answer:
          "Eau de Parfum typically contains 15–20% fragrance oil and lasts 6–8 hours on skin. Extrait or parfum concentrations are richer and longer-wearing. Product pages note concentration where applicable.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Unopened, sealed fragrances in original packaging may be returned within 14 days of delivery for a store credit or exchange, subject to inspection. Opened bottles cannot be returned for hygiene reasons.",
      },
      {
        question: "What if my order arrives damaged?",
        answer:
          "Photograph the package and product within 48 hours of delivery and contact us with your order number. We will arrange a replacement or refund for verified damage.",
      },
    ],
  },
];
