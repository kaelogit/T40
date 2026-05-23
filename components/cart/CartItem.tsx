"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartLine } from "@/context/CartContext";
import { getProductHref } from "@/lib/products/urls";
import { formatPrice } from "@/lib/products/pricing";
import GiftSetLineDetails from "@/components/product/GiftSetLineDetails";
import { isGiftSetLine } from "@/lib/orders/bundleDetails";

type Props = {
  item: CartLine;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  compact?: boolean;
};

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
  compact = false,
}: Props) {
  const productId = item.id.split("::")[0];
  const productHref = getProductHref({ id: productId, slug: null });
  const lineTotal = item.price * item.quantity;

  return (
    <article
      className={`flex gap-4 border-b border-t40-light ${
        compact ? "pb-6" : "pb-8 lg:pb-10"
      }`}
    >
      <Link
        href={productHref}
        className={`relative bg-t40-light shrink-0 overflow-hidden ${
          compact ? "w-24 h-24" : "w-28 h-32 sm:w-36 sm:h-40"
        }`}
      >
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          fill
          sizes={compact ? "96px" : "144px"}
          className="object-cover"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <Link
                href={productHref}
                className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-t40-black hover:text-t40-grey transition-colors line-clamp-2"
              >
                {item.name}
              </Link>
              {item.size && !isGiftSetLine(item.size) && (
                <p className="text-[10px] text-t40-grey mt-1 font-heading uppercase tracking-widest">
                  {item.size}
                </p>
              )}
              {(isGiftSetLine(item.size) || item.bundleIncludes?.length) && (
                <GiftSetLineDetails
                  includes={item.bundleIncludes}
                  unavailable={item.bundleUnavailable}
                  partial={item.bundlePartial}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-t40-grey hover:text-[#d94625] transition-colors shrink-0 p-1"
              aria-label={`Remove ${item.name}`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 gap-4">
          <div className="flex items-center border border-t40-light">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-2 hover:bg-t40-light transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold px-4 font-heading min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-t40-light transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-t40-black">{formatPrice(lineTotal)}</p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-t40-grey font-heading mt-0.5">
                {formatPrice(item.price)} each
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
