/** Shop All collections — path segments under `/shop/{slug}` */
export const SHOP_COLLECTIONS = [
  { label: "Trending", slug: "trending" },
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "Best Sellers", slug: "best-sellers" },
  { label: "Flash Sales", slug: "flash-sales" },
  { label: "Gift Sets", slug: "gift-sets" },
] as const;

export type ShopCollectionSlug = (typeof SHOP_COLLECTIONS)[number]["slug"];

export const SHOP_COLLECTION_SLUGS = new Set<string>(
  SHOP_COLLECTIONS.map((c) => c.slug)
);

export const FLASH_SALE_COLLECTION_SLUG = "flash-sales";

export function shopCollectionHref(slug: string): string {
  return `/shop/${slug}`;
}
