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

export type StripeCheckoutParams = {
  checkoutIntentId: string;
  email: string;
  items: { name: string; unitPrice: number; quantity: number; image?: string }[];
  successUrl: string;
  cancelUrl: string;
};

export async function createStripeCheckoutSession(params: StripeCheckoutParams) {
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe is not configured." as const };

  const lineItems = params.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "ngn" as const,
      unit_amount: Math.round(item.unitPrice * 100),
      product_data: {
        name: item.name,
        images: item.image ? [item.image] : undefined,
      },
    },
  }));

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
