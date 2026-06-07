"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Search } from "lucide-react";
import { formatPrice } from "@/lib/products/pricing";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  first_name: string;
  last_name: string;
  total: number;
  payment_provider: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { value: "", label: "Paid & delivered" },
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "delivered", label: "Delivered" },
  { value: "pending", label: "Unpaid (legacy checkout)" },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  delivered: "Delivered",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  delivered: "bg-neutral-200 text-neutral-800",
};

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedEmail(email.trim()), 300);
    return () => clearTimeout(t);
  }, [email]);

  const queryString = useCallback(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (debouncedEmail) p.set("email", debouncedEmail);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }, [status, debouncedEmail, from, to]);

  const load = useCallback(() => {
    setLoading(true);
    const qs = queryString();
    fetch(`/api/admin/orders${qs ? `?${qs}` : ""}`)
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .finally(() => setLoading(false));
  }, [queryString]);

  useEffect(load, [load]);

  const exportCsv = () => {
    const qs = queryString();
    const sep = qs ? "&" : "";
    window.location.href = `/api/admin/orders?${qs}${sep}format=csv`;
  };

  const inputClass =
    "border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Orders</h1>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 border border-neutral-300 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 border border-neutral-200 bg-white">
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-full`}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            Email
          </label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Search email..."
              className={`${inputClass} w-full pl-9`}
            />
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            From
          </label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={`${inputClass} w-full`} />
        </div>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
            To
          </label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={`${inputClass} w-full`} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neutral-400" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-neutral-500 text-sm py-12 text-center border border-neutral-200 bg-white">
          No orders match your filters.
        </p>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto bg-white">
          <p className="text-[10px] text-neutral-400 px-4 py-2 border-b border-neutral-100">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <th className="text-left p-4">Order</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">Total</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/admin/orders/${o.id}`);
                    }
                  }}
                  className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer focus:outline-none focus:bg-neutral-50"
                  aria-label={`View order ${o.order_number}`}
                >
                  <td className="p-4 font-bold text-xs">{o.order_number}</td>
                  <td className="p-4 text-xs">
                    {o.first_name} {o.last_name}
                    <span className="block text-[10px] text-neutral-400">{o.email}</span>
                  </td>
                  <td className="p-4 text-xs font-bold">{formatPrice(Number(o.total))}</td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-1 ${STATUS_STYLE[o.status] ?? "bg-neutral-100"}`}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] text-neutral-500">
                    {new Date(o.created_at).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
