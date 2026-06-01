import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

const DISALLOW = ["/admin", "/api/admin", "/checkout", "/order-confirmation"];

/** Social crawlers — explicit allow for link previews (Facebook, X, WhatsApp, etc.) */
const SOCIAL_CRAWLERS = [
  "facebookexternalhit",
  "Facebot",
  "meta-externalagent",
  "meta-externalfetcher",
  "facebookcatalog",
  "Twitterbot",
  "LinkedInBot",
  "WhatsApp",
  "Slackbot",
  "Discordbot",
  "TelegramBot",
  "Pinterest",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      ...SOCIAL_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
