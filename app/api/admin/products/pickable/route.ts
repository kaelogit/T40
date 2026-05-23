import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";

/** Individual perfumes available to include in a gift set (excludes bundles). */
export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const excludeId = new URL(request.url).searchParams.get("exclude")?.trim() || null;

  const supabase = createAdminClient();

  const [{ data: products, error }, { data: giftSetLinks }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, brand, category, product_type, price, images")
      .order("name", { ascending: true }),
    supabase.from("gift_set_items").select("gift_set_id"),
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const giftSetParentIds = new Set((giftSetLinks ?? []).map((row) => row.gift_set_id));

  const pickable = (products ?? []).filter((p) => {
    if (excludeId && p.id === excludeId) return false;
    if (isGiftSetProduct(p)) return false;
    if (giftSetParentIds.has(p.id)) return false;
    return true;
  });

  return NextResponse.json({ products: pickable });
}
