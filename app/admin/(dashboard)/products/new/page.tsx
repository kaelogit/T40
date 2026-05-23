import ProductForm from "@/components/admin/ProductForm";
import type { ProductFormInput } from "@/lib/admin/productForm";

export const metadata = { title: "New Product | T40 Perfumes" };

type Props = { searchParams: Promise<{ type?: string }> };

const giftSetInitial: Partial<ProductFormInput> = {
  category: "gift-sets",
  brand: "T40 Perfumes",
  pricingMode: "single",
  placement: "none",
  flash_sale: false,
  scentSlug: "",
  occasion: null,
  giftSetProductIds: [],
  variants: [
    {
      label: "",
      price: 0,
      sale_price: null,
      stock_quantity: null,
      low_stock_threshold: 5,
      is_default: true,
    },
  ],
};

export default async function NewProductPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const isGiftSet = type === "gift-set";

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">
        {isGiftSet ? "New gift set" : "New product"}
      </h1>
      <ProductForm initial={isGiftSet ? (giftSetInitial as ProductFormInput) : undefined} />
    </div>
  );
}
