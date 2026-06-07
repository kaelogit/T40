import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import {
  verifyPaystackTransaction,
  verifyPaystackWebhookSignature,
  type PaystackWebhookEvent,
} from "@/lib/paystack";
import { fulfillCheckoutIntent } from "@/lib/orders/checkoutIntent";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: PaystackWebhookEvent;
  try {
    body = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body?.event;
  const reference = body?.data?.reference;

  // Paystack sends many event types to one URL — we only act on successful charges.
  if (event !== "charge.success" || !reference) {
    return NextResponse.json({ received: true });
  }

  // Re-verify with Paystack API (amount, status, metadata) — not just the webhook payload.
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
