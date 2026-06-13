import type { ProductDetail } from "@/types/product";
import { isSaleActive } from "@/lib/products/sale";
import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";
import {
  effectiveProductUnitPrice,
  effectiveVariantUnitPrice,
  getEffectiveSaleState,
} from "@/lib/sales/effectivePricing";

export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
};

export type PricingMode = "single" | "multi";

export type VariantFormInput = {
  id?: string;
  label: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number;
  is_default: boolean;
};

export type VariantRow = {
  id: string;
  product_id: string;
  label: string;
  price: number | string;
  sale_price: number | string | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
};

export function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    product_id: row.product_id,
    label: row.label ?? "",
    price: Number(row.price),
    sale_price: row.sale_price != null ? Number(row.sale_price) : null,
    stock_quantity: row.stock_quantity,
    low_stock_threshold: row.low_stock_threshold ?? 5,
    sort_order: row.sort_order,
    is_default: row.is_default,
    is_active: row.is_active,
  };
}

export function getActiveVariants(product: { variants?: ProductVariant[] }): ProductVariant[] {
  return (product.variants ?? []).filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order);
}

export function getDefaultVariant(variants: ProductVariant[]): ProductVariant | null {
  const active = variants.filter((v) => v.is_active);
  if (!active.length) return null;
  return active.find((v) => v.is_default) ?? active[0];
}

/** Parse ml number from labels like "50 ml", "100ml" */
export function parseMlFromLabel(label: string): number | null {
  const match = label.trim().match(/(\d+(?:\.\d+)?)\s*ml/i);
  return match ? Number(match[1]) : null;
}

/** Storefront prefix e.g. 100ML — null when label has no ml */
export function formatMlPrefix(label: string): string | null {
  const ml = parseMlFromLabel(label);
  if (ml == null) return null;
  const n = Number.isInteger(ml) ? ml : ml;
  return `${n}ML`;
}

/**
 * Variant used on product cards + quick add: highest ml when sizes exist,
 * otherwise the single variant or admin default.
 */
export function getCardVariant(variants: ProductVariant[]): ProductVariant | null {
  const active = getActiveVariants({ variants });
  if (!active.length) return null;
  if (active.length === 1) return active[0];

  const withMl = active
    .map((v) => ({ v, ml: parseMlFromLabel(v.label) }))
    .filter((x): x is { v: ProductVariant; ml: number } => x.ml != null);

  if (withMl.length) {
    return withMl.reduce((best, cur) => (cur.ml > best.ml ? cur : best)).v;
  }

  return getDefaultVariant(active) ?? active[0];
}

export function variantEffectivePrice(
  variant: ProductVariant,
  productOnSale: boolean,
  generalSale?: GeneralFlashSaleContent | null,
  product?: SaleProductForPricing
): number {
  if (generalSale && product) {
    return effectiveVariantUnitPrice(variant, product, generalSale).price;
  }
  if (productOnSale && variant.sale_price != null && variant.sale_price > 0) {
    return variant.sale_price;
  }
  return variant.price;
}

type SaleProductForPricing = {
  price: number;
  sale_price?: number | null;
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
  category?: string | null;
  product_type?: string | null;
};

export function variantCompareAtPrice(
  variant: ProductVariant,
  productOnSale: boolean,
  effectivePrice: number,
  generalSale?: GeneralFlashSaleContent | null,
  product?: SaleProductForPricing
): number | null {
  if (generalSale && product) {
    return effectiveVariantUnitPrice(variant, product, generalSale).compareAt;
  }
  if (productOnSale && variant.sale_price != null && variant.sale_price > 0 && effectivePrice < variant.price) {
    return variant.price;
  }
  return effectivePrice < variant.price ? variant.price : null;
}

export function variantInStock(
  _variant: ProductVariant,
  product?: { in_stock?: boolean | null; stock_quantity?: number | null }
): boolean {
  if (product?.stock_quantity != null) {
    return product.stock_quantity > 0;
  }
  return product?.in_stock !== false;
}

