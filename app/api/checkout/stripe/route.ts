import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/utils";
import { prepareCheckoutIntent, attachPaymentToIntent, getCheckoutIntent } from "@/lib/orders/checkoutIntent";

export async function POST(request: Request) {
  if (process.env.STRIPE_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json(
      { error: "International card payments are not available yet. Please use Paystack (Nigeria)." },
      { status: 503 }
    );
  }

  try {
    if (!hasAdminClient()) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const body = (await request.json()) as Parameters<typeof prepareCheckoutIntent>[0];
    const prepared = await prepareCheckoutIntent(body);

    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }

    const intent = await getCheckoutIntent(prepared.intentId);
    if (!intent) {
      return NextResponse.json({ error: "Checkout session not found." }, { status: 500 });
    }

    const siteUrl = getSiteUrl();
    const session = await createStripeCheckoutSession({
      checkoutIntentId: prepared.intentId,
      email: prepared.email,
      items: intent.priced_items.map((item) => ({
        name: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmountNgn: Number(intent.total),
      successUrl: `${siteUrl}/order-confirmation/${prepared.intentId}?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1`,
    });

    if ("error" in session) {
      return NextResponse.json({ error: session.error }, { status: 500 });
    }

    await attachPaymentToIntent(prepared.intentId, "stripe", session.sessionId);

    return NextResponse.json({ url: session.url, intentId: prepared.intentId });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
