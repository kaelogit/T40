"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Check, ShoppingBag, ChevronRight, Gift } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useGeneralFlashSale } from "@/context/GeneralFlashSaleContext";
import { cartLineId, formatPrice } from "@/lib/products/pricing";
import { buildCartLinePayload } from "@/lib/products/cartLine";
import type { ProductDetail as ProductDetailType, VolumeOption } from "@/types/product";
import { getEffectiveSaleState, effectiveProductUnitPrice, effectiveVariantUnitPrice, getSaleCountdownEndsAt } from "@/lib/sales/effectivePricing";
import ProductImages from "./ProductImages";
import VolumeSelector from "./VolumeSelector";
import StockBadge from "./StockBadge";
import RelatedProducts from "./RelatedProducts";
import GiftSetContents from "./GiftSetContents";
import GiftSetUnconfigured from "./GiftSetUnconfigured";
import {
  computeGiftSetAvailability,
  giftSetAvailabilityLabel,
} from "@/lib/products/giftSetAvailability";
import {
  giftSetIndividualTotal as sumBundlePrices,
  giftSetSavings,
} from "@/lib/products/giftSetPricing";
import {
  getActiveVariants,
  getCardVariant,
  hasMultipleSizes,
  lineDisplayName,
  variantCompareAtPrice,
  variantEffectivePrice,
  formatMlPrefix,
} from "@/lib/products/variants";
import { effectiveInStock, isLowStock } from "@/lib/products/stock";
import { Button } from "@/components/ui/Button";
import FlashSaleCountdown from "./FlashSaleCountdown";

type Props = {
  product: ProductDetailType;
  relatedProducts: ProductDetailType[];
};

