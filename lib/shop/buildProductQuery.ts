import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveBrandNames } from "./brands";
import { parseShopSlug, type ShopPathFilters } from "./resolveShopPath";
import {
  DEFAULT_T40_SUBCATEGORY_SLUGS,
  T40_PARENT_SLUG,
} from "./t40Exclusives";
import { orFilterForAllScents, orFilterForScentSlug } from "./scents";
import {
  genderCategoryOrFilter,
  isGenderCategory,
} from "@/lib/catalog/audience";
import { activeSaleOrFilter } from "@/lib/products/sale";
import { FLASH_SALE_COLLECTION_SLUG } from "./collections";
import { applyProductSort } from "./applyProductSort";

export const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  "under-50k": { max: 50000 },
  "50k-100k": { min: 50000, max: 100000 },
  "100k-200k": { min: 100000, max: 200000 },
  "above-200k": { min: 200000 },
};

const COLLECTION_TO_BADGE: Record<string, string> = {
  trending: "TRENDING",
  "new-arrivals": "NEW",
  "best-sellers": "BEST SELLER",
};

const COLLECTION_TO_CATEGORY: Record<string, string> = {
  "gift-sets": "gift-sets",
};

export type ShopQueryFilters = ShopPathFilters & {
  price?: string;
  brands?: string[];
  noteTags?: string[];
  occasions?: string[];
  sale?: boolean;
  q?: string;
  sort?: string;
  /** Loaded from categories — used for T40 Exclusives shop view */
  t40SubcategorySlugs?: string[];
  /** All scent slugs for `/shop/scent` hub filtering */
  allScentSlugs?: string[];
  /** When a site-wide flash sale is live, flash-sales collection shows all eligible products */
  generalFlashSaleActive?: boolean;
};

