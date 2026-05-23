"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProductHref } from "@/lib/products/urls";
import { isSaleActive } from "@/lib/products/sale";
import { isGiftSetProduct } from "@/lib/products/isGiftSetProduct";
import { buildCartLinePayload, canAddProductToCart } from "@/lib/products/cartLine";
import { cardPriceLabel } from "@/lib/products/variants";

export interface Product {
  id: string;
  slug?: string | null;
  name: string;
  brand?: string | null;
  price: number;
  category?: string;
  product_type?: string | null;
  subcategory?: string;
  sale_price?: number;
  on_sale?: boolean;
  sale_ends_at?: string | null;
  images: string[];
  in_stock?: boolean;
  stock_quantity?: number | null;
  low_stock_threshold?: number | null;
  is_new_arrival?: boolean;
  badge?: "BEST SELLER" | "NEW" | "FLASH SALE" | null;
  variants?: import("@/lib/products/variants").ProductVariant[];
  defaultVariant?: import("@/lib/products/variants").ProductVariant;
}

type Props = {
  product: Product;
  viewMode?: "grid" | "list";
  priority?: boolean;
};

export default function ProductCard({ product, viewMode = "grid", priority = false }: Props) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const saleActive = isSaleActive(product);

  const cardPricing = cardPriceLabel(product as import("@/types/product").ProductDetail);
  const cardVariant = cardPricing.cardVariant;
  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const hoverImage = product.images?.[1] || null;
  const isGiftSet = isGiftSetProduct(product);
  const canAdd = canAddProductToCart(product);
  const isOutOfStock = !canAdd;
  const currentPrice = cardPricing.price;
  const originalPrice =
    cardPricing.compareAt ??
    (currentPrice < (cardVariant?.price ?? product.price) ? cardVariant?.price ?? product.price : null);
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const mlPrefix = cardPricing.mlPrefix;

  const cardMetaLabel = isGiftSet ? "Gift Set" : product.brand?.trim() || "T40 Perfumes";
  const productHref = getProductHref(product);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!canAdd) return;

      const line = buildCartLinePayload(product, { isGiftSet });
      if (!line) return;

      addToCart({
        ...line,
        image: mainImage,
        quantity: 1,
      });

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    },
    [addToCart, canAdd, isGiftSet, mainImage, product]
  );

  const badges = [];
  if (isGiftSet) {
    badges.push({ text: "Gift Set", style: "bg-amber-100 text-amber-950 border border-amber-200" });
  }
  if (product.is_new_arrival || product.badge === "NEW") {
    badges.push({ text: "New", style: "bg-white text-black border border-black" });
  }
  if (product.badge === "BEST SELLER") {
    badges.push({ text: "Best Seller", style: "bg-black text-white" });
  }
  if (saleActive && discount > 0) {
    badges.push({ text: `-${discount}%`, style: "bg-[#d94625] text-white" });
  }

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex gap-4 sm:gap-6 p-4 bg-white border border-neutral-100 hover:border-neutral-200 transition-colors"
      >
        <Link
          href={productHref}
          className="relative w-28 h-36 sm:w-40 sm:h-48 shrink-0 overflow-hidden bg-neutral-100"
        >
          <Image
            src={mainImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="160px"
            className="object-cover"
            onLoad={() => setImgLoaded(true)}
          />
          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-neutral-200" />}
        </Link>

        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest font-heading block mb-1 ${
                isGiftSet ? "text-amber-800" : "text-neutral-400"
              }`}
            >
              {cardMetaLabel}
            </span>
            <Link href={productHref}>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider font-heading leading-snug hover:text-neutral-600 transition-colors truncate">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {originalPrice && (
                <span className="text-xs text-neutral-400 line-through decoration-1">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span
                className={`text-sm font-bold ${discount > 0 ? "text-[#d94625]" : "text-black"}`}
              >
                {mlPrefix && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mr-1.5">
                    {mlPrefix}
                  </span>
                )}
                {formatPrice(currentPrice)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded || !canAdd}
            className={`self-start flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest font-heading transition-all mt-4 ${
              isAdded
                ? "bg-[#c9a96e] text-white"
                : isOutOfStock
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-[#d94625]"
            }`}
          >
            {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
            {isAdded ? "Added" : isOutOfStock ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        <Link href={productHref} className="absolute inset-0 block">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            onLoad={() => setImgLoaded(true)}
          />

          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-neutral-200" />}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {badges.map((badge, i) => (
            <span
              key={i}
              className={`${badge.style} text-[9px] font-bold px-3 py-1.5 uppercase tracking-[0.2em] shadow-sm rounded-full font-heading flex items-center gap-1.5`}
            >
              {badge.text}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdded || !canAdd}
          aria-label={isOutOfStock ? "Sold out" : "Add to bag"}
          className={`absolute bottom-3 right-3 z-20 pointer-events-auto w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isAdded
              ? "bg-[#c9a96e] text-white scale-110"
              : !canAdd
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-white text-black hover:bg-black hover:text-white active:scale-90"
          }`}
          title="Add to Bag"
        >
          {isAdded ? <Check size={18} strokeWidth={2} /> : <ShoppingBag size={18} strokeWidth={2} />}
        </button>
      </div>

      <div className="flex flex-col gap-1 pt-3">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest font-heading ${
            isGiftSet ? "text-amber-800" : "text-neutral-400"
          }`}
        >
          {cardMetaLabel}
        </span>

        <Link href={productHref} className="block">
          <h3 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider font-heading leading-snug hover:text-neutral-600 transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {originalPrice && (
            <span className="text-xs text-neutral-400 line-through decoration-1">
              {formatPrice(originalPrice)}
            </span>
          )}
          <span className={`text-sm font-bold ${discount > 0 ? "text-[#d94625]" : "text-black"}`}>
            {mlPrefix && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mr-1.5">
                {mlPrefix}
              </span>
            )}
            {formatPrice(currentPrice)}
          </span>
        </div>

        {isOutOfStock && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94625] font-heading">
            Out of Stock
          </span>
        )}
      </div>
    </motion.div>
  );
}
