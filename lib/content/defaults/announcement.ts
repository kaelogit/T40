import type { AnnouncementContent } from "../types";

export const DEFAULT_ANNOUNCEMENT: AnnouncementContent = {
  active: true,
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
};
