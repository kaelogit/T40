import {
  PRODUCT_CATEGORY_OPTIONS,
  categoryHasSubcategories,
} from "@/lib/catalog/productCategories";
import { DEFAULT_SCENT_FILTER_OPTIONS, scentSlugsToNotes } from "@/lib/shop/scents";
import type { ProductVariant, VariantFormInput, PricingMode } from "@/lib/products/variants";

export { PRODUCT_CATEGORY_OPTIONS, categoryHasSubcategories };
export type { VariantFormInput, PricingMode };

/** @deprecated use product_subcategories table — kept for seed reference */
export const T40_SUBCATEGORY_OPTIONS = [
  { label: "Travel Companions", value: "travel-companions" },
  { label: "Feminine Fragrance", value: "feminine-fragrance" },
  { label: "Hair Perfume", value: "hair-perfume" },
  { label: "Oud Perfume", value: "oud-perfume" },
] as const;

export const OCCASION_OPTIONS = [
  { label: "Everyday", value: "everyday" },
  { label: "Office", value: "office" },
  { label: "Evening", value: "evening" },
  { label: "Date Night", value: "date" },
] as const;

export const SCENT_OPTIONS = DEFAULT_SCENT_FILTER_OPTIONS;

/** House brand stored on gift set rows — not chosen in admin. */
export const GIFT_SET_DEFAULT_BRAND = "T40 Perfumes";

export type MerchandisingPlacement = "none" | "new-arrival" | "best-seller" | "trending";

/** Minimum product / gift set description length (admin + validation). */
export const MIN_PRODUCT_DESCRIPTION_LENGTH = 200;

export type ProductFormInput = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory: string | null;
  scentSlugs: string[];
  occasion: string | null;
  description: string | null;
  pricingMode: PricingMode;
  variants: VariantFormInput[];
  in_stock: boolean;
  /** null = manual in/out only; number = tracked inventory */
  stock_quantity: number | null;
  low_stock_threshold: number;
  placement: MerchandisingPlacement;
  flash_sale: boolean;
  flash_sale_days: number;
  images: string[];
  /** Product IDs included when category is gift-sets */
  giftSetProductIds: string[];
};

export function scentSlugToNotes(slug: string): string {
  return slug.trim().replace(/-/g, " ");
}

/** @deprecated use notesToScentSlug from lib/shop/scents */
export function notesToScentSlug(notes: string | null | undefined): string {
  if (!notes?.trim()) return "";
  return notes.trim().toLowerCase().replace(/\s+/g, "-");
}

export function derivePlacementFromProduct(row: {
  badge: string | null;
  is_new_arrival?: boolean | null;
}): MerchandisingPlacement {
  if (row.badge === "NEW" || row.is_new_arrival) return "new-arrival";
  if (row.badge === "BEST SELLER") return "best-seller";
  if (row.badge === "TRENDING") return "trending";
  return "none";
}

