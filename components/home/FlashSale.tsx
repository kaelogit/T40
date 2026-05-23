"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductHref } from "@/lib/products/urls";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import { activeSaleOrFilter, isSaleActive } from "@/lib/products/sale";
import FlashSaleCountdown from "@/components/product/FlashSaleCountdown";
import type { ProductDetail } from "@/types/product";

const supabase = createClient();

type SaleItem = {
  id: string;
  slug: string | null;
  name: string;
  brand: string;
  originalPrice: number;
  salePrice: number;
  image: string;
  link: string;
  saleEndsAt: string;
};

function toSaleItem(p: ProductDetail): SaleItem | null {
  if (!isSaleActive(p)) return null;
  const salePrice = p.sale_price ?? p.price;
  const ends = p.sale_ends_at;
  if (!ends) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand ?? "T40 Perfumes",
    originalPrice: p.price,
    salePrice,
    image:
      p.images[0] ??
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
    link: getProductHref(p),
    saleEndsAt: ends,
  };
}

export default function FlashSale() {
  const [mainItem, setMainItem] = useState<SaleItem | null>(null);
  const [secondaryItems, setSecondaryItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);

    try {
      await fetch("/api/sales/expire", { method: "POST" });
    } catch {
      // Storefront still filters expired sales client-side if DB cleanup fails
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("on_sale", true)
      .or(activeSaleOrFilter(now))
      .order("sale_ends_at", { ascending: true })
      .limit(4);

    if (data && !error && data.length > 0) {
      const normalized = data.map((row) => normalizeProduct(row));
      const enriched = await enrichProductsWithVariantsClient(normalized, supabase);
      const items = enriched.map((row) => toSaleItem(row)).filter((item): item is SaleItem => item != null);
      setMainItem(items[0] ?? null);
      setSecondaryItems(items.slice(1));
    } else {
      setMainItem(null);
      setSecondaryItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  if (!loading && !mainItem) return null;

  if (loading) {
    return (
      <section className="w-full bg-t40-white py-20 flex justify-center">
        <Loader2 className="animate-spin text-t40-grey" size={28} />
      </section>
    );
  }

  if (!mainItem) return null;

  return (
    <section className="w-full bg-t40-white py-20 lg:py-28">
      <div className="t40-container px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#d94625] rounded-full animate-pulse" />
              Special Offers
            </p>
            <h2 className="text-3xl md:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading">
              Limited Time Sale
            </h2>
          </div>
          <Link
            href="/shop/flash-sales"
            className="group hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] transition-colors"
          >
            View All Offers{" "}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 lg:h-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 relative group overflow-hidden bg-t40-black h-[500px] lg:h-full flex flex-col justify-end p-8 lg:p-12"
          >
            <Image
              src={mainItem.image}
              alt={mainItem.name}
              fill
              className="object-cover opacity-60 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-t40-black/90 via-t40-black/30 to-transparent" />

            <div className="relative z-10 w-full max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-t40-white bg-[#d94625] uppercase font-heading">
                  {Math.round(
                    ((mainItem.originalPrice - mainItem.salePrice) / mainItem.originalPrice) * 100
                  )}
                  % Off
                </span>
                <div className="text-t40-white/90 bg-t40-black/50 px-3 py-1 backdrop-blur-sm">
                  <FlashSaleCountdown
                    endsAt={mainItem.saleEndsAt}
                    onExpired={fetchSales}
                    theme="dark"
                  />
                </div>
              </div>

              <p className="text-t40-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 font-heading">
                {mainItem.brand}
              </p>

              <h3 className="text-2xl md:text-3xl lg:text-5xl font-bold md:font-black text-t40-white uppercase tracking-tighter font-heading mb-6">
                {mainItem.name}
              </h3>

              <div className="flex items-end gap-4 mb-8">
                <p className="text-2xl font-bold text-t40-white">
                  {formatPrice(mainItem.salePrice)}
                </p>
                <p className="text-lg text-t40-white/50 line-through pb-0.5">
                  {formatPrice(mainItem.originalPrice)}
                </p>
              </div>

              <Link
                href={mainItem.link}
                className="inline-flex items-center justify-center bg-t40-white text-t40-black px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] hover:text-t40-white transition-colors duration-300 w-full sm:w-auto"
              >
                View Offer
              </Link>
            </div>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col h-auto lg:h-full justify-between">
            {secondaryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-t40-white group relative flex items-center py-4 lg:py-6 border-b border-t40-light last:border-none flex-1"
              >
                <Link
                  href={item.link}
                  className="absolute inset-0 z-10"
                  aria-label={`View offer for ${item.name}`}
                />

                <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-t40-light">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-0 left-0 bg-[#d94625] text-t40-white text-[9px] font-bold px-1.5 py-0.5 font-heading">
                    -
                    {Math.round(
                      ((item.originalPrice - item.salePrice) / item.originalPrice) * 100
                    )}
                    %
                  </div>
                </div>

                <div className="ml-6 flex flex-col justify-center w-full">
                  <p className="text-t40-grey text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-heading">
                    {item.brand}
                  </p>
                  <h4 className="text-sm lg:text-lg font-bold text-t40-black uppercase tracking-tight font-heading mb-2 line-clamp-1">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm lg:text-base font-bold text-[#d94625]">
                      {formatPrice(item.salePrice)}
                    </span>
                    <span className="text-xs text-t40-grey line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  </div>
                  <div className="text-t40-grey">
                    <FlashSaleCountdown
                      endsAt={item.saleEndsAt}
                      onExpired={fetchSales}
                      theme="dark"
                    />
                  </div>
                </div>

                <div className="absolute right-4 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
                  <ArrowRight size={20} className="text-t40-black" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Link
          href="/shop/flash-sales"
          className="mt-8 flex sm:hidden items-center justify-center gap-2 border border-t40-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:bg-t40-black hover:text-t40-white transition-colors"
        >
          View All Offers
        </Link>
      </div>
    </section>
  );
}