export function variantIsLowStock(
  _variant: ProductVariant,
  product?: { stock_quantity?: number | null; low_stock_threshold?: number | null }
): boolean {
  if (product?.stock_quantity == null) return false;
  const threshold = product.low_stock_threshold ?? 5;
  const qty = product.stock_quantity;
  return qty > 0 && qty <= threshold;
}

export function lineDisplayName(productName: string, variantLabel: string): string {
  const label = variantLabel.trim();
  return label ? `${productName} (${label})` : productName;
}

export function hasMultipleSizes(variants: ProductVariant[]): boolean {
  const active = getActiveVariants({ variants });
  return active.length > 1;
}

export function cardPriceLabel(
  product: ProductDetail,
  generalSale?: GeneralFlashSaleContent | null
): {
  price: number;
  compareAt: number | null;
  mlPrefix: string | null;
  cardVariant: ProductVariant | null;
} {
  const variants = getActiveVariants(product);
  const onSale = generalSale
    ? getEffectiveSaleState(product, generalSale).active
    : isSaleActive(product);

  const cardVariant = variants.length ? getCardVariant(variants) : null;

  if (!cardVariant) {
    if (generalSale) {
      const { price, compareAt } = effectiveProductUnitPrice(product, generalSale);
      return { price, compareAt, mlPrefix: null, cardVariant: null };
    }
    const price = onSale && product.sale_price ? product.sale_price : product.price;
    return { price, compareAt: null, mlPrefix: null, cardVariant: null };
  }

  const price = variantEffectivePrice(cardVariant, onSale, generalSale, product);
  const compareAt = variantCompareAtPrice(cardVariant, onSale, price, generalSale, product);

  return {
    price,
    compareAt,
    mlPrefix: formatMlPrefix(cardVariant.label),
    cardVariant,
  };
}

export function mapDbVariants(rows: Record<string, unknown>[]): ProductVariant[] {
  return rows.map((row) =>
    mapVariant({
      id: row.id as string,
      product_id: row.product_id as string,
      label: (row.label as string) ?? "",
      price: row.price as number | string,
      sale_price: row.sale_price as number | string | null,
      stock_quantity: row.stock_quantity as number | null,
      low_stock_threshold: row.low_stock_threshold as number | null,
      sort_order: (row.sort_order as number) ?? 0,
      is_default: Boolean(row.is_default),
      is_active: row.is_active !== false,
    })
  );
}

export async function loadVariantsMap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  productIds: string[]
): Promise<Map<string, ProductVariant[]>> {
  const map = new Map<string, ProductVariant[]>();
  if (!productIds.length) return map;

  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  for (const row of (data as VariantRow[]) ?? []) {
    const variant = mapVariant(row);
    const list = map.get(variant.product_id) ?? [];
    list.push(variant);
    map.set(variant.product_id, list);
  }
  return map;
}

export function attachVariantsToProduct(product: ProductDetail, variants: ProductVariant[]): ProductDetail {
  product.variants = variants;
  const cardV = getCardVariant(variants);
  if (cardV) {
    product.price = cardV.price;
    product.sale_price = cardV.sale_price ?? undefined;
    product.defaultVariant = cardV;
  }
  return product;
}

export async function enrichProductsWithVariantsClient(
  products: ProductDetail[],
  supabase: Parameters<typeof loadVariantsMap>[0]
): Promise<ProductDetail[]> {
  if (!products.length) return products;
  const map = await loadVariantsMap(supabase, products.map((p) => p.id));
  return products.map((p) => attachVariantsToProduct(p, map.get(p.id) ?? []));
}

/** Legacy cart lines: `{productId}::{sizeLabel}` (sizeLabel may be empty for single-size products). */
export function parseLegacyCartLineId(id: string): { productId: string; sizeLabel: string } | null {
  const sep = id.indexOf("::");
  if (sep <= 0) return null;
  const productId = id.slice(0, sep);
  if (!productId) return null;
  return { productId, sizeLabel: id.slice(sep + 2) };
}