export function applyMerchandising(input: Pick<
  ProductFormInput,
  "placement" | "flash_sale" | "flash_sale_days" | "variants"
>) {
  let badge: string | null = null;
  let is_new_arrival = false;

  switch (input.placement) {
    case "new-arrival":
      badge = "NEW";
      is_new_arrival = true;
      break;
    case "best-seller":
      badge = "BEST SELLER";
      break;
    case "trending":
      badge = "TRENDING";
      break;
    default:
      break;
  }

  const on_sale = input.flash_sale;
  const defaultVariant = input.variants.find((v) => v.is_default) ?? input.variants[0];
  const sale_price =
    input.flash_sale && defaultVariant?.sale_price != null ? defaultVariant.sale_price : null;
  let sale_ends_at: string | null = null;

  if (input.flash_sale) {
    const days = Math.max(1, input.flash_sale_days || 7);
    sale_ends_at = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  return { badge, is_new_arrival, on_sale, sale_price, sale_ends_at };
}

export function productFormToRow(input: ProductFormInput) {
  const isGiftSet = input.category === "gift-sets";
  const merch = isGiftSet
    ? {
        badge: null,
        is_new_arrival: false,
        on_sale: false,
        sale_price: null,
        sale_ends_at: null,
      }
    : applyMerchandising(input);
  const defaultVariant = input.variants.find((v) => v.is_default) ?? input.variants[0];
  const tracked = input.stock_quantity != null;
  const in_stock = tracked ? input.stock_quantity! > 0 : input.in_stock;

  return {
    name: input.name.trim(),
    slug: input.slug.trim(),
    brand: isGiftSet ? GIFT_SET_DEFAULT_BRAND : input.brand.trim(),
    category: input.category,
    subcategory: isGiftSet ? "gift-sets" : input.subcategory?.trim() || null,
    product_type: isGiftSet ? "gift_set" : "single",
    notes: isGiftSet ? null : scentSlugsToNotes(input.scentSlugs),
    occasion: isGiftSet ? null : input.occasion || null,
    price: defaultVariant?.price ?? 0,
    description: input.description?.trim() || null,
    in_stock,
    stock_quantity: tracked ? input.stock_quantity : null,
    low_stock_threshold: input.low_stock_threshold || 5,
    badge: merch.badge,
    is_new_arrival: merch.is_new_arrival,
    on_sale: merch.on_sale,
    sale_price: merch.sale_price,
    sale_ends_at: merch.sale_ends_at,
    is_drop: false,
    release_date: null,
    early_access_price: null,
    top_notes: [],
    heart_notes: [],
    base_notes: [],
    images: input.images.slice(0, 4),
  };
}

export function getProductFormErrors(
  input: ProductFormInput & { newScentName?: string }
): string[] {
  const errors: string[] = [];
  const isGiftSet = input.category === "gift-sets";

  if (!input.name.trim()) errors.push("Product name is required.");
  if (!input.slug.trim()) errors.push("Slug is required.");
  if (!isGiftSet && !input.brand.trim()) errors.push("Brand is required.");
  if (!input.category) errors.push("Category is required.");

  if (!input.description?.trim()) {
    errors.push("Product description is required.");
  } else if (input.description.trim().length < MIN_PRODUCT_DESCRIPTION_LENGTH) {
    errors.push(
      `Description must be at least ${MIN_PRODUCT_DESCRIPTION_LENGTH} characters.`
    );
  }

  if (input.category === "t40-exclusives" && !input.subcategory) {
    errors.push("Subcategory is required for T40 Exclusives.");
  }
  if (
    categoryHasSubcategories(input.category) &&
    input.category !== "t40-exclusives" &&
    !input.subcategory
  ) {
    errors.push("Subcategory is required for this category.");
  }

  if (isGiftSet) {
    if (input.giftSetProductIds.length < 2) {
      errors.push("Gift sets must include at least 2 perfumes.");
    }
  } else {
    if (!input.scentSlugs?.length && !input.newScentName?.trim()) {
      errors.push("Select at least one scent profile.");
    }
    if (!input.occasion?.trim()) errors.push("Occasion is required.");
  }

  if (input.stock_quantity != null && input.stock_quantity < 0) {
    errors.push("Stock quantity cannot be negative.");
  }

  if (!input.variants.length) {
    errors.push("At least one price variant is required.");
  } else {
    for (const v of input.variants) {
      if (v.price <= 0) {
        errors.push(
          isGiftSet
            ? "Gift set price must be greater than zero."
            : "Each size must have a price greater than zero."
        );
        break;
      }
      if (!isGiftSet && input.flash_sale && v.sale_price != null) {
        if (v.sale_price <= 0) {
          errors.push("Sale price must be greater than zero.");
          break;
        }
        if (v.sale_price >= v.price) {
          errors.push("Sale price must be less than the regular price.");
          break;
        }
      }
    }
  }

  if (!isGiftSet && input.pricingMode === "multi") {
    if (input.variants.length < 1) errors.push("Add at least one size.");
    const labels = input.variants.map((v) => v.label.trim()).filter(Boolean);
    if (labels.length !== input.variants.length) {
      errors.push("Each size needs a label (e.g. 30 ml, 50 ml).");
    } else if (new Set(labels).size !== labels.length) {
      errors.push("Size labels must be unique.");
    }
  }

  if (!isGiftSet && input.flash_sale) {
    const hasValidSale = input.variants.some(
      (v) =>
        v.sale_price != null &&
        v.sale_price > 0 &&
        v.price > 0 &&
        v.sale_price < v.price
    );
    if (!hasValidSale) {
      errors.push(
        "Flash sale: set at least one sale price lower than the regular price."
      );
    }
  }

  if (input.images.length === 0) errors.push("At least one product image is required.");
  if (input.images.length > 4) errors.push("Maximum 4 images allowed.");

  return errors;
}

export function validateProductForm(input: ProductFormInput): string | null {
  const errors = getProductFormErrors(input);
  return errors[0] ?? null;
}

export function rowToProductForm(
  row: Record<string, unknown>,
  scentSlugs: string[] = []
): ProductFormInput {
  const placement = derivePlacementFromProduct({
    badge: row.badge as string | null,
    is_new_arrival: row.is_new_arrival as boolean | null,
  });

  const onSale = Boolean(row.on_sale);
  let flash_sale_days = 7;
  if (onSale && row.sale_ends_at) {
    const ms = new Date(row.sale_ends_at as string).getTime() - Date.now();
    flash_sale_days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  }

  return {
    name: (row.name as string) ?? "",
    slug: (row.slug as string) ?? "",
    brand: (row.brand as string) ?? "",
    category: (row.category as string) ?? "unisex",
    subcategory: (row.subcategory as string | null) ?? null,
    scentSlugs:
      scentSlugs.length > 0
        ? scentSlugs
        : notesToScentSlug(row.notes as string)
          ? [notesToScentSlug(row.notes as string)]
          : [],
    occasion: (row.occasion as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    pricingMode: "single",
    variants: [
      {
        label: "",
        price: Number(row.price) || 0,
        sale_price: row.sale_price != null ? Number(row.sale_price) : null,
        stock_quantity: null,
        low_stock_threshold: 5,
        is_default: true,
      },
    ],
    in_stock: row.in_stock !== false,
    stock_quantity: row.stock_quantity != null ? Number(row.stock_quantity) : null,
    low_stock_threshold: Number(row.low_stock_threshold) || 5,
    placement,
    flash_sale: onSale,
    flash_sale_days,
    images: ((row.images as string[]) ?? []).slice(0, 4),
    giftSetProductIds: [],
  };
}

export function rowToProductFormWithGiftIds(
  row: Record<string, unknown>,
  giftSetProductIds: string[],
  dbVariants?: ProductVariant[],
  scentSlugs: string[] = []
): ProductFormInput {
  const base = rowToProductForm(row, scentSlugs);
  const isGiftSet = row.category === "gift-sets" || row.product_type === "gift_set";

  if (!dbVariants?.length) {
    return { ...base, giftSetProductIds };
  }

  if (isGiftSet) {
    const defaultVariant = dbVariants.find((v) => v.is_default) ?? dbVariants[0];
    return {
      ...base,
      pricingMode: "single",
      variants: [
        {
          id: defaultVariant.id,
          label: "",
          price: defaultVariant.price || Number(row.price) || 0,
          sale_price: defaultVariant.sale_price,
          stock_quantity: defaultVariant.stock_quantity,
          low_stock_threshold: defaultVariant.low_stock_threshold,
          is_default: true,
        },
      ],
      giftSetProductIds,
    };
  }

  const variants: VariantFormInput[] = dbVariants.map((v) => ({
    id: v.id,
    label: v.label,
    price: v.price,
    sale_price: v.sale_price,
    stock_quantity: v.stock_quantity,
    low_stock_threshold: v.low_stock_threshold,
    is_default: v.is_default,
  }));

  const pricingMode: PricingMode = variants.length > 1 ? "multi" : "single";

  return {
    ...base,
    pricingMode,
    variants,
    giftSetProductIds,
  };
}
