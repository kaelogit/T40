import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandToSlug } from "@/lib/shop/brands";
import { syncGiftSetItems } from "@/lib/products/giftSets";
import { syncProductVariants } from "@/lib/products/variants.admin";
import {
  productFormToRow,
  validateProductForm,
  type ProductFormInput,
} from "@/lib/admin/productForm";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, brand, category, product_type, price, sale_price, on_sale, badge, in_stock, stock_quantity, low_stock_threshold, images, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as ProductFormInput & { newBrandName?: string };
    const validationError = validateProductForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (body.newBrandName?.trim()) {
      const name = body.newBrandName.trim();
      await supabase.from("brands").upsert(
        {
          name,
          slug: brandToSlug(name),
          is_active: true,
        },
        { onConflict: "slug" }
      );
    }

    const row = productFormToRow(body);

    const { data, error } = await supabase
      .from("products")
      .insert(row)
      .select("id, slug")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this slug already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (body.category === "gift-sets" && body.giftSetProductIds?.length) {
      try {
        await syncGiftSetItems(data.id, body.giftSetProductIds);
      } catch (syncError) {
        await supabase.from("products").delete().eq("id", data.id);
        const message =
          syncError instanceof Error ? syncError.message : "Failed to save gift set perfumes.";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    await syncProductVariants(data.id, body.variants, { onSale: body.flash_sale });

    return NextResponse.json({ product: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
