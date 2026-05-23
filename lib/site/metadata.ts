import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/utils";

export const SITE_NAME = "T40 Perfumes";
export const DEFAULT_DESCRIPTION =
  "Shop luxury fragrances — T40 Exclusives, designer brands, and gift sets. Delivery across Nigeria.";

/** Default share image — replace with `public/og-share.jpg` (1200×630) when ready */
export const DEFAULT_OG_IMAGE = "/hero/sweet-noble.jpg";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveOgImage(image?: string | null): string {
  const src = image?.trim();
  if (src) return absoluteUrl(src);
  return absoluteUrl(DEFAULT_OG_IMAGE);
}

function truncate(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image,
  type = "website",
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article";
}): Metadata {
  const desc = truncate(description);
  const url = absoluteUrl(path);
  const ogImage = resolveOgImage(image);

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title,
      description: desc,
      siteName: SITE_NAME,
      locale: "en_NG",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}

export function buildProductMetadata(product: {
  name: string;
  slug?: string | null;
  description?: string | null;
  brand?: string | null;
  images?: string[];
}): Metadata {
  const path = `/product/${product.slug ?? ""}`;
  const description =
    product.description?.trim() ||
    `Shop ${product.name}${product.brand ? ` by ${product.brand}` : ""} — luxury fragrance from T40 Perfumes.`;

  return buildPageMetadata({
    title: product.name,
    description,
    path,
    image: product.images?.[0],
  });
}

const homeOg = buildPageMetadata({
  title: `${SITE_NAME} | Luxury Fragrances`,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | Luxury Fragrances`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: homeOg.alternates,
  openGraph: homeOg.openGraph,
  twitter: homeOg.twitter,
};
