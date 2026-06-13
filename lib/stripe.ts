import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export type StripeCheckoutItem = {
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

export type StripeCheckoutParams = {
  checkoutIntentId: string;
  email: string;
  items: StripeCheckoutItem[];
  /** Final amount to charge (after coupons) — must match checkout intent total. */
  totalAmountNgn: number;
  successUrl: string;
  cancelUrl: string;
};

/** Scale line items so Stripe charges exactly `totalAmountNgn` (coupon-safe). */
export function buildStripeLineItems(items: StripeCheckoutItem[], totalAmountNgn: number) {
  if (!items.length || totalAmountNgn <= 0) return [];

  const rawSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (rawSubtotal <= 0) return [];

  const scale = totalAmountNgn / rawSubtotal;
  let allocated = 0;

  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const lineTotalNgn = isLast
      ? totalAmountNgn - allocated
      : Math.round(((item.unitPrice * item.quantity) / rawSubtotal) * totalAmountNgn);
    allocated += lineTotalNgn;

    const unitAmountKobo = Math.max(1, Math.round((lineTotalNgn / item.quantity) * 100));

    return {
      quantity: item.quantity,
      price_data: {
        currency: "ngn" as const,
        unit_amount: unitAmountKobo,
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
      },
    };
  });
}

export async function createStripeCheckoutSession(params: StripeCheckoutParams) {
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe is not configured." as const };

  const lineItems = buildStripeLineItems(params.items, params.totalAmountNgn);
  if (!lineItems.length) {
    return { error: "No billable items for checkout." as const };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: params.email,
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        checkout_intent_id: params.checkoutIntentId,
      },
    });

    if (!session.url) {
      return { error: "Stripe session URL missing." as const };
    }

    return { url: session.url, sessionId: session.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe checkout failed.";
    return { error: message };
  }
}

export async function verifyStripeCheckoutSession(
  sessionId: string,
  options?: { expectedIntentId?: string; expectedTotalNgn?: number }
) {
  const stripe = getStripe();
  if (!stripe) return { ok: false as const, error: "Stripe is not configured." };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return { ok: false as const, error: "Payment not completed." };
    }

    const checkoutIntentId = session.metadata?.checkout_intent_id;
    if (!checkoutIntentId) {
      return { ok: false as const, error: "Missing checkout intent metadata." };
    }

    if (options?.expectedIntentId && checkoutIntentId !== options.expectedIntentId) {
      return { ok: false as const, error: "Checkout intent mismatch." };
    }

    const amountNgn = (session.amount_total ?? 0) / 100;

    if (
      options?.expectedTotalNgn != null &&
      Math.abs(amountNgn - options.expectedTotalNgn) > 1
    ) {
      return { ok: false as const, error: "Payment amount mismatch." };
    }

    return {
      ok: true as const,
      checkoutIntentId,
      amount: amountNgn,
      sessionId: session.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe verification failed.";
    return { ok: false as const, error: message };
  }
}
