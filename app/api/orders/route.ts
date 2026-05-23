import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { validateCheckout } from "@/lib/validations/checkout";
import {
  applyCouponToOrder,
  createOrderRecord,
  validateAndPriceItems,
} from "@/lib/orders/createOrder";
import type { CreateOrderPayload } from "@/types/order";

export async function POST(request: Request) {
  try {
    if (!hasAdminClient()) {
      return NextResponse.json(
        { error: "Checkout is not configured. Add SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreateOrderPayload;

    const validationError = validateCheckout(
      body.customer,
      body.address,
      body.items ?? []
    );
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const priced = await validateAndPriceItems(body.items);
    if ("error" in priced) {
      return NextResponse.json({ error: priced.error }, { status: 400 });
    }

    const couponResult = await applyCouponToOrder(body.couponCode, priced.subtotal);
    if ("error" in couponResult) {
      return NextResponse.json({ error: couponResult.error }, { status: 400 });
    }

    const created = await createOrderRecord(
      body.customer,
      body.address,
      priced.priced,
      priced.subtotal,
      couponResult.total,
      couponResult.discountAmount > 0
        ? {
            couponCode: couponResult.couponCode,
            discountAmount: couponResult.discountAmount,
          }
        : undefined
    );

    if ("error" in created) {
      return NextResponse.json({ error: created.error }, { status: 500 });
    }

    return NextResponse.json({
      orderId: created.order.id,
      orderNumber: created.order.order_number,
      total: Number(created.order.total),
      email: created.order.email,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
