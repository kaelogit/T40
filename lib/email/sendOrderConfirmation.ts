import { Resend } from "resend";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/products/pricing";
import { getSiteUrl } from "@/lib/utils";
import { parseBundleDetails, isGiftSetLine } from "@/lib/orders/bundleDetails";

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  coupon_code: string | null;
  status: string;
  city: string;
  state: string;
};

type ItemRow = {
  product_name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  compare_at_price?: number | null;
  line_total: number;
  bundle_details?: unknown;
};

function formatLineUnitPrice(item: ItemRow): string {
  const unit = Number(item.unit_price);
  const compare = item.compare_at_price != null ? Number(item.compare_at_price) : null;
  if (compare != null && compare > unit) {
    return `<span style="text-decoration:line-through;color:#999;margin-right:6px;">${formatPrice(compare)}</span><span style="color:#d94625;font-weight:bold;">${formatPrice(unit)}</span>`;
  }
  return formatPrice(unit);
}

function giftSetEmailBlock(bundle: ReturnType<typeof parseBundleDetails>): string {
  if (!bundle?.includes?.length) return "";
  const list = bundle.includes.map((name) => `<li style="margin:2px 0;">${name}</li>`).join("");
  const unavailable =
    bundle.unavailable && bundle.unavailable.length > 0
      ? `<p style="margin:6px 0 0;font-size:12px;color:#b45309;">Temporarily unavailable: ${bundle.unavailable.join(", ")}</p>`
      : "";
  return `
    <p style="margin:6px 0 0;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.08em;color:#92400e;">Gift set</p>
    <ul style="margin:4px 0 0;padding-left:18px;font-size:13px;color:#555;line-height:1.5;">${list}</ul>
    ${unavailable}`;
}

function buildOrderEmailHtml(order: OrderRow, items: ItemRow[], shopUrl: string): string {
  const itemRows = items
    .map((item) => {
      const bundle = parseBundleDetails(item.bundle_details);
      const sizeLabel =
        item.size && !isGiftSetLine(item.size) ? ` · ${item.size}` : isGiftSetLine(item.size) ? " · Gift set" : "";
      const unitLabel = formatLineUnitPrice(item);
      const lineCompare =
        item.compare_at_price != null &&
        Number(item.compare_at_price) > Number(item.unit_price)
          ? `<span style="text-decoration:line-through;color:#999;font-size:12px;display:block;">${formatPrice(Number(item.compare_at_price) * item.quantity)}</span>`
          : "";
      const linePriceColor =
        item.compare_at_price != null &&
        Number(item.compare_at_price) > Number(item.unit_price)
          ? "color:#d94625;"
          : "color:#111;";
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-family:sans-serif;font-size:14px;color:#111;">
          ${item.product_name}${sizeLabel} × ${item.quantity} @ ${unitLabel}
          ${giftSetEmailBlock(bundle)}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;font-family:sans-serif;font-size:14px;text-align:right;vertical-align:top;${linePriceColor}font-weight:bold;">
          ${lineCompare}${formatPrice(Number(item.line_total))}
        </td>
      </tr>`;
    })
    .join("");

  const discount =
    Number(order.discount_amount) > 0
      ? `<p style="margin:0 0 8px;font-family:sans-serif;font-size:14px;color:#666;">
          Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}: −${formatPrice(Number(order.discount_amount))}
        </p>`
      : "";

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#fff;border:1px solid #e5e5e5;">
          <tr>
            <td style="padding:32px 32px 16px;font-family:Georgia,serif;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#d94625;font-weight:bold;">T40 Perfumes</p>
              <h1 style="margin:0;font-size:24px;font-weight:900;text-transform:uppercase;color:#111;">Order confirmed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;font-family:sans-serif;font-size:15px;color:#444;line-height:1.6;">
              Hi ${order.first_name},<br><br>
              Thank you for your order. We have received your payment and are preparing your fragrances for delivery to ${order.city}, ${order.state}.
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px;">
              <p style="margin:0;font-family:sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Order ${order.order_number}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
              ${discount}
              <p style="margin:16px 0 0;font-family:sans-serif;font-size:18px;font-weight:bold;color:#111;">
                Total: ${formatPrice(Number(order.total))}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <a href="${shopUrl}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;font-family:sans-serif;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none;">
                Continue shopping
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#fafafa;border-top:1px solid #eee;font-family:sans-serif;font-size:12px;color:#888;">
              Questions? Reply to this email or visit our store.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "T40 Perfumes <orders@t40perfumes.com>";

  if (!apiKey) {
    return { ok: false, skipped: true };
  }

  if (!hasAdminClient()) {
    return { ok: false, error: "Admin client not configured." };
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, first_name, last_name, total, subtotal, discount_amount, coupon_code, status, city, state, confirmation_email_sent_at"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return { ok: false, error: "Order not found." };
  }

  if (order.status !== "paid") {
    return { ok: false, error: "Order is not paid." };
  }

  if (order.confirmation_email_sent_at) {
    return { ok: true, skipped: true };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, size, quantity, unit_price, compare_at_price, line_total, bundle_details")
    .eq("order_id", orderId);

  const shopUrl = `${getSiteUrl()}/shop`;
  const html = buildOrderEmailHtml(order as OrderRow, (items ?? []) as ItemRow[], shopUrl);

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: order.email,
      subject: `Order confirmed — ${order.order_number} | T40 Perfumes`,
      html,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    await supabase
      .from("orders")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", orderId);

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    return { ok: false, error: message };
  }
}
