import { NextResponse } from "next/server";
import { hasAdminClient } from "@/lib/supabase/admin";
import { initializePaystackTransaction } from "@/lib/paystack";
import { getSiteUrl } from "@/lib/utils";
import { prepareCheckoutIntent, attachPaymentToIntent } from "@/lib/orders/checkoutIntent";
import type { CreateOrderPayload } from "@/types/order";

export async function POST(request: Request) {
  try {
    if (!hasAdminClient()) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const body = (await request.json()) as CreateOrderPayload;
    const prepared = await prepareCheckoutIntent(body);

    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }

    const reference = `T40-${prepared.intentId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const siteUrl = getSiteUrl();

    const result = await initializePaystackTransaction({
      email: prepared.email,
      amountNgn: prepared.total,
      reference,
      checkoutIntentId: prepared.intentId,
      callbackUrl: `${siteUrl}/order-confirmation/${prepared.intentId}?provider=paystack`,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await attachPaymentToIntent(prepared.intentId, "paystack", result.reference);

    return NextResponse.json({
      authorizationUrl: result.authorizationUrl,
      accessCode: result.accessCode,
      reference: result.reference,
      intentId: prepared.intentId,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
