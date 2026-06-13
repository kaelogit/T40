import type { GeneralFlashSaleContent } from "@/lib/sales/generalFlashSale";
import { isGeneralFlashSaleLive } from "@/lib/sales/generalFlashSale";

export const LAGOS_FREE_SHIPPING_MIN = 90_000;
export const LAGOS_STATE = "Lagos";

/** During a general flash sale — Lagos delivery thresholds */
export const GENERAL_SALE_LAGOS_FREE_MIN = 150_000;
export const GENERAL_SALE_LAGOS_FLAT_FEE = 5_000;

export type LagosFreeShippingStatus = {
  eligible: boolean;
  remaining: number;
  progress: number;
  threshold: number;
};

export type CheckoutShippingResult = {
  fee: number;
  free: boolean;
  threshold: number;
  flatFee: number | null;
  mode: "standard" | "general_sale";
  label: string;
};

export function isLagosDelivery(state?: string | null): boolean {
  return state?.trim().toLowerCase() === LAGOS_STATE.toLowerCase();
}

function getFreeShippingThreshold(
  generalSale: GeneralFlashSaleContent | null | undefined
): number {
  if (generalSale && isGeneralFlashSaleLive(generalSale)) {
    return GENERAL_SALE_LAGOS_FREE_MIN;
  }
  return LAGOS_FREE_SHIPPING_MIN;
}

export function getLagosFreeShippingStatus(
  subtotal: number,
  generalSale?: GeneralFlashSaleContent | null
): LagosFreeShippingStatus {
  const threshold = getFreeShippingThreshold(generalSale);
  const eligible = subtotal >= threshold;
  const remaining = eligible ? 0 : threshold - subtotal;
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  return { eligible, remaining, progress, threshold };
}

/** Lagos shipping charged at checkout only during an active general flash sale. */
export function calculateCheckoutShipping(
  subtotalAfterDiscount: number,
  state: string | null | undefined,
  country: string,
  generalSale: GeneralFlashSaleContent | null | undefined
): CheckoutShippingResult {
  const isNigeria = country.trim().toLowerCase() === "nigeria";
  const isLagos = isLagosDelivery(state);
  const generalActive = Boolean(generalSale && isGeneralFlashSaleLive(generalSale));

  if (!generalActive || !isNigeria || !isLagos) {
    return {
      fee: 0,
      free: false,
      threshold: LAGOS_FREE_SHIPPING_MIN,
      flatFee: null,
      mode: "standard",
      label: "Delivery",
    };
  }

  if (subtotalAfterDiscount >= GENERAL_SALE_LAGOS_FREE_MIN) {
    return {
      fee: 0,
      free: true,
      threshold: GENERAL_SALE_LAGOS_FREE_MIN,
      flatFee: GENERAL_SALE_LAGOS_FLAT_FEE,
      mode: "general_sale",
      label: "Lagos delivery",
    };
  }

  return {
    fee: GENERAL_SALE_LAGOS_FLAT_FEE,
    free: false,
    threshold: GENERAL_SALE_LAGOS_FREE_MIN,
    flatFee: GENERAL_SALE_LAGOS_FLAT_FEE,
    mode: "general_sale",
    label: "Lagos delivery",
  };
}

export function generalSaleShippingSummary(
  generalSale: GeneralFlashSaleContent | null | undefined
): string | null {
  if (!generalSale || !isGeneralFlashSaleLive(generalSale)) return null;
  return `During this sale: free Lagos delivery on orders over ₦${GENERAL_SALE_LAGOS_FREE_MIN.toLocaleString("en-NG")}; ₦${GENERAL_SALE_LAGOS_FLAT_FEE.toLocaleString("en-NG")} delivery within Lagos below that.`;
}
