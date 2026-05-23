import { isFeaturedSort } from "./sortOptions";

/** Apply server-side sort. Featured uses client-side seeded shuffle instead. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyProductSort(query: any, sort?: string) {
  if (isFeaturedSort(sort)) return query;
  if (sort === "price-asc") return query.order("price", { ascending: true });
  if (sort === "price-desc") return query.order("price", { ascending: false });
  if (sort === "newest") return query.order("created_at", { ascending: false });
  if (sort === "oldest") return query.order("created_at", { ascending: true });
  return query;
}
