import type { Metadata } from "next";
import CartPageContent from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Cart | T40 Perfumes",
  description: "Review your fragrance selections before checkout.",
};

export default function CartPage() {
  return <CartPageContent />;
}
