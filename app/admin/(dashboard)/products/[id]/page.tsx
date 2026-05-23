import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGiftSetItemIds } from "@/lib/products/giftSets";
import { rowToProductFormWithGiftIds } from "@/lib/admin/productForm";

import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("name").eq("id", id).maybeSingle();
  return { title: data ? `Edit ${data.name} | T40 Perfumes` : "Edit Product | T40 Perfumes" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  const isGiftSet = isGiftSetProduct(data);

  const giftSetProductIds = isGiftSet ? await getGiftSetItemIds(id) : [];

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">
        {isGiftSet ? "Edit gift set" : "Edit product"}
      </h1>
      <ProductForm
        productId={id}
        initial={rowToProductFormWithGiftIds(data, giftSetProductIds)}
      />
    </div>
  );
}