export default function ProductDetail({ product, relatedProducts }: Props) {
  const { addToCart } = useCart();
  const generalSale = useGeneralFlashSale();
  const activeVariants = useMemo(() => getActiveVariants(product), [product]);
  const cardVariant = useMemo(
    () => getCardVariant(activeVariants) ?? product.defaultVariant ?? null,
    [activeVariants, product.defaultVariant]
  );
  const [selectedVariantId, setSelectedVariantId] = useState(cardVariant?.id ?? "");
  const [isAdded, setIsAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId) ?? cardVariant,
    [activeVariants, selectedVariantId, cardVariant]
  );

  const saleState = getEffectiveSaleState(product, generalSale);
  const onSale = saleState.active;
  const saleEndsAt = getSaleCountdownEndsAt(product, generalSale);

  const isGiftSet =
    product.product_type === "gift_set" ||
    product.category === "gift-sets" ||
    (product.bundleItems?.length ?? 0) > 0;

  const displayPrice = useMemo(() => {
    if (!selectedVariant) return effectiveProductUnitPrice(product, generalSale).price;
    return effectiveVariantUnitPrice(selectedVariant, product, generalSale).price;
  }, [selectedVariant, generalSale, product]);

  const displayCompare = useMemo(() => {
    if (!selectedVariant) return effectiveProductUnitPrice(product, generalSale).compareAt;
    return effectiveVariantUnitPrice(selectedVariant, product, generalSale).compareAt;
  }, [selectedVariant, generalSale, product]);

  const discount =
    displayCompare && displayCompare > displayPrice
      ? Math.round(((displayCompare - displayPrice) / displayCompare) * 100)
      : 0;

  const volumeOptions: VolumeOption[] = useMemo(
    () =>
      activeVariants.map((v) => {
        const priced = effectiveVariantUnitPrice(v, product, generalSale);
        return {
          variantId: v.id,
          size: v.label || v.id,
          label: v.label.trim() || "Standard",
          price: priced.price,
          compareAt: priced.compareAt,
        };
      }),
    [activeVariants, generalSale, product]
  );

  const showSizeSelector = !isGiftSet && hasMultipleSizes(activeVariants);

  const giftSetAvailability = useMemo(() => {
    if (!isGiftSet || !product.bundleItems?.length) return null;
    return computeGiftSetAvailability(product.bundleItems);
  }, [isGiftSet, product.bundleItems]);

  const bundleIndividualTotal = useMemo(() => {
    if (!isGiftSet || !product.bundleItems?.length) return 0;
    return sumBundlePrices(product.bundleItems);
  }, [isGiftSet, product.bundleItems]);

  const giftSetSave = useMemo(
    () => giftSetSavings(bundleIndividualTotal, displayPrice),
    [bundleIndividualTotal, displayPrice]
  );

  const inStock = effectiveInStock(product);
  const lowStock = isLowStock(product);
  const stockQuantity = product.stock_quantity;
  const singleMlPrefix =
    !showSizeSelector && selectedVariant ? formatMlPrefix(selectedVariant.label) : null;

  const giftSetNotConfigured =
    isGiftSet && (!product.bundleItems?.length || product.bundleItems.length < 2);

  const isOutOfStock =
    giftSetNotConfigured ||
    (isGiftSet
      ? giftSetAvailability
        ? !giftSetAvailability.canPurchase || !inStock
        : !inStock
      : !inStock);

  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const categoryLabel = isGiftSet
    ? "Gift Set"
    : product.subcategory || product.category || "Signature Fragrance";

  const formatVolumePrice = useCallback(
    (variantId: string) => {
      const opt = volumeOptions.find((v) => v.variantId === variantId);
      return formatPrice(opt?.price ?? displayPrice);
    },
    [volumeOptions, displayPrice]
  );

  const handleAddToCart = () => {
    if (isOutOfStock || giftSetNotConfigured) return;

    const line =
      selectedVariant
        ? {
            id: cartLineId(selectedVariant.id),
            variantId: selectedVariant.id,
            productId: product.id,
            name: isGiftSet ? product.name : lineDisplayName(product.name, selectedVariant.label),
            price: displayPrice,
            compareAtPrice:
              displayCompare && displayCompare > displayPrice ? displayCompare : undefined,
            size: isGiftSet ? "Gift set" : selectedVariant.label.trim() || undefined,
          }
        : buildCartLinePayload(product, { isGiftSet, generalSale });

    if (!line) return;

    const bundleIncludes = isGiftSet ? giftSetAvailability?.availableNames : undefined;
    const bundleUnavailable = isGiftSet ? giftSetAvailability?.unavailableNames : undefined;

    addToCart({
      ...line,
      image: mainImage,
      quantity: qty,
      bundleIncludes,
      bundleUnavailable:
        bundleUnavailable && bundleUnavailable.length > 0 ? bundleUnavailable : undefined,
      bundlePartial: giftSetAvailability?.isPartial,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="t40-container px-4 md:px-8 py-6 lg:py-10">
        <nav className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey mb-8 lg:mb-12">
          <Link href="/" className="hover:text-t40-black transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-t40-black transition-colors">
            Shop
          </Link>
          <ChevronRight size={12} />
          <span className="text-t40-black truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <ProductImages images={product.images} name={product.name} />

          <div className="flex flex-col">
            {isGiftSet && (
              <span className="inline-flex items-center gap-2 w-fit px-3 py-1.5 mb-4 bg-amber-100 text-amber-950 text-[10px] font-black uppercase tracking-[0.25em] font-heading">
                <Gift size={14} strokeWidth={2.25} />
                Gift set
              </span>
            )}
            {!isGiftSet && product.brand && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-t40-grey font-heading mb-2">
                {product.brand}
              </p>
            )}
            {!isGiftSet && (
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d94625] font-heading mb-3">
                {categoryLabel}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading">
              {product.name}
            </h1>

            <div className="mt-6 flex items-baseline gap-3 flex-wrap">
              {isGiftSet && bundleIndividualTotal > displayPrice && (
                <span className="text-lg text-neutral-400 line-through font-heading tabular-nums">
                  {formatPrice(bundleIndividualTotal)}
                </span>
              )}
              {!isGiftSet && displayCompare && (
                <span className="text-lg text-neutral-400 line-through font-heading">
                  {formatPrice(displayCompare)}
                </span>
              )}
              <span
                className={`text-2xl md:text-3xl font-black font-heading tabular-nums ${
                  isGiftSet && giftSetSave.amount > 0
                    ? "text-[#d94625]"
                    : discount > 0
                      ? "text-[#d94625]"
                      : "text-t40-black"
                }`}
              >
                {!isGiftSet && singleMlPrefix && (
                  <span className="text-sm font-bold uppercase tracking-widest text-t40-grey mr-2">
                    {singleMlPrefix}
                  </span>
                )}
                {formatPrice(displayPrice)}
              </span>
              {isGiftSet && giftSetSave.amount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 font-heading">
                  Save {formatPrice(giftSetSave.amount)}
                  {giftSetSave.percent > 0 && ` (${giftSetSave.percent}%)`}
                </span>
              )}
              {!isGiftSet && discount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d94625] font-heading">
                  Save {discount}%
                </span>
              )}
            </div>

            {onSale && saleEndsAt && !isGiftSet && (
              <div className="mt-4">
                <FlashSaleCountdown
                  endsAt={saleEndsAt}
                  label={saleState.source === "general" ? "Sale ends in" : undefined}
                />
              </div>
            )}

            {isGiftSet && bundleIndividualTotal > 0 && (
              <p className="mt-2 text-xs text-t40-grey font-body">
                Individual value {formatPrice(bundleIndividualTotal)} — yours as one set below.
              </p>
            )}

            <div className="mt-4">
              {isGiftSet && giftSetAvailability ? (
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest font-heading ${
                    giftSetAvailability.canPurchase
                      ? giftSetAvailability.isPartial
                        ? "text-amber-700"
                        : "text-emerald-700"
                      : "text-red-600"
                  }`}
                >
                  {giftSetAvailabilityLabel(giftSetAvailability)}
                </p>
              ) : (
                <StockBadge
                  inStock={inStock}
                  lowStock={lowStock}
                  stockQuantity={stockQuantity}
                />
              )}
            </div>

            {product.description && (
              <p className="mt-8 text-sm md:text-base text-t40-grey font-body leading-relaxed max-w-lg">
                {product.description}
              </p>
            )}

            {isGiftSet && giftSetNotConfigured && (
              <div className="mt-8">
                <GiftSetUnconfigured productName={product.name} />
              </div>
            )}

            {isGiftSet && product.bundleItems && product.bundleItems.length > 0 && (
              <div className="mt-8">
                <GiftSetContents
                  items={product.bundleItems}
                  setName={product.name}
                  setPrice={displayPrice}
                  availability={giftSetAvailability ?? undefined}
                />
              </div>
            )}

            {isGiftSet && giftSetAvailability?.isPartial && (
              <p className="mt-4 text-xs text-amber-800 font-body leading-relaxed max-w-lg">
                One fragrance in this set is temporarily unavailable. Your order will include the{" "}
                {giftSetAvailability.available} fragrances currently in stock.
              </p>
            )}

            <div className="mt-10 space-y-8">
              {showSizeSelector && selectedVariant && (
                <VolumeSelector
                  options={volumeOptions}
                  selected={selectedVariant.id}
                  onChange={setSelectedVariantId}
                  formatVolumePrice={formatVolumePrice}
                />
              )}

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-3 text-lg font-heading hover:bg-neutral-50"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 text-sm font-bold font-heading min-w-[3rem] text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="px-4 py-3 text-lg font-heading hover:bg-neutral-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isAdded || isOutOfStock}
              >
                {isAdded ? (
                  <>
                    <Check size={16} /> Added to bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {giftSetNotConfigured
                      ? "Not available"
                      : isOutOfStock
                        ? "Sold out"
                        : "Add to bag"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
}
