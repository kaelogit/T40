"use client";

import Image from "next/image";
import type { CartItem } from "@/context/CartContext";
import { formatPrice } from "@/lib/products/pricing";
import GiftSetLineDetails from "@/components/product/GiftSetLineDetails";
import { isGiftSetLine } from "@/lib/orders/bundleDetails";
import LinePrice from "@/components/ui/LinePrice";
import LagosFreeShippingNote from "@/components/shipping/LagosFreeShippingNote";

type Props = {
  items: CartItem[];
  subtotal: number;
  discount?: number;
  couponCode?: string | null;
  total: number;
  shippingFee?: number;
  shippingLabel?: string;
  state?: string;
  country?: string;
};

export default function OrderSummary({
  items,
  subtotal,
  discount = 0,
  couponCode,
  total,
  shippingFee = 0,
  shippingLabel = "Delivery",
  state,
  country,
}: Props) {
  return (
    <div className="bg-t40-light/50 border border-t40-light p-6 lg:p-8 lg:sticky lg:top-28">
      <h2 className="font-heading text-sm font-black uppercase tracking-[0.2em] text-t40-black mb-6">
        Your order
      </h2>

      <ul className="space-y-4 mb-6 max-h-[320px] overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="relative w-14 h-14 bg-t40-light shrink-0">
              <Image
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider font-heading text-t40-black line-clamp-2">
                {item.name}
              </p>
              {item.size && !isGiftSetLine(item.size) && (
                <p className="text-[9px] text-t40-grey uppercase tracking-widest font-heading mt-0.5">
                  {item.size}
                </p>
              )}
              {(isGiftSetLine(item.size) || item.bundleIncludes?.length) && (
                <GiftSetLineDetails
                  includes={item.bundleIncludes}
                  unavailable={item.bundleUnavailable}
                  partial={item.bundlePartial}
                  compact
                />
              )}
              <p className="text-[10px] text-t40-grey mt-1">Qty {item.quantity}</p>
            </div>
            <LinePrice
              price={item.price}
              compareAt={item.compareAtPrice}
              quantity={item.quantity}
              showEach={false}
            />
          </li>
        ))}
      </ul>

      <div className="border-t border-t40-light pt-4 space-y-2 font-heading">
        <div className="flex justify-between text-[11px] uppercase tracking-widest text-t40-grey">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[11px] uppercase tracking-widest text-emerald-700">
            <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        {shippingFee > 0 && (
          <div className="flex justify-between text-[11px] uppercase tracking-widest text-t40-grey">
            <span>{shippingLabel}</span>
            <span>{formatPrice(shippingFee)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-t40-black">
            Total
          </span>
          <span className="text-lg font-black text-t40-black">{formatPrice(total)}</span>
        </div>
        <div className="pt-3">
          <LagosFreeShippingNote
            subtotal={Math.max(0, subtotal - discount)}
            state={state}
            country={country}
            shippingFee={shippingFee}
          />
        </div>
      </div>
    </div>
  );
}
