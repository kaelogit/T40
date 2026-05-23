import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "./urls";
import { normalizeProduct } from "./normalize";
import { getGiftSetContents } from "./giftSets";
import { attachVariantsToProduct } from "./variants";
import { enrichProductsWithVariants, getVariantsForProduct } from "./variants.server";
import type { ProductDetail } from "@/types/product";

async function loadGiftSetBundleItems(productId: string) {
  // gift_set_items is admin-written; service role avoids RLS gaps on the storefront.
  if (hasAdminClient()) {
    return getGiftSetContents(createAdminClient(), productId);
  }
  const supabase = await createClient();
  return getGiftSetContents(supabase, productId);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data: bySlug } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (bySlug) {
    const product = normalizeProduct(bySlug);
    const variants = await getVariantsForProduct(product.id);
    attachVariantsToProduct(product, variants);
    if (product.product_type === "gift_set" || bySlug.category === "gift-sets") {
      product.bundleItems = await loadGiftSetBundleItems(product.id);
    }
    return product;
  }

  if (isUuid(slug)) {
    const { data: byId } = await supabase
      .from("products")
      .select("*")
      .eq("id", slug)
      .maybeSingle();
    if (byId) {
      const product = normalizeProduct(byId);
      const variants = await getVariantsForProduct(product.id);
      attachVariantsToProduct(product, variants);
      if (product.product_type === "gift_set" || byId.category === "gift-sets") {
        product.bundleItems = await loadGiftSetBundleItems(product.id);
      }
      return product;
    }
  }

  return null;
}

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4
): Promise<ProductDetail[]> {
  const supabase = await createClient();

  let query = supabase.from("products").select("*").neq("id", product.id).limit(limit);

  if (product.brand) {
    query = query.eq("brand", product.brand);
  } else if (product.category) {
    query = query.eq("category", product.category);
  }

  const { data } = await query;
  const products = (data ?? []).map(normalizeProduct);
  return enrichProductsWithVariants(products);
}
