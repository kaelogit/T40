import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CouponDiscount = {
  code: string;
  discountAmount: number;
  description: string | null;
};

async function getCouponClient() {
  return hasAdminClient() ? createAdminClient() : await createClient();
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ ok: true; coupon: CouponDiscount } | { ok: false; error: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: false, error: "Enter a coupon code." };
  }

  const supabase = await getCouponClient();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select(
      "code, description, discount_type, discount_value, max_discount, min_order, max_uses, used_count, active, expires_at"
    )
    .eq("code", normalized)
    .maybeSingle();

  if (error || !coupon) {
    return { ok: false, error: "Invalid coupon code." };
  }

  if (!coupon.active) {
    return { ok: false, error: "This coupon is no longer active." };
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "This coupon has expired." };
  }

  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }

  const minOrder = Number(coupon.min_order);
  if (subtotal < minOrder) {
    return {
      ok: false,
      error: `Minimum order of ${new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(minOrder)} required.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discount_type === "percent") {
    discountAmount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
    const maxDiscount = coupon.max_discount != null ? Number(coupon.max_discount) : null;
    if (maxDiscount != null && maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, maxDiscount);
    }
  } else {
    discountAmount = Math.min(subtotal, Number(coupon.discount_value));
  }

  if (discountAmount <= 0) {
    return { ok: false, error: "Coupon does not apply to this order." };
  }

  return {
    ok: true,
    coupon: {
      code: coupon.code,
      discountAmount,
      description: coupon.description,
    },
  };
}

export async function incrementCouponUsage(code: string) {
  const { createAdminClient, hasAdminClient } = await import("@/lib/supabase/admin");
  const supabase = hasAdminClient() ? createAdminClient() : await createClient();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("used_count")
    .eq("code", code)
    .maybeSingle();

  if (!coupon) return;

  await supabase
    .from("coupons")
    .update({ used_count: (coupon.used_count ?? 0) + 1 })
    .eq("code", code);
}
