import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/admin/stats";
import { formatPrice } from "@/lib/products/pricing";
import DashboardCharts from "@/components/admin/DashboardCharts";

export const metadata = { title: "Dashboard | T40 Perfumes" };

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const revenueStats = [
    { label: "Revenue today", value: formatPrice(stats.revenueToday) },
    { label: "Revenue this week", value: formatPrice(stats.revenueThisWeek) },
    { label: "Revenue this month", value: formatPrice(stats.revenueThisMonth) },
    { label: "All-time revenue", value: formatPrice(stats.revenueAllTime) },
  ];

  const orderStats = [
    { label: "Orders today", value: stats.ordersToday, href: "/admin/orders" },
    { label: "Paid orders", value: stats.ordersPaid, href: "/admin/orders" },
    { label: "Delivered", value: stats.ordersDelivered ?? 0, href: "/admin/orders?status=delivered" },
    { label: "Orders this month", value: stats.ordersThisMonth, href: "/admin/orders" },
  ];

  const productStats = [
    { label: "Total products", value: stats.productsTotal, href: "/admin/products" },
    { label: "In stock", value: stats.productsInStock, href: "/admin/products" },
    { label: "Out of stock", value: stats.productsOutOfStock, href: "/admin/products" },
    { label: "On flash sale", value: stats.productsOnSale, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
      <p className="text-sm text-neutral-500 mb-10">
        Revenue counts paid and delivered orders only.
      </p>

      <DashboardCharts last7Days={stats.last7Days} />

      <section className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
          Revenue
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStats.map((s) => (
            <div key={s.label} className="border border-neutral-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                {s.label}
              </p>
              <p className="text-2xl font-black">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
          Orders
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {orderStats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="border border-neutral-200 bg-white p-6 hover:border-black transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                {s.label}
              </p>
              <p className="text-3xl font-black">{s.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
          Products
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {productStats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="border border-neutral-200 bg-white p-6 hover:border-black transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                {s.label}
              </p>
              <p className="text-3xl font-black">{s.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between gap-4 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Coupons
          </p>
          <Link
            href="/admin/coupons"
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black"
          >
            Manage coupons →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            href="/admin/coupons"
            className="border border-neutral-200 bg-white p-6 hover:border-black transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Active coupons
            </p>
            <p className="text-3xl font-black">{stats.couponsActive}</p>
          </Link>
          <div className="border border-neutral-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Redemptions this month
            </p>
            <p className="text-3xl font-black">{stats.couponRedemptionsThisMonth}</p>
          </div>
          <div className="border border-neutral-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              Discount given this month
            </p>
            <p className="text-2xl font-black">{formatPrice(stats.couponDiscountThisMonth)}</p>
          </div>
          <div className="border border-neutral-200 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
              All-time redemptions
            </p>
            <p className="text-3xl font-black">{stats.couponRedemptionsTotal}</p>
          </div>
        </div>

        {stats.topCoupons.length > 0 && (
          <div className="border border-neutral-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  <th className="text-left p-4">Code</th>
                  <th className="text-left p-4">Uses (month)</th>
                  <th className="text-left p-4">Discount (month)</th>
                  <th className="text-left p-4">Total uses</th>
                  <th className="text-left p-4">Limit</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCoupons.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100">
                    <td className="p-4">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="font-bold text-xs hover:text-[#d94625]"
                      >
                        {c.code}
                      </Link>
                      {!c.active && (
                        <span className="ml-2 text-[9px] uppercase text-neutral-400">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold">{c.usesThisMonth}</td>
                    <td className="p-4 text-xs">{formatPrice(c.discountThisMonth)}</td>
                    <td className="p-4 text-xs">{c.used_count}</td>
                    <td className="p-4 text-xs">{c.max_uses ?? "∞"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="border border-neutral-200 bg-white p-6 max-w-lg">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-4">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="bg-black text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#d94625] transition-colors"
          >
            Add product
          </Link>
          <Link
            href="/admin/coupons/new"
            className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black"
          >
            Add coupon
          </Link>
          <Link
            href="/admin/content"
            className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black"
          >
            Edit content
          </Link>
          <Link
            href="/admin/orders"
            className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black"
          >
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}
