"use client";

import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";
import {
  LAGOS_FREE_SHIPPING_MIN,
  getLagosFreeShippingStatus,
  isLagosDelivery,
} from "@/lib/shipping/promotions";
import { CHECKOUT_COUNTRY_NIGERIA } from "@/lib/checkout/countries";

type Props = {
  subtotal: number;
  state?: string | null;
  country?: string;
  compact?: boolean;
};

export default function LagosFreeShippingNote({
  subtotal,
  state,
  country = CHECKOUT_COUNTRY_NIGERIA,
  compact = false,
}: Props) {
  const { eligible, remaining, progress } = getLagosFreeShippingStatus(subtotal);
  const isNigeria = country === CHECKOUT_COUNTRY_NIGERIA;
  const hasState = Boolean(state?.trim());
  const isLagos = isLagosDelivery(state);

  if (!isNigeria) {
    return (
      <p className="text-[10px] text-t40-grey font-body leading-relaxed">
        International delivery fees are confirmed after checkout based on your destination.
      </p>
    );
  }

  if (hasState && !isLagos) {
    return (
      <p className="text-[10px] text-t40-grey font-body leading-relaxed">
        Free delivery in Lagos on orders over {formatPrice(LAGOS_FREE_SHIPPING_MIN)}. We will
        contact you after checkout to confirm delivery fees for {state}.
      </p>
    );
  }

  if (hasState && isLagos && eligible) {
    return (
      <p className="text-[10px] text-emerald-800 font-body leading-relaxed flex items-start gap-2">
        <Truck size={12} className="shrink-0 mt-0.5" aria-hidden />
        <span>
          <span className="font-heading font-bold uppercase tracking-wider">
            Free Lagos delivery unlocked.
          </span>{" "}
          Your order qualifies for free delivery within Lagos.
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-t40-grey font-body leading-relaxed flex items-start gap-2">
        <Truck size={12} className="text-[#d94625] shrink-0 mt-0.5" aria-hidden />
        <span>
          Free delivery in Lagos on orders over {formatPrice(LAGOS_FREE_SHIPPING_MIN)}.
          {!hasState &&
            " For other areas in Nigeria, delivery fees are confirmed after checkout."}
        </span>
      </p>

      {!eligible && (
        <>
          <div
            className="h-1.5 bg-t40-light rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress toward free Lagos delivery"
          >
            <div
              className="h-full bg-[#d94625] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p
            className={`font-heading font-bold uppercase tracking-wider text-[#d94625] ${
              compact ? "text-[9px]" : "text-[10px]"
            }`}
          >
            Add {formatPrice(remaining)} more for free Lagos delivery
          </p>
        </>
      )}
    </div>
  );
}
