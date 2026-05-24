import type { SupabaseClient } from "@supabase/supabase-js";

/** Same logic as `expire_flash_sales()` in migrations — used when RPC is not deployed yet. */
async function expireFlashSalesFallback(supabase: SupabaseClient) {
  const now = new Date().toISOString();

  const { data: expired, error: fetchError } = await supabase
    .from("products")
    .select("id, badge")
    .eq("on_sale", true)
    .not("sale_ends_at", "is", null)
    .lte("sale_ends_at", now);

  if (fetchError) throw new Error(fetchError.message);
  if (!expired?.length) return 0;

  const ids = expired.map((p) => p.id);

  const { error: variantError } = await supabase
    .from("product_variants")
    .update({ sale_price: null })
    .in("product_id", ids);

  if (variantError) throw new Error(variantError.message);

  const flashIds = expired.filter((p) => p.badge === "FLASH SALE").map((p) => p.id);
  const otherIds = expired.filter((p) => p.badge !== "FLASH SALE").map((p) => p.id);

  if (flashIds.length) {
    const { error } = await supabase
      .from("products")
      .update({ on_sale: false, sale_price: null, badge: null })
      .in("id", flashIds);
    if (error) throw new Error(error.message);
  }

  if (otherIds.length) {
    const { error } = await supabase
      .from("products")
      .update({ on_sale: false, sale_price: null })
      .in("id", otherIds);
    if (error) throw new Error(error.message);
  }

  return expired.length;
}

export async function expireFlashSales(supabase: SupabaseClient) {
  const { error } = await supabase.rpc("expire_flash_sales");

  if (!error) return { affected: null as number | null, usedFallback: false };

  if (error.code !== "PGRST202") {
    throw new Error(error.message);
  }

  const affected = await expireFlashSalesFallback(supabase);
  return { affected, usedFallback: true };
}
