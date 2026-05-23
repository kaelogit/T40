import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { nameToSlug } from "@/lib/products/slug";

export type ProductSubcategory = {
  id: string;
  parent_category: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

const T40_PARENT = "t40-exclusives";

async function getReadClient(): Promise<SupabaseClient> {
  if (hasAdminClient()) return createAdminClient();
  return createClient();
}

async function getWriteClient(): Promise<SupabaseClient> {
  return createAdminClient();
}

async function fetchProductSubcategories(
  parentCategory: string,
  activeOnly: boolean
): Promise<ProductSubcategory[]> {
  const supabase = await getReadClient();
  let query = supabase
    .from("product_subcategories")
    .select("*")
    .eq("parent_category", parentCategory)
    .order("sort_order", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data } = await query;
  return (data as ProductSubcategory[]) ?? [];
}

async function getUsedSubcategorySlugs(
  supabase: SupabaseClient,
  parentCategory: string
): Promise<Set<string>> {
  const { data: subs } = await supabase
    .from("product_subcategories")
    .select("slug")
    .eq("parent_category", parentCategory);

  const knownSlugs = (subs ?? []).map((row) => row.slug as string).filter(Boolean);
  if (!knownSlugs.length) return new Set();

  const { data: products, error } = await supabase
    .from("products")
    .select("subcategory")
    .in("subcategory", knownSlugs);

  if (error) throw new Error(error.message);

  return new Set(
    (products ?? [])
      .map((row) => row.subcategory as string | null)
      .filter((slug): slug is string => Boolean(slug))
  );
}

export async function getSubcategoriesForCategory(
  parentCategory: string,
  activeOnly = true,
  options?: { usedOnly?: boolean }
): Promise<ProductSubcategory[]> {
  const rows = await fetchProductSubcategories(parentCategory, activeOnly);
  if (!options?.usedOnly) return rows;

  const supabase = await getReadClient();
  const usedSlugs = await getUsedSubcategorySlugs(supabase, parentCategory);
  return rows.filter((row) => usedSlugs.has(row.slug));
}

export async function getAllSubcategoriesAdmin(): Promise<ProductSubcategory[]> {
  return getSubcategoriesForCategory(T40_PARENT, false);
}

function formatSubcategoryError(error: { code?: string; message?: string }): string {
  if (error.code === "23505") {
    return "A subcategory with this slug already exists under T40 Exclusives. Try a different name or slug.";
  }
  return error.message ?? "Could not save subcategory.";
}

export async function createSubcategory(input: {
  parent_category: string;
  name: string;
  slug?: string;
  sort_order?: number;
}) {
  const slug = input.slug?.trim() || nameToSlug(input.name);

  const supabase = await getWriteClient();
  const { data, error } = await supabase
    .from("product_subcategories")
    .insert({
      parent_category: input.parent_category,
      name: input.name.trim(),
      slug,
      sort_order: input.sort_order ?? 0,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatSubcategoryError(error));
  return data as ProductSubcategory;
}

export async function updateSubcategory(
  id: string,
  input: Partial<Pick<ProductSubcategory, "name" | "slug" | "sort_order" | "is_active">>
) {
  const supabase = await getWriteClient();
  const { error } = await supabase.from("product_subcategories").update(input).eq("id", id);
  if (error) throw new Error(formatSubcategoryError(error));
}

export async function deleteSubcategory(id: string) {
  const supabase = await getWriteClient();
  const { error } = await supabase.from("product_subcategories").delete().eq("id", id);
  if (error) throw new Error(formatSubcategoryError(error));
}

async function countProductsUsingSubcategory(
  supabase: SupabaseClient,
  subcategorySlug: string
): Promise<number> {
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("subcategory", subcategorySlug);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

/** Remove a T40 subcategory from nav when no products use its slug anymore. */
export async function pruneT40SubcategoryIfUnused(
  supabase: SupabaseClient,
  subcategorySlug: string | null | undefined
): Promise<boolean> {
  const slug = subcategorySlug?.trim();
  if (!slug) return false;

  const productCount = await countProductsUsingSubcategory(supabase, slug);
  if (productCount > 0) return false;

  const { error: subError } = await supabase
    .from("product_subcategories")
    .delete()
    .eq("parent_category", T40_PARENT)
    .eq("slug", slug);

  if (subError) throw new Error(formatSubcategoryError(subError));

  const { data: parent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", T40_PARENT)
    .maybeSingle();

  if (parent?.id) {
    await supabase.from("categories").delete().eq("parent_id", parent.id).eq("slug", slug);
  }

  return true;
}

/** After a product leaves a T40 subcategory, drop the subcategory if nothing uses it. */
export async function pruneT40SubcategoryAfterProductChange(
  supabase: SupabaseClient,
  previous: { category?: string | null; subcategory?: string | null },
  next: { category?: string | null; subcategory?: string | null }
): Promise<void> {
  const oldSlug = previous.subcategory?.trim();
  if (!oldSlug) return;

  const wasT40 = previous.category === T40_PARENT;
  const stillOnSameSub =
    next.category === T40_PARENT && next.subcategory?.trim() === oldSlug;

  if (!wasT40 || stillOnSameSub) return;

  await pruneT40SubcategoryIfUnused(supabase, oldSlug);
}

/** Drop every T40 subcategory with no linked products (seed/orphan cleanup). */
export async function pruneAllUnusedT40Subcategories(): Promise<number> {
  const supabase = await getWriteClient();
  const { data: subs, error } = await supabase
    .from("product_subcategories")
    .select("slug")
    .eq("parent_category", T40_PARENT);

  if (error) throw new Error(formatSubcategoryError(error));

  let pruned = 0;
  for (const row of subs ?? []) {
    if (await pruneT40SubcategoryIfUnused(supabase, row.slug as string)) {
      pruned += 1;
    }
  }
  return pruned;
}

/** Backfill `product_subcategories` from legacy T40 rows in `categories` (one-time / migration helper). */
export async function syncT40SubcategoriesFromCategories(): Promise<number> {
  const supabase = await getWriteClient();

  const { data: parent } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", T40_PARENT)
    .maybeSingle();

  if (!parent?.id) return 0;

  const { data: legacyRows } = await supabase
    .from("categories")
    .select("name, slug, sort_order, is_active")
    .eq("parent_id", parent.id);

  if (!legacyRows?.length) return 0;

  const { data: existing } = await supabase
    .from("product_subcategories")
    .select("slug")
    .eq("parent_category", T40_PARENT);

  const existingSlugs = new Set((existing ?? []).map((r) => r.slug));
  const toInsert = legacyRows.filter((row) => !existingSlugs.has(row.slug));

  if (!toInsert.length) return 0;

  const { error } = await supabase.from("product_subcategories").insert(
    toInsert.map((row) => ({
      parent_category: T40_PARENT,
      name: row.name,
      slug: row.slug,
      sort_order: row.sort_order ?? 0,
      is_active: row.is_active ?? true,
    }))
  );

  if (error) throw new Error(formatSubcategoryError(error));
  return toInsert.length;
}

/** @deprecated use syncT40SubcategoriesFromCategories */
export async function syncT40SubcategoriesFromSources(): Promise<void> {
  await syncT40SubcategoriesFromCategories();
}
