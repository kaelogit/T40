import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { validateCheckout } from "@/lib/validations/checkout";
import {
  applyCouponToOrder,
  createOrderRecord,
  validateAndPriceItems,
} from "@/lib/orders/createOrder";
import { decrementProductStockForOrder } from "@/lib/orders/stock";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";
import type {
  CheckoutAddress,
  CheckoutCartItem,
  CheckoutCustomer,
  CreateOrderPayload,
  PaymentProvider,
} from "@/types/order";

const INTENT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export type CheckoutIntentRow = {
  id: string;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  priced_items: CheckoutCartItem[];
  subtotal: number;
  total: number;
  discount_amount: number;
  coupon_code: string | null;
  payment_provider: PaymentProvider | null;
  payment_reference: string | null;
  order_id: string | null;
  status: string;
  expires_at: string;
};

export async function prepareCheckoutIntent(payload: CreateOrderPayload) {
  if (!hasAdminClient()) {
    return { error: "Checkout is not configured." as const };
  }

  const validationError = validateCheckout(
    payload.customer,
    payload.address,
    payload.items ?? []
  );
  if (validationError) {
    return { error: validationError };
  }

  const priced = await validateAndPriceItems(payload.items);
  if ("error" in priced) {
    return { error: priced.error };
  }

  const couponResult = await applyCouponToOrder(payload.couponCode, priced.subtotal);
  if ("error" in couponResult) {
    return { error: couponResult.error };
  }

  const supabase = createAdminClient();
  const expiresAt = new Date(Date.now() + INTENT_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from("checkout_intents")
    .insert({
      customer: payload.customer,
      address: payload.address,
      priced_items: priced.priced,
      subtotal: priced.subtotal,
      total: couponResult.total,
      discount_amount: couponResult.discountAmount,
      coupon_code: couponResult.couponCode ?? null,
      expires_at: expiresAt,
    })
    .select("id, total")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not start checkout." };
  }

  return {
    intentId: data.id as string,
    total: Number(data.total),
    email: payload.customer.email.trim(),
  };
}

export async function getCheckoutIntent(intentId: string): Promise<CheckoutIntentRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("checkout_intents")
    .select("*")
    .eq("id", intentId)
    .maybeSingle();

  return (data as CheckoutIntentRow | null) ?? null;
}

export async function attachPaymentToIntent(
  intentId: string,
  provider: PaymentProvider,
  paymentReference: string
) {
  const supabase = createAdminClient();
  await supabase
    .from("checkout_intents")
    .update({
      payment_provider: provider,
      payment_reference: paymentReference,
    })
    .eq("id", intentId)
    .eq("status", "open");
}

export async function fulfillCheckoutIntent(
  intentId: string,
  paymentReference?: string
): Promise<
  | { order: { id: string; order_number: string; status: string; total: number; email: string; first_name: string } }
  | { error: string }
  | { alreadyFulfilled: true; orderId: string }
> {
  if (!hasAdminClient()) {
    return { error: "Checkout is not configured." };
  }

  const supabase = createAdminClient();
  const intent = await getCheckoutIntent(intentId);

  if (!intent) {
    return { error: "Checkout session not found." };
  }

  if (intent.status === "completed" && intent.order_id) {
    const { data: existing } = await supabase
      .from("orders")
      .select("id, order_number, status, total, email, first_name")
      .eq("id", intent.order_id)
      .maybeSingle();
    if (existing) {
      return { alreadyFulfilled: true, orderId: existing.id };
    }
  }

  if (intent.status !== "open") {
    return { error: "This checkout session is no longer valid." };
  }

  if (new Date(intent.expires_at).getTime() < Date.now()) {
    await supabase.from("checkout_intents").update({ status: "expired" }).eq("id", intentId);
    return { error: "Checkout session expired. Please try again." };
  }

  const created = await createOrderRecord(
    intent.customer as CheckoutCustomer,
    intent.address as CheckoutAddress,
    intent.priced_items as CheckoutCartItem[],
    Number(intent.subtotal),
    Number(intent.total),
    {
      couponCode: intent.coupon_code ?? undefined,
      discountAmount: Number(intent.discount_amount),
      status: "paid",
      paymentProvider: intent.payment_provider ?? undefined,
      paymentReference: paymentReference ?? intent.payment_reference ?? undefined,
    }
  );

  if ("error" in created) {
    return { error: created.error ?? "Failed to create order." };
  }

  await decrementProductStockForOrder(created.order.id);

  await supabase
    .from("checkout_intents")
    .update({
      status: "completed",
      order_id: created.order.id,
      payment_reference: paymentReference ?? intent.payment_reference,
    })
    .eq("id", intentId);

  await sendOrderConfirmationEmail(created.order.id);

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, total, email, first_name")
    .eq("id", created.order.id)
    .single();

  if (!order) {
    return { error: "Order created but could not be loaded." };
  }

  return { order };
}
