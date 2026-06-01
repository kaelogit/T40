export type BlogPost = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  category: string;
  body: string;
  published?: boolean;
};

export type FaqItem = {
  id?: string;
  question: string;
  answer: string;
  sortOrder?: number;
};

export type FaqCategory = {
  id?: string;
  title: string;
  sortOrder?: number;
  items: FaqItem[];
};

export type AnnouncementLink = {
  id?: string;
  label: string;
  href: string;
  sortOrder?: number;
};

export type AnnouncementContent = {
  id?: string;
  active: boolean;
  badgeLabel: string;
  messageShort: string;
  messageFull: string;
  readLinkLabel: string;
  readLinkHref: string;
  sortOrder?: number;
  links: AnnouncementLink[];
  /** Changes when admin saves — used to re-show bar after dismiss */
  updatedAt?: string;
};

export type AboutAwardProduct = {
  name: string;
  slug: string;
  tagline: string;
  image: string;
};

export type AboutContent = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  origin: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  awards: {
    eyebrow: string;
    title: string;
    description: string;
    /** Key honours — shown as a list on the About page */
    highlights?: string[];
    productSlugs: string[];
  };
  values: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };
  milestones: {
    eyebrow: string;
    title: string;
    items: { year: string; label: string }[];
  };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export type AboutPageData = {
  content: AboutContent;
  awardProducts: AboutAwardProduct[];
};

export type ContactContent = {
  hero: {
    eyebrow: string;
    title: string;
    imageUrl: string;
  };
  form: {
    heading: string;
    intro: string;
    subjectOptions: string[];
    successTitle: string;
    successMessage: string;
  };
  sidebar: {
    eyebrow: string;
    email: { label: string; address: string };
    whatsapp: { label: string; display: string; href: string };
    studio: { label: string; lines: string[] };
    note: string;
  };
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  hero: {
    eyebrow: "Client Services",
    title: "Contact Us",
    imageUrl:
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=1600&auto=format&fit=crop",
  },
  form: {
    heading: "Send a message",
    intro:
      "Whether you have a question about an order, a fragrance recommendation, or a partnership inquiry — we are here to help.",
    subjectOptions: [
      "Order inquiry",
      "Product question",
      "Wholesale / partnership",
      "Press",
      "Other",
    ],
    successTitle: "Message sent",
    successMessage:
      "Thank you for reaching out. Our team will respond within 1–2 business days.",
  },
  sidebar: {
    eyebrow: "Direct lines",
    email: { label: "Email", address: "hello@t40perfumesng.com" },
    whatsapp: {
      label: "WhatsApp",
      display: "+447930252011",
      href: "https://wa.me/447930252011",
    },
    studio: {
      label: "Studio",
      lines: ["Visits by appointment"],
    },
    note: "For order updates, include your order number (e.g. T40-XXXXXX) in your message. We typically respond within 24–48 hours on business days.",
  },
};

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  hero: {
    eyebrow: "The House of T40",
    title: "Scent Without\nCompromise",
    subtitle:
      "T40 Perfumes crafts fragrances that honor tradition, embrace innovation, and refuse to fade before you do.",
    imageUrl: "/about/hero.jpg",
  },
  origin: {
    eyebrow: "Our Origin",
    title: "A House\nWith Global Reach",
    paragraphs: [
      "T40 was never meant to be another fragrance retailer. We set out to build a house — one that formulates, bottles, and stands behind every scent we release under our name.",
      "From the first drop of Sweet Noble to the dark elegance of 24th Oud, each creation reflects months of refinement. We source raw materials with the same rigor we apply to blending, because the difference between good and unforgettable lives in the details.",
      "Today, T40 serves clients worldwide — collectors, first-time buyers, and everyone who understands that how you smell is how you are remembered.",
    ],
  },
  awards: {
    eyebrow: "International recognition",
    title: "17 awards.\nUK, USA & beyond.",
    description:
      "T40 fragrances and our founder have been recognized across the UK, USA, and Nigeria — in industry, media, and community awards.",
    highlights: [
      "Award-winning perfumes — UK & USA",
      "Featured in Ebony Magazine",
      "NIBAD 2025 — Best Product, USA",
      "Noble UK — Industrialist of the Year 2024",
      "Nigerian British Award Winner 2025",
    ],
    productSlugs: ["revenge", "sweet-noble", "24th-oud"],
  },
  values: {
    eyebrow: "The T40 Standard",
    title: "What We Stand For",
    items: [
      {
        title: "Concentration",
        body: "We formulate for longevity. Every T40 Exclusive is built to perform from first spray to final hour.",
      },
      {
        title: "Integrity",
        body: "Transparent sourcing, honest pricing, and authentic product — no shortcuts, no compromises.",
      },
      {
        title: "Identity",
        body: "Fragrance should feel like an extension of who you are — not a costume, not a trend.",
      },
    ],
  },
  milestones: {
    eyebrow: "Milestones",
    title: "Our Journey",
    items: [
      { year: "2019", label: "T40 founded with a single vision: world-class scent, no compromises." },
      { year: "2021", label: "Sweet Noble launches — quickly becoming a signature of the house." },
      { year: "2023", label: "24th Oud and Re'Venge join the exclusives line, pushing oud and amber into new territory." },
      { year: "2024", label: "Noble UK — Industrialist of the Year." },
      {
        year: "2025",
        label:
          "Nigerian British Award Winner; NIBAD 2025 Best Product USA; Ebony Magazine feature — 17 international awards in total.",
      },
    ],
  },
  cta: {
    title: "Experience T40 Exclusives",
    description: "Explore the award-winning collection and find the scent that becomes yours.",
    primaryLabel: "Shop Exclusives",
    primaryHref: "/shop/t40-exclusives",
    secondaryLabel: "Read our awards story",
    secondaryHref: "/blog/t40-international-awards",
  },
};
