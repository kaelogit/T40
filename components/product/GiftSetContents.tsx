"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift } from "lucide-react";
import type { ProductDetail } from "@/types/product";
import type { GiftSetAvailability } from "@/lib/products/giftSetAvailability";
import { giftSetIndividualTotal, giftSetSavings } from "@/lib/products/giftSetPricing";
import { formatPrice } from "@/lib/products/pricing";

type Props = {
  items: NonNullable<ProductDetail["bundleItems"]>;
  setName: string;
  setPrice: number;
  availability?: GiftSetAvailability;
};

export default function GiftSetContents({ items, setName, setPrice, availability }: Props) {
  const individualTotal = giftSetIndividualTotal(items);
  const savings = giftSetSavings(individualTotal, setPrice);

  return (
    <section className="border border-amber-200/80 bg-amber-50/30 p-6 lg:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 bg-amber-100 text-amber-950 shrink-0">
          <Gift size={18} strokeWidth={2.25} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#d94625] font-heading">
            Gift set
          </p>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-t40-black mt-1">
            {items.length} fragrances included
          </h2>
          <p className="text-xs text-t40-grey font-body mt-1 leading-relaxed">
            Everything in {setName} — bought separately vs. as this set.
          </p>
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {items.map((item) => {
          const inStock = item.in_stock !== false;
          const lineTotal = item.price * item.quantity;
          return (
            <li
              key={item.id}
              className="flex gap-4 items-center bg-white border border-neutral-100 p-3"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-t40-light shrink-0">
                <Image
                  src={item.images[0] || "/placeholder.jpg"}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className={`object-cover ${inStock ? "" : "opacity-50 grayscale"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                {item.brand && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-t40-grey font-heading">
                    {item.brand}
                  </p>
                )}
                <Link
                  href={`/product/${item.slug ?? item.id}`}
                  className="text-sm font-bold uppercase tracking-wide font-heading text-t40-black hover:text-[#d94625] transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest mt-1 font-heading ${
                    inStock ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {inStock ? "In stock" : "Out of stock"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-t40-black tabular-nums">
                  {formatPrice(item.price)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-[9px] text-t40-grey">× {item.quantity}</p>
                )}
                {item.quantity > 1 && (
                  <p className="text-[10px] text-t40-grey tabular-nums">
                    {formatPrice(lineTotal)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {availability && availability.available < availability.total && availability.available > 0 && (
        <p className="text-[11px] text-amber-800 font-body border-t border-amber-200/80 pt-4 mb-4">
          {availability.available} of {availability.total} fragrances available — you can still order
          this set with the items in stock.
        </p>
      )}

      {individualTotal > 0 && (
        <div className="border-t border-amber-200/80 pt-4 space-y-2">
          <div className="flex justify-between items-baseline gap-4 text-sm font-heading">
            <span className="text-t40-grey uppercase tracking-widest text-[10px] font-bold">
              Bought separately
            </span>
            <span className="text-neutral-400 line-through tabular-nums">
              {formatPrice(individualTotal)}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-4">
            <span className="text-t40-grey uppercase tracking-widest text-[10px] font-bold font-heading">
              This gift set
            </span>
            <span className="text-lg font-black text-[#d94625] tabular-nums">
              {formatPrice(setPrice)}
            </span>
          </div>
          {savings.amount > 0 && (
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-heading pt-1">
              You save {formatPrice(savings.amount)}
              {savings.percent > 0 && ` (${savings.percent}% off)`}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
