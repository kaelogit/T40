const PAYSTACK_BASE = "https://api.paystack.co";

import { createHmac, timingSafeEqual } from "crypto";

/** Verify `x-paystack-signature` against the raw webhook body (HMAC SHA512). */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string
): boolean {
  const sig = signature?.trim();
  if (!sig || !rawBody) return false;

  const hash = createHmac("sha512", secret).update(rawBody, "utf8").digest("hex");

  const expected = Buffer.from(hash, "utf8");
  const received = Buffer.from(sig, "utf8");
  if (expected.length !== received.length) return false;

  try {
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    id?: number;
    status?: string;
    metadata?: { checkout_intent_id?: string };
  };
};

export type PaystackInitParams = {
  email: string;
  amountNgn: number;
  reference: string;
  checkoutIntentId: string;
  callbackUrl: string;
};

export type PaystackInitResult =
  | { authorizationUrl: string; accessCode: string; reference: string }
  | { error: string };

export async function initializePaystackTransaction(
  params: PaystackInitParams
): Promise<PaystackInitResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return { error: "Paystack is not configured." };
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountNgn * 100),
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: {
        checkout_intent_id: params.checkoutIntentId,
      },
    }),
  });

  const json = await res.json();

  if (!res.ok || !json.status) {
    return { error: json.message ?? "Paystack initialization failed." };
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return { ok: false, error: "Paystack is not configured." };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    return { ok: false, error: json.message ?? "Verification failed." };
  }

  const success = json.data.status === "success";
  return {
    ok: success,
    checkoutIntentId: json.data.metadata?.checkout_intent_id as string | undefined,
    amount: json.data.amount / 100,
  };
}
