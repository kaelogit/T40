/**
 * Product primary categories — fixed list, not editable in admin.
 * Stored on `products.category` as slug text. Must match shop URL paths.
 */
export const PRODUCT_CATEGORIES = [
  { label: "Women", value: "women", hasSubcategories: false },
  { label: "Men", value: "men", hasSubcategories: false },
  { label: "Unisex", value: "unisex", hasSubcategories: false },
  { label: "T40 Exclusives", value: "t40-exclusives", hasSubcategories: true },
  { label: "Gift Sets", value: "gift-sets", hasSubcategories: false },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["value"];

export const PRODUCT_CATEGORY_SLUGS = PRODUCT_CATEGORIES.map((c) => c.value);

export function categoryHasSubcategories(slug: string): boolean {
  return PRODUCT_CATEGORIES.find((c) => c.value === slug)?.hasSubcategories ?? false;
}

/** @deprecated use PRODUCT_CATEGORIES */
export const PRODUCT_CATEGORY_OPTIONS = PRODUCT_CATEGORIES.map(({ label, value }) => ({
  label,
  value,
}));

/** Single perfumes only — gift sets use Admin → Add gift set. */
export const SINGLE_PRODUCT_CATEGORY_OPTIONS = PRODUCT_CATEGORIES.filter(
  (c) => c.value !== "gift-sets"
).map(({ label, value }) => ({ label, value }));

export const T40_HOUSE_BRAND = "T40 Perfumes";
