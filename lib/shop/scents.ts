import type { SupabaseClient } from "@supabase/supabase-js";
import type { FilterOption } from "./loadFilterOptions";
import { brandToSlug } from "./brands";

/** URL-safe slug from admin scent name (same rules as brands). */
export function scentToSlug(name: string): string {
  return brandToSlug(name);
}

/** Convert a scent slug to patterns that match `products.notes` (spaces or hyphens). */
export function scentSlugToMatchTerms(slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) return [];
  const spaced = trimmed.replace(/-/g, " ");
  return spaced === trimmed ? [trimmed] : [trimmed, spaced];
}

/** PostgREST `.or()` filter for one scent slug against `products.notes` */
export function orFilterForScentSlug(slug: string): string {
  return scentSlugToMatchTerms(slug)
    .map((term) => `notes.ilike.%${term}%`)
    .join(",");
}

/** Match products tagged with any known scent family — used for `/shop/scent` hub */
export function orFilterForAllScents(scentSlugs?: string[]): string {
  const slugs =
    scentSlugs?.length ? scentSlugs : DEFAULT_SCENT_FILTER_OPTIONS.map((opt) => opt.value);
  const clauses = new Set<string>();
  for (const slug of slugs) {
    for (const term of scentSlugToMatchTerms(slug)) {
      clauses.add(`notes.ilike.%${term}%`);
    }
  }
  return Array.from(clauses).join(",");
}

/** Built-in fallback when `scents` table is empty or unreachable */
export const DEFAULT_SCENT_FILTER_OPTIONS: FilterOption[] = [
  { label: "Floral", value: "floral" },
  { label: "Woody & Earthy", value: "woody-earthy" },
  { label: "Fresh & Citrus", value: "fresh-citrus" },
  { label: "Amber & Spice", value: "amber-spice" },
  { label: "Gourmand (Sweet)", value: "gourmand" },
  { label: "Oud & Leather", value: "oud-leather" },
  { label: "Aquatic", value: "aquatic" },
  { label: "Musk", value: "musk" },
  { label: "Aromatic", value: "aromatic" },
];

/** @deprecated use loadScentOptions() — kept for static imports during migration */
export const SCENT_FILTER_OPTIONS = DEFAULT_SCENT_FILTER_OPTIONS;

export function scentSlugsToNotes(slugs: string[]): string | null {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (!unique.length) return null;
  return unique.map((slug) => slug.replace(/-/g, " ")).join(" ");
}

/** Legacy single-scent parse from products.notes */
export function notesToScentSlug(notes: string | null | undefined): string {
  if (!notes?.trim()) return "";
  return notes.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * Scents for filters & nav:
 * 1. Active rows from `scents` table
 * 2. Fallback to built-in defaults if table empty
 */
export async function loadScentOptions(supabase: SupabaseClient): Promise<FilterOption[]> {
  const bySlug = new Map<string, string>();

  const { data: adminRows, error } = await supabase
    .from("scents")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (!error && adminRows?.length) {
    for (const row of adminRows) {
      const name = row.name?.trim();
      const slug = row.slug?.trim() || (name ? scentToSlug(name) : "");
      if (name && slug) bySlug.set(slug, name);
    }
  }

  if (!bySlug.size) {
    for (const opt of DEFAULT_SCENT_FILTER_OPTIONS) {
      bySlug.set(opt.value, opt.label);
    }
  }

  return Array.from(bySlug.entries()).map(([value, label]) => ({ value, label }));
}

/** Navbar / shop-by-scent links */
export function buildScentNavLinks(options: FilterOption[]) {
  return options.map((s) => ({
    label: s.label,
    href: `/shop/scent/${s.value}`,
  }));
}

/** @deprecated use buildScentNavLinks(loadScentOptions(...)) */
export const SCENT_NAV_LINKS = buildScentNavLinks(DEFAULT_SCENT_FILTER_OPTIONS);
