import { hasProductLevelFlashSale } from "@/lib/products/sale";
import type { ProductVariant } from "@/lib/products/variants";
import {
  generalSalePrice,
  isGeneralFlashSaleLive,
  isProductEligibleForGeneralSale,
  type GeneralFlashSaleContent,
} from "./generalFlashSale";

export type EffectiveSaleSource = "product" | "general" | null;

export type EffectiveSaleState = {
  active: boolean;
  endsAt: string | null;
  source: EffectiveSaleSource;
  percentOff?: number;
};

type SaleProduct = {
  price: number | string;
  sale_price?: number | string | null;
  on_sale?: boolean | null;
  sale_ends_at?: string | null;
  category?: string | null;
  product_type?: string | null;
};

export function getEffectiveSaleState(
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): EffectiveSaleState {
  if (hasProductLevelFlashSale(product)) {
    return {
      active: true,
      endsAt: product.sale_ends_at ?? null,
      source: "product",
    };
  }

  if (
    generalSale &&
    isGeneralFlashSaleLive(generalSale) &&
    isProductEligibleForGeneralSale(product, generalSale)
  ) {
    return {
      active: true,
      endsAt: generalSale.endsAt,
      source: "general",
      percentOff: generalSale.percentOff,
    };
  }

  return { active: false, endsAt: null, source: null };
}

/** Countdown end time for product UI — general sale date when site-wide sale applies. */
export function getSaleCountdownEndsAt(
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): string | null {
  const state = getEffectiveSaleState(product, generalSale);
  if (!state.active) return null;
  if (state.endsAt) return state.endsAt;
  if (state.source === "general" && generalSale?.endsAt) return generalSale.endsAt;
  return null;
}

export function effectiveProductUnitPrice(
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): { price: number; compareAt: number | null; sale: EffectiveSaleState } {
  const base = Number(product.price) || 0;
  const sale = getEffectiveSaleState(product, generalSale);

  if (!sale.active) {
    return { price: base, compareAt: null, sale };
  }

  if (sale.source === "product") {
    const unit =
      product.sale_price != null && Number(product.sale_price) > 0
        ? Number(product.sale_price)
        : base;
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  if (sale.source === "general" && generalSale) {
    const unit = generalSalePrice(base, generalSale.percentOff);
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  return { price: base, compareAt: null, sale };
}

export function effectiveVariantUnitPrice(
  variant: ProductVariant,
  product: SaleProduct,
  generalSale: GeneralFlashSaleContent | null | undefined
): { price: number; compareAt: number | null; sale: EffectiveSaleState } {
  const base = variant.price;
  const sale = getEffectiveSaleState(product, generalSale);

  if (!sale.active) {
    return { price: base, compareAt: null, sale };
  }

  if (sale.source === "product") {
    const unit =
      variant.sale_price != null && variant.sale_price > 0 ? variant.sale_price : base;
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  if (sale.source === "general" && generalSale) {
    const unit = generalSalePrice(base, generalSale.percentOff);
    return {
      price: unit,
      compareAt: unit < base ? base : null,
      sale,
    };
  }

  return { price: base, compareAt: null, sale };
}
