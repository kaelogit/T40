import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmationEmail } from "@/lib/email/sendOrderConfirmation";
import { decrementProductStockForOrder } from "@/lib/orders/stock";

/** Legacy: mark an old pending order as paid. New checkouts use fulfillCheckoutIntent. */
export async function markOrderPaid(
  orderId: string,
  paymentReference?: string
): Promise<{ updated: boolean }> {
  if (!hasAdminClient()) {
    return { updated: false };
  }

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payment_reference")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return { updated: false };
  }

  const wasPending = order.status === "pending";

  if (wasPending) {
    await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_reference: paymentReference ?? order.payment_reference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "pending");

    await decrementProductStockForOrder(orderId);
  } else if (paymentReference && order.payment_reference !== paymentReference) {
    await supabase
      .from("orders")
      .update({
        payment_reference: paymentReference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  await sendOrderConfirmationEmail(orderId);

  return { updated: wasPending || order.status === "paid" };
}
