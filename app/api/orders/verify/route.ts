import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { getStripe } from "@/lib/stripe";
import { fulfillCheckoutIntent } from "@/lib/orders/checkoutIntent";
import { markOrderPaid } from "@/lib/orders/markOrderPaid";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDER_SELECT =
  "id, order_number, status, total, email, first_name, created_at";

async function fetchOrderWithItems(supabase: ReturnType<typeof createAdminClient>, orderId: string) {
  const { data: order } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, size, quantity, unit_price, compare_at_price, line_total, bundle_details")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return { order, items: items ?? [] };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutIntentId = searchParams.get("checkoutIntentId");
  const orderId = searchParams.get("orderId");
  const provider = searchParams.get("provider");
  const reference = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");

  if (!checkoutIntentId && !orderId) {
    return NextResponse.json({ error: "Checkout or order ID required." }, { status: 400 });
  }

  if (!hasAdminClient()) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  const supabase = createAdminClient();

  // Legacy: pending orders created before checkout-intent flow
  if (orderId && !checkoutIntentId) {
    if (provider === "paystack" && reference) {
      const verified = await verifyPaystackTransaction(reference);
      if (verified.ok && verified.checkoutIntentId) {
        await fulfillCheckoutIntent(verified.checkoutIntentId, reference);
      } else if (verified.ok) {
        await markOrderPaid(orderId, reference);
      }
    }

    if (provider === "stripe" && sessionId) {
      const stripe = getStripe();
      if (stripe) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === "paid") {
          const intentId = session.metadata?.checkout_intent_id;
          if (intentId) {
            await fulfillCheckoutIntent(intentId, sessionId);
          } else {
            await markOrderPaid(orderId, sessionId);
          }
        }
      }
    }

    const result = await fetchOrderWithItems(supabase, orderId);
    if (!result) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json(result);
  }

  // New flow: fulfill checkout intent after payment
  if (!checkoutIntentId) {
    return NextResponse.json({ error: "Checkout ID required." }, { status: 400 });
  }

  let paymentVerified = false;

  if (provider === "paystack" && reference) {
    const verified = await verifyPaystackTransaction(reference);
    paymentVerified = verified.ok && verified.checkoutIntentId === checkoutIntentId;
  }

  if (provider === "stripe" && sessionId) {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentVerified =
        session.payment_status === "paid" &&
        session.metadata?.checkout_intent_id === checkoutIntentId;
    }
  }

  if (paymentVerified) {
    const result = await fulfillCheckoutIntent(
      checkoutIntentId,
      reference ?? sessionId ?? undefined
    );
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } else {
    // Idempotent reload: intent may already be fulfilled
    const { data: intent } = await supabase
      .from("checkout_intents")
      .select("order_id, status")
      .eq("id", checkoutIntentId)
      .maybeSingle();

    if (!intent?.order_id) {
      return NextResponse.json({
        order: {
          id: checkoutIntentId,
          order_number: "Pending",
          status: "pending",
          total: 0,
          email: "",
          first_name: "",
        },
        pendingPayment: true,
      });
    }
  }

  const { data: intentRow } = await supabase
    .from("checkout_intents")
    .select("order_id")
    .eq("id", checkoutIntentId)
    .maybeSingle();

  const resolvedOrderId = intentRow?.order_id;
  if (!resolvedOrderId) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const result = await fetchOrderWithItems(supabase, resolvedOrderId);
  if (!result) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json(result);
}
