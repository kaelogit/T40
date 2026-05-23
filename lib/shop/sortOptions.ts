export type ProductSort =
  | "featured"
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc";

export const PRODUCT_SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

export const DEFAULT_PRODUCT_SORT: ProductSort = "featured";

export function isFeaturedSort(sort?: string | null): boolean {
  return !sort || sort === "featured" || sort === "bestselling";
}

export function normalizeProductSort(sort?: string | null): ProductSort {
  if (sort === "newest") return "newest";
  if (sort === "oldest") return "oldest";
  if (sort === "price-asc") return "price-asc";
  if (sort === "price-desc") return "price-desc";
  return "featured";
}
