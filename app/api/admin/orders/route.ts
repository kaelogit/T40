import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_COLUMNS =
  "id, order_number, status, email, first_name, last_name, phone, total, subtotal, discount_amount, coupon_code, payment_provider, payment_reference, city, state, country, created_at";

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function ordersToCsv(
  orders: Record<string, unknown>[],
  itemsByOrder: Map<string, { product_name: string; size: string | null; quantity: number; unit_price: number; line_total: number }[]>
): string {
  const headers = [
    "order_number",
    "status",
    "email",
    "first_name",
    "last_name",
    "phone",
    "total",
    "subtotal",
    "discount_amount",
    "coupon_code",
    "payment_provider",
    "city",
    "state",
    "country",
    "created_at",
    "line_items",
  ];
  const rows = orders.map((o) => {
    const items = itemsByOrder.get(o.id as string) ?? [];
    const lineSummary = items
      .map(
        (i) =>
          `${i.product_name}${i.size ? ` (${i.size})` : ""} x${i.quantity} @ ${i.unit_price}`
      )
      .join("; ");
    return [
      o.order_number,
      o.status,
      o.email,
      o.first_name,
      o.last_name,
      o.phone,
      o.total,
      o.subtotal,
      o.discount_amount,
      o.coupon_code,
      o.payment_provider,
      o.city,
      o.state,
      o.country,
      o.created_at,
      lineSummary,
    ]
      .map((v) => escapeCsv(v as string | number | null | undefined))
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const email = searchParams.get("email")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const format = searchParams.get("format");
  const limit = Math.min(2000, Math.max(1, Number(searchParams.get("limit")) || 500));

  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status === "all") {
    // include everything
  } else if (status) {
    query = query.eq("status", status);
  } else {
    query = query.in("status", ["paid", "delivered"]);
  }
  if (email) {
    query = query.ilike("email", `%${email}%`);
  }
  if (from) {
    query = query.gte("created_at", `${from}T00:00:00.000Z`);
  }
  if (to) {
    query = query.lte("created_at", `${to}T23:59:59.999Z`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = data ?? [];

  if (format === "csv") {
    const orderIds = orders.map((o) => o.id as string);
    const itemsByOrder = new Map<
      string,
      { product_name: string; size: string | null; quantity: number; unit_price: number; line_total: number }[]
    >();

    if (orderIds.length) {
      const { data: items } = await supabase
        .from("order_items")
        .select("order_id, product_name, size, quantity, unit_price, line_total")
        .in("order_id", orderIds);

      for (const item of items ?? []) {
        const list = itemsByOrder.get(item.order_id) ?? [];
        list.push(item);
        itemsByOrder.set(item.order_id, list);
      }
    }

    const csv = ordersToCsv(orders as Record<string, unknown>[], itemsByOrder);
    const filename = `t40-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ orders });
}
