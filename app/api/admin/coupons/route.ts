import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  couponFormToRow,
  validateCouponForm,
  type CouponFormInput,
} from "@/lib/admin/couponForm";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

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
      .insert(row)
      .select("id, code")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A coupon with this code already exists." }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupon: data });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
