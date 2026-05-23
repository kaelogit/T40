import { Suspense } from "react";
import type { Metadata } from "next";
import CheckoutPageContent from "@/components/checkout/CheckoutPageContent";

export const metadata: Metadata = {
  title: "Checkout | T40 Perfumes",
  description: "Complete your fragrance order securely.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <CheckoutPageContent />
    </Suspense>
  );
}
