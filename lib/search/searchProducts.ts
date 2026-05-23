import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import type { ProductDetail } from "@/types/product";
import { applyProductSort } from "@/lib/shop/applyProductSort";
import { isFeaturedSort, type ProductSort } from "@/lib/shop/sortOptions";
import { shuffleWithSeed } from "@/lib/shop/shuffle";

/** Escape `%` and `_` for safe ilike patterns */
export function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&");
}

export type SearchSort = ProductSort;

export type SearchProductsOptions = {
  limit?: number;
  offset?: number;
  sort?: SearchSort;
  /** Stable random order for featured sort */
  seed?: string;
};

export type SearchProductsResult = {
  products: ProductDetail[];
  count: number;
  error: string | null;
};

export async function searchProducts(
  supabase: SupabaseClient,
  query: string,
  options: SearchProductsOptions = {}
): Promise<SearchProductsResult> {
  const term = query.trim();
  if (term.length < 1) {
    return { products: [], count: 0, error: null };
  }

  const pattern = `%${escapeIlike(term)}%`;
  const { limit = 24, offset = 0, sort = "featured", seed = "featured" } = options;

  const searchFilter = `name.ilike.${pattern},brand.ilike.${pattern},notes.ilike.${pattern},description.ilike.${pattern}`;

  if (isFeaturedSort(sort)) {
    const { data: idRows, error: idError, count } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .or(searchFilter);

    if (idError) {
      return { products: [], count: 0, error: idError.message };
    }

    const shuffledIds = shuffleWithSeed(
      (idRows ?? []).map((row) => row.id),
      seed
    );
    const pageIds = shuffledIds.slice(offset, offset + limit);

    if (pageIds.length === 0) {
      return { products: [], count: count ?? 0, error: null };
    }

    const { data, error } = await supabase.from("products").select("*").in("id", pageIds);

    if (error) {
      return { products: [], count: 0, error: error.message };
    }

    const byId = new Map((data ?? []).map((row) => [row.id, row]));
    const ordered = pageIds.map((id) => byId.get(id)).filter(Boolean);
    const normalized = ordered.map(normalizeProduct);
    const products = await enrichProductsWithVariantsClient(normalized, supabase);

    return {
      products,
      count: count ?? 0,
      error: null,
    };
  }

  let q = supabase.from("products").select("*", { count: "exact" }).or(searchFilter);

  q = applyProductSort(q, sort);

  const from = offset;
  const to = offset + limit - 1;
  const { data, error, count } = await q.range(from, to);

  if (error) {
    return { products: [], count: 0, error: error.message };
  }

  const normalized = (data ?? []).map(normalizeProduct);
  const products = await enrichProductsWithVariantsClient(normalized, supabase);

  return {
    products,
    count: count ?? 0,
    error: null,
  };
}
