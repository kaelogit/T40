import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGiftSetItemIds, syncGiftSetItems } from "@/lib/products/giftSets";

type Props = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: source, error: fetchError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  if (!source) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const suffix = crypto.randomUUID().slice(0, 8);
  const baseSlug = (source.slug ?? "product").replace(/-copy-[a-f0-9]{8}$/i, "");
  const newSlug = `${baseSlug}-copy-${suffix}`;

  const { id: _id, created_at: _ca, ...row } = source;

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      ...row,
      name: `${source.name} (Copy)`,
      slug: newSlug,
    })
    .select("id, slug, name")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Could not generate a unique slug." }, { status: 400 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("label, price, sale_price, low_stock_threshold, sort_order, is_default")
    .eq("product_id", id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (variants?.length) {
    await supabase.from("product_variants").insert(
      variants.map((v) => ({
        product_id: product.id,
        label: v.label,
        price: v.price,
        sale_price: v.sale_price,
        stock_quantity: null,
        low_stock_threshold: v.low_stock_threshold,
        sort_order: v.sort_order,
        is_default: v.is_default,
        is_active: true,
      }))
    );
  }

  if (source.category === "gift-sets" || source.product_type === "gift_set") {
    const giftIds = await getGiftSetItemIds(id);
    if (giftIds.length) {
      await syncGiftSetItems(product.id, giftIds);
    }
  }

  return NextResponse.json({ product });
}
