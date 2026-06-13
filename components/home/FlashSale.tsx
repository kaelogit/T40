"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useGeneralFlashSale } from "@/context/GeneralFlashSaleContext";
import { getProductHref } from "@/lib/products/urls";
import { normalizeProduct } from "@/lib/products/normalize";
import { enrichProductsWithVariantsClient } from "@/lib/products/variants";
import { activeSaleOrFilter } from "@/lib/products/sale";
import {
  effectiveProductUnitPrice,
  effectiveVariantUnitPrice,
  getEffectiveSaleState,
} from "@/lib/sales/effectivePricing";
import { getCardVariant, getActiveVariants } from "@/lib/products/variants";
import { isProductEligibleForGeneralSale } from "@/lib/sales/generalFlashSale";
import { generalSaleShippingSummary } from "@/lib/shipping/promotions";
import FlashSaleCountdown from "@/components/product/FlashSaleCountdown";
import type { ProductDetail } from "@/types/product";
import type { Tables } from "@/types/database";
import type { GeneralFlashSaleLayout } from "@/lib/sales/generalFlashSale";

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
  percentOff: number;
};

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
}

function toSaleItem(
  p: ProductDetail,
  generalSale: ReturnType<typeof useGeneralFlashSale>
): SaleItem | null {
  const sale = getEffectiveSaleState(p, generalSale);
  if (!sale.active || !sale.endsAt) return null;

  const variants = getActiveVariants(p);
  const cardVariant = variants.length ? getCardVariant(variants) : null;
  const priced = cardVariant
    ? effectiveVariantUnitPrice(cardVariant, p, generalSale)
    : effectiveProductUnitPrice(p, generalSale);

  const originalPrice = priced.compareAt ?? p.price;
  const salePrice = priced.price;
  if (salePrice >= originalPrice) return null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand ?? "T40 Perfumes",
    originalPrice,
    salePrice,
    image: p.images[0] ?? PLACEHOLDER,
    link: getProductHref(p),
    saleEndsAt: sale.endsAt,
    percentOff: Math.round(((originalPrice - salePrice) / originalPrice) * 100),
  };
}

