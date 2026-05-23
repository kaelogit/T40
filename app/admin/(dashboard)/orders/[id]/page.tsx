"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, PackageCheck } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";

type OrderItem = {
  id: string;
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  bundle_details?: { includes?: string[] } | null;
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setOrder(d.order);
        setItems(d.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const markDelivered = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "delivered" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not update order.");
    } else {
      setOrder((prev) => (prev ? { ...prev, status: "delivered" } : prev));
      setMessage("Order marked as delivered.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!order) return <p>Order not found.</p>;

  const status = order.status as string;
  const canMarkDelivered = status === "paid";

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black mb-6 inline-block"
      >
        ← Orders
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">
          {order.order_number as string}
        </h1>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border ${
            status === "paid"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50"
              : status === "delivered"
                ? "border-neutral-400 text-neutral-600 bg-neutral-50"
                : status === "pending"
                  ? "border-amber-500 text-amber-700 bg-amber-50"
                  : "border-neutral-200 text-neutral-500"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10 text-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Customer
          </p>
          <p>
            {order.first_name as string} {order.last_name as string}
          </p>
          <p className="text-neutral-500">{order.email as string}</p>
          <p className="text-neutral-500">{order.phone as string}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Delivery
          </p>
          <p>{order.address_line1 as string}</p>
          {order.address_line2 ? <p>{order.address_line2 as string}</p> : null}
          <p>
            {order.city as string}, {order.state as string}
          </p>
        </div>
      </div>

      <ul className="border border-neutral-200 divide-y divide-neutral-100 mb-8">
        {items.map((item) => {
          const includes = item.bundle_details?.includes;
          return (
            <li key={item.id} className="p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span>
                  {item.product_name}
                  {item.size ? ` · ${item.size}` : ""} × {item.quantity} @{" "}
                  {formatPrice(Number(item.unit_price))}
                </span>
                <span className="font-bold shrink-0">
                  {formatPrice(Number(item.line_total))}
                </span>
              </div>
              {includes && includes.length > 0 && (
                <p className="text-xs text-neutral-500 mt-1">
                  Includes: {includes.join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-lg font-black mb-8">Total: {formatPrice(Number(order.total))}</p>

      {status === "pending" && (
        <p className="text-sm text-amber-700 mb-6">
          Waiting for payment. Status updates to <strong>paid</strong> automatically when the
          customer completes checkout.
        </p>
      )}

      {canMarkDelivered && (
        <button
          type="button"
          onClick={markDelivered}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-neutral-800 transition-colors"
        >
          <PackageCheck size={16} />
          {saving ? "Saving..." : "Mark as delivered"}
        </button>
      )}

      {status === "delivered" && (
        <p className="text-sm text-neutral-600">This order has been marked as delivered.</p>
      )}

      {message && (
        <p className={`mt-4 text-sm ${message.includes("Could") ? "text-red-600" : "text-emerald-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
