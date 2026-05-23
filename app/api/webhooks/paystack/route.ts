import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { fulfillCheckoutIntent } from "@/lib/orders/checkoutIntent";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.json();
  const event = body?.event;
  const reference = body?.data?.reference as string | undefined;

  if (event !== "charge.success" || !reference) {
    return NextResponse.json({ received: true });
  }

  const verified = await verifyPaystackTransaction(reference);
  if (!verified.ok || !verified.checkoutIntentId) {
    return NextResponse.json({ received: true });
  }

  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  await fulfillCheckoutIntent(verified.checkoutIntentId, reference);

  return NextResponse.json({ received: true });
}
