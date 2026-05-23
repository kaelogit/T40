"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { Button } from "@/components/ui/Button";

export default function CartPageContent() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQuantity, clearCart } =
    useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-t40-light flex items-center justify-center mb-6">
          <ShoppingBag size={36} className="text-t40-grey" strokeWidth={1} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
          Your bag
        </p>
        <h1 className="text-3xl md:text-4xl font-black text-t40-black uppercase tracking-tighter font-heading mb-4">
          Cart is empty
        </h1>
        <p className="text-t40-grey text-sm max-w-md mb-8 font-body">
          Discover our collection of luxury fragrances and find your signature scent.
        </p>
        <Button href="/shop" size="lg">
          Start shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Continue shopping
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
              Your bag
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading">
              Cart
            </h1>
          </div>
          <p className="text-[11px] text-t40-grey font-heading uppercase tracking-widest lg:pt-8">
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-0 lg:divide-y-0">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <CartSummary
              subtotal={cartTotal}
              itemCount={cartCount}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
