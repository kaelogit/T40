export const LAGOS_FREE_SHIPPING_MIN = 80_000;
export const LAGOS_STATE = "Lagos";

export type LagosFreeShippingStatus = {
  eligible: boolean;
  remaining: number;
  progress: number;
};

export function getLagosFreeShippingStatus(subtotal: number): LagosFreeShippingStatus {
  const eligible = subtotal >= LAGOS_FREE_SHIPPING_MIN;
  const remaining = eligible ? 0 : LAGOS_FREE_SHIPPING_MIN - subtotal;
  const progress = Math.min(100, Math.round((subtotal / LAGOS_FREE_SHIPPING_MIN) * 100));
  return { eligible, remaining, progress };
}

export function isLagosDelivery(state?: string | null): boolean {
  return state?.trim().toLowerCase() === LAGOS_STATE.toLowerCase();
}
