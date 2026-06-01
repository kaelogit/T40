"use client";

import { X, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import LagosFreeShippingNote from "@/components/shipping/LagosFreeShippingNote";
import CartItem from "./CartItem";

export default function CartDrawer({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-t40-black/40 backdrop-blur-sm z-[80] transition-opacity"
        onClick={() => setIsOpen(false)}
        aria-hidden
      />

      <div className="fixed inset-y-0 right-0 w-[90%] max-w-md bg-t40-white z-[90] shadow-2xl flex flex-col border-l border-t40-light animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-t40-light shrink-0">
          <span className="font-heading text-xl font-black uppercase tracking-widest text-t40-black">
            Your cart
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 text-t40-black hover:text-t40-grey transition-colors"
            aria-label="Close cart"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-t40-grey space-y-4">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="font-heading text-sm font-bold uppercase tracking-widest">
                Your cart is empty
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-4 border border-t40-black px-8 py-3 text-xs font-bold uppercase tracking-widest text-t40-black hover:bg-t40-black hover:text-t40-white transition-colors font-heading"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-t40-light p-6 bg-t40-white shrink-0 space-y-4">
            <div className="flex justify-between items-center text-sm font-heading">
              <span className="font-bold uppercase tracking-widest text-t40-black">
                Subtotal
              </span>
              <span className="font-bold text-lg text-t40-black">
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>
            <LagosFreeShippingNote subtotal={cartTotal} compact />
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-t40-black text-t40-white text-center py-4 font-heading text-xs font-bold uppercase tracking-widest hover:bg-[#d94625] transition-colors"
            >
              Proceed to checkout
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-3 border border-t40-black text-t40-black font-heading text-xs font-bold uppercase tracking-widest hover:bg-t40-light transition-colors"
            >
              View full cart ({cartCount})
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
