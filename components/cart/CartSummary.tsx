"use client";

import { Tag } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";
import { Button } from "@/components/ui/Button";
import LagosFreeShippingNote from "@/components/shipping/LagosFreeShippingNote";

type Props = {
  subtotal: number;
  itemCount: number;
  onClearCart?: () => void;
  compact?: boolean;
};

export default function CartSummary({
  subtotal,
  itemCount,
  onClearCart,
  compact = false,
}: Props) {
  return (
    <div
      className={`bg-t40-light/50 border border-t40-light p-6 lg:p-8 ${
        compact ? "" : "lg:sticky lg:top-28"
      }`}
    >
      <h2 className="font-heading text-sm font-black uppercase tracking-[0.2em] text-t40-black mb-6">
        Order summary
      </h2>

      <dl className="space-y-3 text-sm mb-6">
        <div className="flex justify-between font-heading">
          <dt className="text-[11px] font-bold uppercase tracking-widest text-t40-grey">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="font-bold text-t40-black">{formatPrice(subtotal)}</dd>
        </div>
      </dl>

      <div className="border-t border-t40-light pt-6 mb-6">
        <div className="flex justify-between items-baseline">
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-t40-black">
            Total
          </span>
          <span className="text-xl font-black font-heading text-t40-black">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="mt-3">
          <LagosFreeShippingNote subtotal={subtotal} />
        </div>
      </div>

      <div className="space-y-3">
        <Button href="/checkout" size="lg" className="w-full">
          Proceed to checkout
        </Button>
        {!compact && (
          <Button href="/shop" variant="outline" className="w-full">
            Continue shopping
          </Button>
        )}
        {onClearCart && (
          <button
            type="button"
            onClick={onClearCart}
            className="w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-[#d94625] transition-colors py-2"
          >
            Clear cart
          </button>
        )}
      </div>

      {!compact && (
        <p className="mt-6 flex items-center gap-2 text-[10px] text-t40-grey font-heading uppercase tracking-wider">
          <Tag size={12} />
          Coupon codes applied at checkout
        </p>
      )}
    </div>
  );
}
