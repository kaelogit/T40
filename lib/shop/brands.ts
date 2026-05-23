import type { SupabaseClient } from "@supabase/supabase-js";
import type { FilterOption } from "./loadFilterOptions";

/** URL-safe slug from a product/admin brand name */
export function brandToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildBrandSlugMap(options: FilterOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

export function resolveBrandNames(
  slugs: string[],
  slugToName: Record<string, string>
): string[] {
  return slugs.map((slug) => slugToName[slug] ?? slug);
}

/**
 * Brands for filters & nav:
 * 1. Active rows from `brands` table (admin inventory, when present)
 * 2. Distinct `products.brand` values not already listed
 */
export async function loadBrandOptions(
  supabase: SupabaseClient
): Promise<FilterOption[]> {
  const bySlug = new Map<string, string>();

  const { data: adminRows, error: adminError } = await supabase
    .from("brands")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!adminError && adminRows?.length) {
    for (const row of adminRows) {
      const name = row.name?.trim();
      const slug = row.slug?.trim() || (name ? brandToSlug(name) : "");
      if (name && slug) bySlug.set(slug, name);
    }
  }

  const { data: productRows } = await supabase
    .from("products")
    .select("brand")
    .not("brand", "is", null);

  if (productRows?.length) {
    for (const row of productRows) {
      const name = (row.brand as string | null)?.trim();
      if (!name) continue;
      const slug = brandToSlug(name);
      if (!bySlug.has(slug)) bySlug.set(slug, name);
    }
  }

  return Array.from(bySlug.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
