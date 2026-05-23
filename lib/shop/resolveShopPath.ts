import { SHOP_COLLECTION_SLUGS } from "./collections";

/** URL path segments under /shop → filter params used by ProductGrid */
const COLLECTION_SLUGS = SHOP_COLLECTION_SLUGS;

export type ShopPathFilters = {
  category?: string;
  subcategory?: string;
  collection?: string;
  brand?: string;
  scent?: string;
  /** `/shop/scent` with no slug — browse all scent families */
  scentHub?: boolean;
};

export function parseShopSlug(slug?: string[]): ShopPathFilters {
  if (!slug?.length) return {};

  const [first, second] = slug;

  if (first === "brand" && second) {
    return { brand: second };
  }

  if (first === "scent") {
    if (second) return { scent: second };
    return { scentHub: true };
  }

  if (COLLECTION_SLUGS.has(first) && !second) {
    return { collection: first };
  }

  if (second) {
    return { category: first, subcategory: second };
  }

  return { category: first };
}

export function shopPathFromFilters(filters: ShopPathFilters): string {
  if (filters.brand) return `/shop/brand/${filters.brand}`;
  if (filters.scent) return `/shop/scent/${filters.scent}`;
  if (filters.collection) return `/shop/${filters.collection}`;
  if (filters.category && filters.subcategory) {
    return `/shop/${filters.category}/${filters.subcategory}`;
  }
  if (filters.category) return `/shop/${filters.category}`;
  return "/shop";
}
