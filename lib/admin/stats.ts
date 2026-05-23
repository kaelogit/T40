import { createAdminClient } from "@/lib/supabase/admin";
import { activeSaleOrFilter } from "@/lib/products/sale";

const REVENUE_STATUSES = ["paid", "delivered"] as const;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type DailyStat = { date: string; label: string; revenue: number; orders: number };

function buildLast7Days(
  revenueOrders: { total: number; created_at: string; status: string }[],
  allOrders: { created_at: string }[]
): DailyStat[] {
  const now = new Date();
  const days: DailyStat[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const dayStart = startOfDay(d).getTime();
    const dayEnd = dayStart + 86400000;

    const revenue = revenueOrders
      .filter((o) => {
        const t = new Date(o.created_at).getTime();
        return t >= dayStart && t < dayEnd;
      })
      .reduce((s, o) => s + Number(o.total), 0);

    const orders = allOrders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;

    days.push({
      date: key,
      label: d.toLocaleDateString("en-NG", { weekday: "short", day: "numeric" }),
      revenue,
      orders,
    });
  }
  return days;
}

function sumRevenue(
  orders: { total: number; created_at: string }[],
  since: Date
): number {
  const sinceMs = since.getTime();
  return orders
    .filter((o) => new Date(o.created_at).getTime() >= sinceMs)
    .reduce((sum, o) => sum + Number(o.total), 0);
}

export type CouponUsageRow = {
  id: string;
  code: string;
  used_count: number;
  max_uses: number | null;
  active: boolean;
  usesThisMonth: number;
  discountThisMonth: number;
};

export type AdminDashboardStats = {
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueAllTime: number;
  ordersToday: number;
  ordersThisMonth: number;
  ordersPaid: number;
  ordersDelivered: number;
  productsTotal: number;
  productsInStock: number;
  productsOutOfStock: number;
  productsOnSale: number;
  couponsActive: number;
  couponRedemptionsTotal: number;
  couponRedemptionsThisMonth: number;
  couponDiscountThisMonth: number;
  topCoupons: CouponUsageRow[];
  last7Days: DailyStat[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = createAdminClient();
  const now = new Date();

  const [
    { data: revenueOrders },
    { count: ordersPaid },
    { count: ordersDelivered },
    { count: productsTotal },
    { count: productsInStock },
    { count: productsOutOfStock },
    { count: productsOnSale },
    { data: recentOrders },
    { data: coupons },
    { data: couponOrders },
    { data: ordersLast7 },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total, created_at")
      .in("status", [...REVENUE_STATUSES]),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", [...REVENUE_STATUSES]),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .neq("in_stock", false),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("in_stock", false),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("on_sale", true)
      .or(activeSaleOrFilter(new Date().toISOString())),
    supabase.from("orders").select("created_at").gte("created_at", startOfDay(now).toISOString()),
    supabase.from("coupons").select("id, code, used_count, max_uses, active"),
    supabase
      .from("orders")
      .select("coupon_code, discount_amount, created_at")
      .in("status", [...REVENUE_STATUSES])
      .not("coupon_code", "is", null),
    supabase
      .from("orders")
      .select("created_at, status, total")
      .gte("created_at", new Date(now.getTime() - 7 * 86400000).toISOString()),
  ]);

  const paid = revenueOrders ?? [];
  const dayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const ordersToday = (recentOrders ?? []).length;

  const monthStartMs = monthStart.getTime();
  const couponOrdersThisMonth = (couponOrders ?? []).filter(
    (o) => new Date(o.created_at).getTime() >= monthStartMs
  );

  const usesByCode = new Map<string, { uses: number; discount: number }>();
  for (const order of couponOrdersThisMonth) {
    const code = (order.coupon_code as string).toUpperCase();
    const entry = usesByCode.get(code) ?? { uses: 0, discount: 0 };
    entry.uses += 1;
    entry.discount += Number(order.discount_amount) || 0;
    usesByCode.set(code, entry);
  }

  const topCoupons: CouponUsageRow[] = (coupons ?? [])
    .map((c) => {
      const month = usesByCode.get(c.code.toUpperCase());
      return {
        id: c.id,
        code: c.code,
        used_count: c.used_count,
        max_uses: c.max_uses,
        active: c.active,
        usesThisMonth: month?.uses ?? 0,
        discountThisMonth: month?.discount ?? 0,
      };
    })
    .sort((a, b) => b.usesThisMonth - a.usesThisMonth || b.used_count - a.used_count)
    .slice(0, 5);

  return {
    revenueToday: sumRevenue(paid, dayStart),
    revenueThisWeek: sumRevenue(paid, weekStart),
    revenueThisMonth: sumRevenue(paid, monthStart),
    revenueAllTime: paid.reduce((s, o) => s + Number(o.total), 0),
    ordersToday,
    ordersThisMonth: paid.filter((o) => new Date(o.created_at) >= monthStart).length,
    ordersPaid: ordersPaid ?? 0,
    ordersDelivered: ordersDelivered ?? 0,
    productsTotal: productsTotal ?? 0,
    productsInStock: productsInStock ?? 0,
    productsOutOfStock: productsOutOfStock ?? 0,
    productsOnSale: productsOnSale ?? 0,
    couponsActive: (coupons ?? []).filter((c) => c.active).length,
    couponRedemptionsTotal: (coupons ?? []).reduce((s, c) => s + (c.used_count ?? 0), 0),
    couponRedemptionsThisMonth: couponOrdersThisMonth.length,
    couponDiscountThisMonth: couponOrdersThisMonth.reduce(
      (s, o) => s + (Number(o.discount_amount) || 0),
      0
    ),
    topCoupons,
    last7Days: buildLast7Days(
      (ordersLast7 ?? []).filter((o) =>
        REVENUE_STATUSES.includes(o.status as (typeof REVENUE_STATUSES)[number])
      ),
      ordersLast7 ?? []
    ),
  };
}
