"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products/pricing";
import { Button } from "@/components/ui/Button";
import GiftSetLineDetails from "@/components/product/GiftSetLineDetails";
import LinePrice from "@/components/ui/LinePrice";
import { parseBundleDetails, isGiftSetLine } from "@/lib/orders/bundleDetails";

type OrderInfo = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  email: string;
  first_name: string;
};

type OrderLine = {
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  compare_at_price?: number | null;
  line_total: number;
  bundle_details?: unknown;
};

export default function OrderConfirmation({ checkoutIntentId }: { checkoutIntentId: string }) {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [items, setItems] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams.get("provider") ?? "paystack";
    const reference =
      searchParams.get("reference") ??
      searchParams.get("trxref") ??
      undefined;
    const sessionId = searchParams.get("session_id") ?? undefined;

    const params = new URLSearchParams({ checkoutIntentId, provider });
    if (reference) params.set("reference", reference);
    if (sessionId) params.set("session_id", sessionId);

    fetch(`/api/orders/verify?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data.order);
          setItems(Array.isArray(data.items) ? data.items : []);
          const status = data.order?.status as string | undefined;
          if (status === "paid" || status === "delivered") {
            clearCart();
          }
        }
      })
      .catch(() => setError("Could not load order."))
      .finally(() => setLoading(false));
  }, [checkoutIntentId, clearCart, searchParams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-t40-grey mb-4" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey">
          Confirming your order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-t40-grey mb-6">{error ?? "Order not found."}</p>
        <Button href="/shop">Continue shopping</Button>
      </div>
    );
  }

  const isPaid = order.status === "paid" || order.status === "delivered";
  const isPending = order.status === "pending" || !order.order_number || order.order_number === "Pending";

  return (
    <div className="min-h-screen bg-white">
      <div className="t40-container px-4 md:px-8 py-16 lg:py-24 max-w-2xl mx-auto text-center">
        <CheckCircle
          size={56}
          className={`mx-auto mb-6 ${isPaid ? "text-emerald-600" : "text-amber-500"}`}
        />

        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
          {isPaid ? "Thank you" : "Order received"}
        </p>

        <h1 className="text-3xl md:text-4xl font-black text-t40-black uppercase tracking-tighter font-heading mb-4">
          {isPaid ? "Payment successful" : isPending ? "Confirming payment" : "Payment pending"}
        </h1>

        <p className="text-t40-grey text-sm font-body mb-8 leading-relaxed">
          {isPaid ? (
            <>
              We&apos;ve sent a confirmation to{" "}
              <span className="text-t40-black font-medium">{order.email}</span> with your order
              details.
            </>
          ) : (
            "We are confirming your payment. You will receive an email once it is complete."
          )}
        </p>

        <div className="border border-t40-light p-6 text-left mb-8 space-y-3 font-heading">
          <div className="flex justify-between text-[11px] uppercase tracking-widest">
            <span className="text-t40-grey">Order</span>
            <span className="font-bold text-t40-black">{order.order_number}</span>
          </div>
          <div className="flex justify-between text-[11px] uppercase tracking-widest">
            <span className="text-t40-grey">Total</span>
            <span className="font-bold text-t40-black">{formatPrice(Number(order.total))}</span>
          </div>
          <div className="flex justify-between text-[11px] uppercase tracking-widest">
            <span className="text-t40-grey">Status</span>
            <span className="font-bold text-t40-black capitalize">{order.status}</span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="border border-t40-light p-6 text-left mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-t40-grey font-heading mb-4">
              Items
            </p>
            <ul className="space-y-4">
              {items.map((item, index) => {
                const bundle = parseBundleDetails(item.bundle_details);
                const includes = bundle?.includes;
                return (
                  <li
                    key={`${item.product_name}-${index}`}
                    className="flex justify-between gap-4 text-left border-b border-t40-light last:border-0 pb-4 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-t40-black font-heading">
                        {item.product_name}
                      </p>
                      {item.size && !isGiftSetLine(item.size) && (
                        <p className="text-[10px] text-t40-grey uppercase tracking-widest mt-0.5">
                          {item.size}
                        </p>
                      )}
                      {(isGiftSetLine(item.size) || includes?.length) && (
                        <GiftSetLineDetails
                          includes={includes}
                          unavailable={bundle?.unavailable}
                          partial={bundle?.partial}
                        />
                      )}
                      <p className="text-[10px] text-t40-grey mt-1">Qty {item.quantity}</p>
                    </div>
                    <LinePrice
                      price={Number(item.unit_price)}
                      compareAt={
                        item.compare_at_price != null ? Number(item.compare_at_price) : undefined
                      }
                      quantity={item.quantity}
                      showEach={false}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/shop" size="lg">
            Continue shopping
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] font-heading border border-t40-black/20 hover:border-t40-black transition-colors"
          >
            Back home
          </Link>
        </div>

        {isPaid && (
          <p className="mt-10 text-xs text-t40-grey font-body">
            Questions about your order?{" "}
            <Link href="/contact" className="text-t40-black underline underline-offset-2">
              Contact us
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
