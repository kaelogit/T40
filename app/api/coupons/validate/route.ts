import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons/validateCoupon";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = (await request.json()) as {
      code?: string;
      subtotal?: number;
    };

    if (!code?.trim()) {
      return NextResponse.json({ error: "Enter a coupon code." }, { status: 400 });
    }

    if (typeof subtotal !== "number" || subtotal <= 0) {
      return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
    }

    const result = await validateCoupon(code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      code: result.coupon.code,
      discountAmount: result.coupon.discountAmount,
      description: result.coupon.description,
      total: Math.max(0, subtotal - result.coupon.discountAmount),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
