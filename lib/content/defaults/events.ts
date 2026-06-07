import type { StoreEvent } from "../types";

export const DEFAULT_EVENTS: StoreEvent[] = [
  {
    slug: "t40-perfume-show-lagos-2026",
    title: "T40 Perfumes Pop Up Show",
    tagline: "Your complimentary ticket to the T40 Perfumes Lagos Show",
    description: `Join us for the T40 Perfumes Pop Up Show — an immersive fragrance experience in the heart of Victoria Island.

Don't miss it. Kindly confirm your attendance by following the ticket link below.

We look forward to serving you. Distributors and stockists are very welcome.`,
    venueName: "Bature Brewery",
    venueAddress: "256 Etim Inyang Crescent, Victoria Island",
    city: "Lagos",
    startsAt: "2026-06-12",
    endsAt: "2026-06-13",
    schedule: [
      { label: "Doors open", time: "12 Noon" },
      { label: "Red Carpet", time: "2pm" },
      { label: "After Party", time: "8pm – 3am" },
    ],
    imageUrl: "/events/t40-lagos-popup-2026.jpg",
    ticketUrl:
      "https://www.eventbrite.co.uk/e/t40-perfume-show-lagos-tickets-1989041022241",
    ticketCtaLabel: "Confirm attendance",
    published: true,
    sortOrder: 0,
  },
];
