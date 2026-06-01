import type { AnnouncementContent } from "../types";
import { LAGOS_FREE_SHIPPING_MIN } from "@/lib/shipping/promotions";

const freeShippingFormatted = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
}).format(LAGOS_FREE_SHIPPING_MIN);

export const DEFAULT_ANNOUNCEMENTS: AnnouncementContent[] = [
  {
    active: true,
    sortOrder: 0,
    badgeLabel: "17 international awards",
    messageShort: "UK & USA recognition — Ebony, NIBAD 2025, Noble UK & more",
    messageFull:
      "T40 recognized in the UK and USA — Ebony Magazine, NIBAD 2025 Best Product USA, Noble UK Industrialist of the Year 2024, and Nigerian British Award Winner 2025.",
    readLinkLabel: "Our story",
    readLinkHref: "/about#awards",
    links: [
      { label: "Re'Venge", href: "/product/revenge", sortOrder: 0 },
      { label: "Sweet Noble", href: "/product/sweet-noble", sortOrder: 1 },
      { label: "24th Oud", href: "/product/24th-oud", sortOrder: 2 },
    ],
  },
  {
    active: true,
    sortOrder: 1,
    badgeLabel: "Free Lagos delivery",
    messageShort: `Free shipping on orders over ${freeShippingFormatted} within Lagos`,
    messageFull: `Free delivery within Lagos on orders over ${freeShippingFormatted}. For other areas in Nigeria, delivery fees are confirmed after checkout.`,
    readLinkLabel: "Shop now",
    readLinkHref: "/shop",
    links: [],
  },
];

/** @deprecated Use DEFAULT_ANNOUNCEMENTS */
export const DEFAULT_ANNOUNCEMENT = DEFAULT_ANNOUNCEMENTS[0];
