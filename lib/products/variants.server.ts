import { createClient } from "@/lib/supabase/server";
import type { ProductDetail } from "@/types/product";
import {
  attachVariantsToProduct,
  loadVariantsMap,
  mapVariant,
  getDefaultVariant,
  type ProductVariant,
} from "./variants";

type VariantRow = Parameters<typeof mapVariant>[0];

export async function getVariantsForProduct(productId: string): Promise<ProductVariant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return ((data as VariantRow[]) ?? []).map(mapVariant);
}

export async function getVariantsForProducts(productIds: string[]): Promise<Map<string, ProductVariant[]>> {
  const supabase = await createClient();
  return loadVariantsMap(supabase, productIds);
}

export async function enrichProductsWithVariants(products: ProductDetail[]): Promise<ProductDetail[]> {
  if (!products.length) return products;
  const map = await getVariantsForProducts(products.map((p) => p.id));
  return products.map((p) => attachVariantsToProduct(p, map.get(p.id) ?? []));
}

export async function getVariantWithProduct(variantId: string) {
  const supabase = await createClient();
  const { data: variant } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .eq("is_active", true)
    .maybeSingle();

  if (!variant) return null;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", (variant as VariantRow).product_id)
    .maybeSingle();

  if (!product) return null;

  return {
    variant: mapVariant(variant as VariantRow),
    product,
  };
}

export async function resolveVariantByLegacyLine(
  productId: string,
  sizeLabel: string
): Promise<ProductVariant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true);

  const variants = ((data as VariantRow[]) ?? []).map(mapVariant);
  const match = variants.find(
    (v) => v.label === sizeLabel || v.label.replace(/\s/g, "") === sizeLabel.replace(/\s/g, "")
  );
  return match ?? getDefaultVariant(variants);
}
