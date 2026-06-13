import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { getStripe, verifyStripeCheckoutSession } from "@/lib/stripe";
import { fulfillCheckoutIntent, getCheckoutIntent } from "@/lib/orders/checkoutIntent";
import Stripe from "stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionId = session.id;

    if (!sessionId || !hasAdminClient()) {
      return NextResponse.json({ received: true });
    }

    const intent = session.metadata?.checkout_intent_id
      ? await getCheckoutIntent(session.metadata.checkout_intent_id)
      : null;

    const verified = await verifyStripeCheckoutSession(sessionId, {
      expectedIntentId: session.metadata?.checkout_intent_id,
      expectedTotalNgn: intent ? Number(intent.total) : undefined,
    });

    if (verified.ok) {
      await fulfillCheckoutIntent(verified.checkoutIntentId, verified.sessionId);
    }
  }

  return NextResponse.json({ received: true });
}
