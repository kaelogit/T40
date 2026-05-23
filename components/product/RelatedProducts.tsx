import ProductCard from "@/components/product/ProductCard";
import type { ProductDetail } from "@/types/product";

type Props = {
  products: ProductDetail[];
};

export default function RelatedProducts({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-neutral-100 pt-16 mt-16">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
        You may also like
      </p>
      <h2 className="text-2xl md:text-3xl font-black text-t40-black uppercase tracking-tighter font-heading mb-10">
        Related fragrances
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
