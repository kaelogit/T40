import type { FilterOption } from "./loadFilterOptions";

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
export function orFilterForAllScents(): string {
  const clauses = new Set<string>();
  for (const opt of SCENT_FILTER_OPTIONS) {
    for (const term of scentSlugToMatchTerms(opt.value)) {
      clauses.add(`notes.ilike.%${term}%`);
    }
  }
  return Array.from(clauses).join(",");
}

/** Fixed scent families — not loaded from the database */
export const SCENT_FILTER_OPTIONS: FilterOption[] = [
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

/** Navbar / shop-by-scent links */
export const SCENT_NAV_LINKS = SCENT_FILTER_OPTIONS.map((s) => ({
  label: s.label,
  href: `/shop/scent/${s.value}`,
}));
