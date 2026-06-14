/** Who the fragrance is for — used for T40 Exclusives in gender shop filters. */
export const AUDIENCE_SLUGS = ["women", "men", "unisex"] as const;
export type AudienceSlug = (typeof AUDIENCE_SLUGS)[number];

export const GENDER_CATEGORY_SLUGS = new Set<string>(AUDIENCE_SLUGS);

export const AUDIENCE_OPTIONS = [
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
  { label: "Unisex", value: "unisex" },
] as const;

export function isGenderCategory(slug: string | null | undefined): slug is AudienceSlug {
  return Boolean(slug && GENDER_CATEGORY_SLUGS.has(slug));
}

/** Persisted `products.audience` — mirrors category for women/men/unisex rows. */
export function resolveProductAudience(
  category: string,
  audience: string | null | undefined
): string | null {
  if (category === "gift-sets") return null;
  if (isGenderCategory(category)) return category;
  if (audience && isGenderCategory(audience)) return audience;
  return "unisex";
}

/** Supabase `.or()` filter: gender shop pages include matching T40 exclusives. */
export function genderCategoryOrFilter(gender: AudienceSlug): string {
  if (gender === "women") {
    return `category.eq.women,and(category.eq.t40-exclusives,audience.in.(women,unisex))`;
  }
  if (gender === "men") {
    return `category.eq.men,and(category.eq.t40-exclusives,audience.in.(men,unisex))`;
  }
  return `category.eq.unisex,and(category.eq.t40-exclusives,audience.in.(unisex,women,men))`;
}

export function productMatchesGenderFilter(
  product: { category?: string | null; audience?: string | null },
  gender: string
): boolean {
  if (!isGenderCategory(gender)) return true;
  if (product.category === gender) return true;
  const audience = product.audience ?? null;
  if (product.category === "t40-exclusives") {
    if (!audience) return true;
    if (gender === "unisex") return true;
    return audience === gender || audience === "unisex";
  }
  return false;
}
