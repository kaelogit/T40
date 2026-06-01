export type LegalSection = {
  title: string;
  body: string[];
  list?: string[];
};

export type LegalPageContent = {
  title: string;
  eyebrow: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const CONTACT =
  "If you have questions about these terms, contact us at hello@t40perfumesng.com or through our contact page at t40perfumesng.com/contact.";

export const termsOfService: LegalPageContent = {
  title: "Terms of Service",
  eyebrow: "Legal",
  intro:
    "These Terms of Service govern your use of the T40 Perfumes website and your purchase of products from us. By using this site or placing an order, you agree to these terms.",
  lastUpdated: "22 May 2026",
  sections: [
    {
      title: "1. About us",
      body: [
        "This website is operated by T40 Perfumes (“we”, “us”, “our”). Throughout these terms, “you” means any person who visits the site or buys from us.",
      ],
    },
    {
      title: "2. Use of this website",
      body: [
        "You may use this website for lawful shopping and browsing only. You must not misuse the site, attempt unauthorised access, interfere with its operation, or use it for fraudulent purposes.",
        "We may update, suspend, or withdraw any part of the site at any time without notice.",
      ],
    },
    {
      title: "3. Products and pricing",
      body: [
        "We sell fragrance and related products as described on each product page. Colours, packaging, and images may vary slightly from what you see on screen.",
        "Prices are shown in Nigerian Naira (₦) unless stated otherwise and include applicable taxes where required. We may change prices at any time, but changes will not affect orders already confirmed.",
        "We reserve the right to limit quantities, refuse orders, or cancel orders if we suspect error, fraud, or stock unavailability.",
      ],
    },
    {
      title: "4. Orders and payment",
      body: [
        "When you place an order, you offer to buy the products in your cart. We send an order confirmation when payment is successfully received. A contract is formed when we accept your order by confirming payment.",
        "Payment is processed securely through our payment partners (including Paystack and Stripe, depending on your location). We do not store full card details on our servers.",
        "You are responsible for providing accurate delivery and contact information.",
      ],
    },
    {
      title: "5. Shipping and delivery",
      body: [
        "Delivery times are set out in our Shipping & Returns policy. Shipping costs are agreed with you after checkout — they are not included in the product total at payment. Risk of loss passes to you when the order is delivered to the address you provide.",
      ],
    },
    {
      title: "6. Returns and refunds",
      body: [
        "Returns and refunds are handled according to our Shipping & Returns policy. Certain items (such as opened fragrance products) may not be eligible for return for hygiene and safety reasons.",
      ],
    },
    {
      title: "7. Intellectual property",
      body: [
        "All content on this website — including text, images, logos, and design — is owned by T40 Perfumes or our licensors and is protected by copyright and trademark laws. You may not copy, reproduce, or use it without our written permission.",
      ],
    },
    {
      title: "8. Disclaimer",
      body: [
        "Products are sold as described. Fragrance experiences vary by skin chemistry. We do not guarantee that a product will smell identical on every person.",
        "To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential losses arising from your use of the site or our products, except where such liability cannot be excluded by law.",
      ],
    },
    {
      title: "9. Privacy",
      body: [
        "Your personal data is handled as described in our Privacy Policy.",
      ],
    },
    {
      title: "10. Changes to these terms",
      body: [
        "We may update these terms from time to time. The “Last updated” date at the top of this page shows when they were last revised. Continued use of the site after changes means you accept the updated terms.",
      ],
    },
    {
      title: "11. Governing law",
      body: [
        "These terms are governed by the laws of the Federal Republic of Nigeria. Any dispute shall be subject to the exclusive jurisdiction of the courts of Nigeria, unless mandatory consumer protection laws in your country require otherwise.",
      ],
    },
    {
      title: "12. Contact",
      body: [CONTACT],
    },
  ],
};

export const privacyPolicy: LegalPageContent = {
  title: "Privacy Policy",
  eyebrow: "Legal",
  intro:
    "This Privacy Policy explains how T40 Perfumes collects, uses, and protects your personal information when you use our website or buy from us.",
  lastUpdated: "22 May 2026",
  sections: [
    {
      title: "1. Who we are",
      body: [
        "T40 Perfumes operates this online store. For privacy enquiries, email hello@t40perfumesng.com or use our contact page.",
      ],
    },
    {
      title: "2. Information we collect",
      body: ["We may collect the following information:"],
      list: [
        "Name, email address, phone number, and delivery address when you order or contact us",
        "Order history, payment status, and communication records",
        "Account login details if you create an account",
        "Technical data such as IP address, browser type, and device information",
        "Cookies and similar technologies (see section 6)",
      ],
    },
    {
      title: "3. How we use your information",
      body: ["We use your information to:"],
      list: [
        "Process and deliver your orders",
        "Send order confirmations, shipping updates, and customer service replies",
        "Process payments through our payment providers",
        "Prevent fraud and keep our site secure",
        "Improve our website and customer experience",
        "Send marketing emails only if you have opted in (you may unsubscribe at any time)",
      ],
    },
    {
      title: "4. Legal basis",
      body: [
        "We process your data to perform our contract with you (fulfilling orders), to comply with legal obligations, and where applicable based on our legitimate interests in running and improving our business. Marketing communications rely on your consent where required.",
      ],
    },
    {
      title: "5. Sharing your information",
      body: [
        "We do not sell your personal data. We share it only with trusted service providers who help us operate our business, such as:",
      ],
      list: [
        "Payment processors (e.g. Paystack, Stripe)",
        "Shipping and courier partners",
        "Email and hosting providers",
        "Website analytics and infrastructure providers",
      ],
    },
    {
      title: "6. Cookies",
      body: [
        "Our site uses cookies and similar technologies to keep you signed in, remember preferences, and understand how visitors use the site. You can control cookies through your browser settings. Disabling cookies may affect some site features.",
      ],
    },
    {
      title: "7. Data retention",
      body: [
        "We keep your information for as long as needed to fulfil orders, meet legal and accounting requirements, and resolve disputes. Order records are typically retained for the period required by applicable tax and commercial law.",
      ],
    },
    {
      title: "8. Security",
      body: [
        "We use reasonable technical and organisational measures to protect your data. No method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "9. Your rights",
      body: [
        "Depending on your location, you may have the right to access, correct, delete, or restrict use of your personal data, or to object to certain processing. To exercise these rights, contact us at hello@t40perfumesng.com. You may also lodge a complaint with a data protection authority where applicable.",
      ],
    },
    {
      title: "10. Children",
      body: [
        "Our site is not intended for children under 16. We do not knowingly collect personal data from children.",
      ],
    },
    {
      title: "11. International transfers",
      body: [
        "Your data may be processed in Nigeria or in countries where our service providers operate. We take steps to ensure appropriate safeguards where required.",
      ],
    },
    {
      title: "12. Changes to this policy",
      body: [
        "We may update this Privacy Policy from time to time. The “Last updated” date shows when it was last revised. Significant changes will be posted on this page.",
      ],
    },
    {
      title: "13. Contact",
      body: [
        "Questions about this policy? Email hello@t40perfumesng.com or visit our contact page.",
      ],
    },
  ],
};

export const shippingAndReturns: LegalPageContent = {
  title: "Shipping & Returns",
  eyebrow: "Legal",
  intro:
    "This page explains how we deliver orders, what to expect on delivery, and how returns and refunds work at T40 Perfumes.",
  lastUpdated: "22 May 2026",
  sections: [
    {
      title: "1. Shipping areas",
      body: [
        "We ship within Nigeria and to selected international destinations. After you order, we will confirm whether we can deliver to your location. We reserve the right to refuse delivery to places we cannot service.",
      ],
    },
    {
      title: "2. Processing time",
      body: [
        "Orders are typically processed within 1–3 business days after payment is confirmed. Processing may take longer during peak periods, public holidays, or for personalised items.",
      ],
    },
    {
      title: "3. Delivery times",
      body: [
        "Estimated delivery times depend on your location and the shipping option we agree with you:",
      ],
      list: [
        "Nigeria (major cities): 2–5 business days after dispatch",
        "Nigeria (other areas): 3–7 business days after dispatch",
        "International: 7–21 business days after dispatch, depending on destination and customs",
      ],
    },
    {
      title: "4. Shipping costs",
      body: [
        "Shipping is not included in the product price you pay at checkout, except where a promotion applies.",
        "Free delivery within Lagos: orders over ₦90,000 (ninety thousand Naira) delivered to a Lagos address qualify for free shipping. The free-delivery threshold is based on your order subtotal after any discounts, before payment.",
        "All other deliveries: after your order is confirmed, we will contact you to discuss delivery options and agree shipping fees based on your address and order size.",
      ],
    },
    {
      title: "5. Order tracking",
      body: [
        "When your order is dispatched, we send a confirmation email with tracking information where available. If you do not receive an update within the expected processing window, contact us at hello@t40perfumesng.com.",
      ],
    },
    {
      title: "6. Delivery issues",
      body: [
        "Please ensure your delivery address and phone number are correct. We are not responsible for delays caused by incorrect addresses, failed delivery attempts, or customs holds outside our control.",
        "If your package arrives damaged, take photos of the packaging and product and contact us within 48 hours of delivery.",
      ],
    },
    {
      title: "7. Returns — eligibility",
      body: [
        "Because fragrance products are personal and hygiene-sensitive, we accept returns only under the conditions below:",
      ],
      list: [
        "Unopened, unused products in original sealed packaging — within 14 days of delivery",
        "Damaged, defective, or incorrect items — reported within 48 hours of delivery with photos",
        "Opened or used fragrance products cannot be returned unless faulty or not as described",
      ],
    },
    {
      title: "8. How to request a return",
      body: [
        "Email hello@t40perfumesng.com with your order number, reason for return, and photos if the item is damaged or incorrect. Wait for our approval and return instructions before sending anything back. Unauthorised returns may not be accepted.",
      ],
    },
    {
      title: "9. Return shipping",
      body: [
        "If the return is due to our error (wrong item, defective product), we will cover return shipping. For change-of-mind returns on eligible unopened items, you are responsible for return shipping costs unless stated otherwise in a promotion.",
      ],
    },
    {
      title: "10. Refunds",
      body: [
        "Approved refunds are processed to your original payment method within 7–14 business days after we receive and inspect the returned item. Shipping fees are non-refundable except where the return is due to our error.",
      ],
    },
    {
      title: "11. Exchanges",
      body: [
        "We do not offer direct exchanges. If you wish to swap a product, return the eligible item for a refund (where applicable) and place a new order.",
      ],
    },
    {
      title: "12. Contact",
      body: [
        "For shipping or returns questions, email hello@t40perfumesng.com or use our contact page.",
      ],
    },
  ],
};