function getPathFilters(pathname: string): ShopPathFilters {
  const prefix = "/shop";
  if (!pathname.startsWith(prefix)) return {};
  const rest = pathname.slice(prefix.length).replace(/^\//, "");
  if (!rest) return {};
  return parseShopSlug(rest.split("/").filter(Boolean));
}

function getQueryFilters(searchParams: URLSearchParams): Partial<ShopQueryFilters> {
  const collection = searchParams.get("collection") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const subcategory = searchParams.get("subcategory") ?? undefined;
  const brand = searchParams.get("brand") ?? searchParams.getAll("brand")[0];
  const noteTags = searchParams.getAll("notes");
  const price = searchParams.get("price") ?? undefined;
  const brands = searchParams.getAll("brand");
  const occasions = searchParams.getAll("occasion");
  const q = searchParams.get("q") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const sale = searchParams.get("sale") === "true";

  return {
    collection,
    category,
    subcategory,
    brand: brand || undefined,
    noteTags: noteTags.length ? noteTags : undefined,
    price,
    brands: brands.length ? brands : undefined,
    occasions: occasions.length ? occasions : undefined,
    q,
    sort,
    sale: sale || undefined,
  };
}

/** Path-based filters are the base; query string overrides the same keys */
export function mergeShopFilters(
  pathname: string,
  searchParams: URLSearchParams
): ShopQueryFilters {
  const path = getPathFilters(pathname);
  const query = getQueryFilters(searchParams);

  const merged: ShopQueryFilters = { ...path };

  if (query.collection) merged.collection = query.collection;
  if (query.category) merged.category = query.category;
  if (query.subcategory) merged.subcategory = query.subcategory;
  if (query.brand) merged.brand = query.brand;
  if (query.noteTags?.length) merged.noteTags = query.noteTags;
  if (query.price) merged.price = query.price;
  if (query.brands?.length) merged.brands = query.brands;
  if (query.occasions?.length) merged.occasions = query.occasions;
  if (query.q) merged.q = query.q;
  if (query.sort) merged.sort = query.sort;
  if (query.sale) merged.sale = query.sale;

  return merged;
}

export function applyShopFiltersToQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: ShopQueryFilters,
  brandSlugToName: Record<string, string> = {}
) {
  let q = query;

  if (filters.sale) {
    const now = new Date().toISOString();
    q = q.eq("on_sale", true).or(activeSaleOrFilter(now));
  }

  if (filters.q?.trim()) {
    q = q.ilike("name", `%${filters.q.trim()}%`);
  }

  const isT40 = filters.category === T40_PARENT_SLUG;

  if (isT40) {
    if (filters.subcategory) {
      // Subcategory slug is the source of truth (e.g. hair-perfume under any primary category)
      q = q.eq("subcategory", filters.subcategory);
    } else {
      const slugs =
        filters.t40SubcategorySlugs?.length
          ? filters.t40SubcategorySlugs
          : [...DEFAULT_T40_SUBCATEGORY_SLUGS];
      if (slugs.length > 0) {
        q = q.or(`category.eq.${T40_PARENT_SLUG},subcategory.in.(${slugs.join(",")})`);
      } else {
        q = q.eq("category", T40_PARENT_SLUG);
      }
    }
  } else if (!filters.scentHub && !filters.scent) {
    if (filters.category && isGenderCategory(filters.category)) {
      q = q.or(genderCategoryOrFilter(filters.category));
    } else if (filters.category) {
      q = q.eq("category", filters.category);
    }
    if (filters.subcategory) {
      q = q.eq("subcategory", filters.subcategory);
    }
  }

  const collection = filters.collection;
  if (collection === FLASH_SALE_COLLECTION_SLUG) {
    if (filters.generalFlashSaleActive) {
      q = q.eq("in_stock", true).neq("category", "gift-sets").neq("product_type", "gift_set");
    } else {
      const now = new Date().toISOString();
      q = q.eq("on_sale", true).or(activeSaleOrFilter(now));
    }
  } else if (collection) {
    const badge = COLLECTION_TO_BADGE[collection];
    const cat = COLLECTION_TO_CATEGORY[collection];
    if (badge) q = q.eq("badge", badge);
    else if (cat) q = q.eq("category", cat);
  }

  const pathBrand = filters.brand;
  if (pathBrand) {
    const [name] = resolveBrandNames([pathBrand], brandSlugToName);
    if (name) q = q.eq("brand", name);
  }

  const brands = filters.brands;
  if (brands?.length) {
    const names = resolveBrandNames(brands, brandSlugToName);
    if (names.length === 1) q = q.eq("brand", names[0]);
    else if (names.length > 1) q = q.in("brand", names);
  }

  if (filters.scentHub) {
    const orString = orFilterForAllScents(filters.allScentSlugs);
    if (orString) q = q.or(orString);
  } else {
    const scentSlugs = [
      ...(filters.scent ? [filters.scent] : []),
      ...(filters.noteTags ?? []),
    ];
    if (scentSlugs.length === 1) {
      q = q.or(orFilterForScentSlug(scentSlugs[0]));
    } else if (scentSlugs.length > 1) {
      const orString = scentSlugs
        .flatMap((slug) => orFilterForScentSlug(slug).split(","))
        .filter(Boolean)
        .join(",");
      if (orString) q = q.or(orString);
    }
  }

  const occasions = filters.occasions;
  if (occasions?.length) {
    q = q.in("occasion", occasions);
  }

  const priceRange = filters.price ? PRICE_RANGES[filters.price] : null;
  if (priceRange?.min) q = q.gte("price", priceRange.min);
  if (priceRange?.max) q = q.lte("price", priceRange.max);

  const sort = filters.sort;
  q = applyProductSort(q, sort);

  return q;
}

export function applyShopFilters(
  supabase: SupabaseClient,
  filters: ShopQueryFilters,
  range: { from: number; to: number },
  brandSlugToName: Record<string, string> = {}
) {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .range(range.from, range.to);

  return applyShopFiltersToQuery(query, filters, brandSlugToName);
}
