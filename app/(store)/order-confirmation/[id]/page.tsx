import { Suspense } from "react";
import type { Metadata } from "next";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Confirmation | T40 Perfumes",
  robots: { index: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-white animate-pulse" />}>
      <OrderConfirmation checkoutIntentId={id} />
    </Suspense>
  );
}