function SectionHeader({
  eyebrow,
  title,
  endsAt,
  onExpired,
}: {
  eyebrow: string;
  title: string;
  endsAt?: string | null;
  onExpired?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
      <div>
        <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.4em] mb-3 font-heading flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#d94625] rounded-full animate-pulse" />
          {eyebrow}
        </p>
        <h2 className="text-3xl md:text-5xl font-bold md:font-black text-t40-black uppercase tracking-tighter font-heading">
          {title}
        </h2>
        {endsAt && (
          <div className="mt-4 text-t40-grey">
            <FlashSaleCountdown endsAt={endsAt} onExpired={onExpired} theme="dark" />
          </div>
        )}
      </div>
      <Link
        href="/shop/flash-sales"
        className="group hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:text-[#d94625] transition-colors"
      >
        Shop all sale items{" "}
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function FeaturedLayout({
  mainItem,
  secondaryItems,
  onExpired,
}: {
  mainItem: SaleItem;
  secondaryItems: SaleItem[];
  onExpired: () => void;
}) {
  return (
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
              {mainItem.percentOff}% Off
            </span>
            <div className="text-t40-white/90 bg-t40-black/50 px-3 py-1 backdrop-blur-sm">
              <FlashSaleCountdown endsAt={mainItem.saleEndsAt} onExpired={onExpired} theme="dark" />
            </div>
          </div>
          <p className="text-t40-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 font-heading">
            {mainItem.brand}
          </p>
          <h3 className="text-2xl md:text-3xl lg:text-5xl font-bold md:font-black text-t40-white uppercase tracking-tighter font-heading mb-6">
            {mainItem.name}
          </h3>
          <div className="flex items-end gap-4 mb-8">
            <p className="text-2xl font-bold text-t40-white">{formatPrice(mainItem.salePrice)}</p>
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
            <Link href={item.link} className="absolute inset-0 z-10" aria-label={`View ${item.name}`} />
            <div className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-t40-light">
              <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-0 left-0 bg-[#d94625] text-t40-white text-[9px] font-bold px-1.5 py-0.5 font-heading">
                -{item.percentOff}%
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
                <span className="text-sm lg:text-base font-bold text-[#d94625]">{formatPrice(item.salePrice)}</span>
                <span className="text-xs text-t40-grey line-through">{formatPrice(item.originalPrice)}</span>
              </div>
              <FlashSaleCountdown endsAt={item.saleEndsAt} onExpired={onExpired} theme="dark" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function GridLayout({ items, onExpired }: { items: SaleItem[]; onExpired: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
          className="group relative bg-t40-light overflow-hidden"
        >
          <Link href={item.link} className="absolute inset-0 z-10" aria-label={`View ${item.name}`} />
          <div className="relative aspect-[4/5]">
            <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <span className="absolute top-3 left-3 bg-[#d94625] text-t40-white text-[9px] font-bold px-2 py-1 uppercase font-heading">
              {item.percentOff}% Off
            </span>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-t40-grey font-heading">{item.brand}</p>
            <h3 className="text-sm font-bold uppercase tracking-tight font-heading line-clamp-2">{item.name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#d94625]">{formatPrice(item.salePrice)}</span>
              <span className="text-xs text-t40-grey line-through">{formatPrice(item.originalPrice)}</span>
            </div>
            <FlashSaleCountdown endsAt={item.saleEndsAt} onExpired={onExpired} theme="dark" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BannerLayout({
  title,
  percentOff,
  endsAt,
  onExpired,
}: {
  title: string;
  percentOff: number;
  endsAt: string;
  onExpired: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-t40-black px-8 py-16 lg:py-20 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#d94625]/20 via-transparent to-[#d94625]/10" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <p className="text-[#d94625] text-[10px] font-bold uppercase tracking-[0.5em] font-heading">
          {percentOff}% off everything
        </p>
        <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-t40-white font-heading">
          {title}
        </h3>
        <div className="flex justify-center">
          <div className="bg-t40-black/60 px-4 py-2 backdrop-blur-sm inline-block">
            <FlashSaleCountdown endsAt={endsAt} onExpired={onExpired} theme="dark" />
          </div>
        </div>
        <Link
          href="/shop/flash-sales"
          className="inline-flex items-center justify-center bg-t40-white text-t40-black px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] hover:text-t40-white transition-colors"
        >
          Shop the sale
        </Link>
      </div>
    </motion.div>
  );
}

export default function FlashSale() {
  const generalSale = useGeneralFlashSale();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);

    try {
      await fetch("/api/sales/expire", { method: "POST" });
    } catch {
      // Client-side expiry filter still applies
    }

    let rows: Tables<"products">[] = [];

    if (generalSale) {
      let query = supabase.from("products").select("*").eq("in_stock", true).order("badge", { ascending: true }).limit(8);
      if (generalSale.excludeGiftSets) {
        query = query.neq("category", "gift-sets").neq("product_type", "gift_set");
      }
      const { data, error } = await query;
      if (data && !error) rows = data;
    } else {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("on_sale", true)
        .or(activeSaleOrFilter(now))
        .order("sale_ends_at", { ascending: true })
        .limit(4);
      if (data && !error) rows = data;
    }

    if (rows.length > 0) {
      const normalized = rows.map((row) => normalizeProduct(row));
      const enriched = await enrichProductsWithVariantsClient(normalized, supabase);
      const saleItems = enriched
        .filter((p) => !generalSale || isProductEligibleForGeneralSale(p, generalSale))
        .map((p) => toSaleItem(p, generalSale))
        .filter((item): item is SaleItem => item != null)
        .slice(0, 4);
      setItems(saleItems);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [generalSale]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const layout: GeneralFlashSaleLayout = generalSale?.homepageLayout ?? "featured";
  const eyebrow = generalSale?.eyebrow ?? "Special Offers";
  const title = generalSale?.title ?? "Limited Time Sale";
  const endsAt = generalSale?.endsAt ?? items[0]?.saleEndsAt ?? null;
  const shippingNote = generalSaleShippingSummary(generalSale);

  const showSection = useMemo(() => {
    if (generalSale) return items.length > 0 || layout === "banner";
    return items.length > 0;
  }, [generalSale, items.length, layout]);

  if (!loading && !showSection) return null;

  if (loading) {
    return (
      <section className="w-full bg-t40-white py-20 flex justify-center">
        <Loader2 className="animate-spin text-t40-grey" size={28} />
      </section>
    );
  }

  const mainItem = items[0];
  const secondaryItems = items.slice(1);

  return (
    <section className="w-full bg-t40-white py-20 lg:py-28">
      <div className="t40-container px-4 md:px-8">
        <SectionHeader eyebrow={eyebrow} title={title} endsAt={layout === "banner" ? endsAt : undefined} onExpired={fetchSales} />

        {shippingNote && (
          <p className="text-[10px] text-neutral-500 mb-8 -mt-6 font-body">{shippingNote}</p>
        )}

        {layout === "banner" && endsAt && generalSale ? (
          <BannerLayout
            title={title}
            percentOff={generalSale.percentOff}
            endsAt={endsAt}
            onExpired={fetchSales}
          />
        ) : layout === "grid" && items.length > 0 ? (
          <GridLayout items={items} onExpired={fetchSales} />
        ) : mainItem ? (
          <FeaturedLayout mainItem={mainItem} secondaryItems={secondaryItems} onExpired={fetchSales} />
        ) : null}

        <Link
          href="/shop/flash-sales"
          className="mt-8 flex sm:hidden items-center justify-center gap-2 border border-t40-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] font-heading text-t40-black hover:bg-t40-black hover:text-t40-white transition-colors"
        >
          Shop all sale items
        </Link>
      </div>
    </section>
  );
}
