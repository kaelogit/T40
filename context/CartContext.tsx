"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  variantId?: string;
  productId?: string;
  bundleIncludes?: string[];
  bundleUnavailable?: string[];
  bundlePartial?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("t40_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("t40_cart", JSON.stringify(cart));
  }, [cart]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity: item.quantity + newItem.quantity,
                ...(newItem.bundleIncludes?.length && !item.bundleIncludes?.length
                  ? {
                      bundleIncludes: newItem.bundleIncludes,
                      bundleUnavailable: newItem.bundleUnavailable,
                      bundlePartial: newItem.bundlePartial,
                    }
                  : {}),
              }
            : item
        );
      }
      return [...prev, newItem];
    });
    setDrawerOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        isDrawerOpen,
        setDrawerOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}