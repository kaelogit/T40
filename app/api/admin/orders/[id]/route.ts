import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { type OrderStatus } from "@/types/order";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return NextResponse.json({ order, items: items ?? [] });
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { status } = (await request.json()) as { status?: OrderStatus };

  if (!status || status !== "delivered") {
    return NextResponse.json(
      { error: "Only marking as delivered is supported." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Only allow marking delivered from paid (or re-mark delivered)
  if (existing.status !== "paid" && existing.status !== "delivered") {
    return NextResponse.json(
      { error: "Only paid orders can be marked as delivered." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, order_number, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
