import { notFound } from "next/navigation";
import ProductBarcodePrint from "@/components/admin/ProductBarcodePrint";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAbsoluteProductUrl } from "@/lib/products/storeUrl";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("name").eq("id", id).maybeSingle();
  return {
    title: data ? `Barcode — ${data.name} | T40 Admin` : "Product barcode | T40 Admin",
  };
}

export default async function ProductBarcodePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from("products").select("id, name, slug").eq("id", id).maybeSingle();

  if (!data) notFound();

  const productUrl = getAbsoluteProductUrl(data);

  return (
    <ProductBarcodePrint
      productName={data.name}
      productSlug={data.slug}
      productUrl={productUrl}
    />
  );
}
