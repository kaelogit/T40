import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  couponFormToRow,
  rowToCouponForm,
  validateCouponForm,
  type CouponFormInput,
} from "@/lib/admin/couponForm";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ coupon: data, form: rowToCouponForm(data) });
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = (await request.json()) as CouponFormInput;
    const validationError = validateCouponForm(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createAdminClient();
    const row = couponFormToRow(body);

    const { data, error } = await supabase
      .from("coupons")
      .update(row)
      .eq("id", id)
      .select("id, code")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Code already in use." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupon: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
