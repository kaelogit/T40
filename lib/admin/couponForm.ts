export type CouponFormInput = {
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_discount: number | null;
  min_order: number;
  max_uses: number | null;
  active: boolean;
  /** datetime-local string, e.g. 2026-12-31T23:59 */
  expires_at: string | null;
};

/** Convert ISO from DB to value for `<input type="datetime-local" />` (local time). */
export function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert datetime-local input to ISO for Supabase. */
export function datetimeLocalToIso(value: string): string {
  return new Date(value).toISOString();
}

export function formatCouponExpiry(iso: string | null): string {
  if (!iso) return "No expiry";
  return new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function isCouponExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function validateCouponForm(input: CouponFormInput): string | null {
  if (!input.code.trim()) return "Coupon code is required.";
  if (!/^[A-Za-z0-9_-]+$/.test(input.code.trim())) {
    return "Code may only contain letters, numbers, hyphens, and underscores.";
  }
  if (input.discount_value <= 0) return "Discount value must be greater than zero.";
  if (input.discount_type === "percent" && input.discount_value > 100) {
    return "Percent discount cannot exceed 100%.";
  }
  if (input.min_order < 0) return "Minimum order cannot be negative.";
  if (input.max_uses != null && input.max_uses < 1) {
    return "Usage limit must be at least 1.";
  }
  if (input.max_discount != null && input.max_discount <= 0) {
    return "Max discount amount must be greater than zero.";
  }
  if (input.expires_at) {
    const expiry = new Date(input.expires_at);
    if (Number.isNaN(expiry.getTime())) {
      return "Expiration date is invalid.";
    }
  }
  return null;
}

export function couponFormToRow(input: CouponFormInput) {
  return {
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() || null,
    discount_type: input.discount_type,
    discount_value: input.discount_value,
    max_discount:
      input.discount_type === "percent" && input.max_discount != null
        ? input.max_discount
        : null,
    min_order: input.min_order,
    max_uses: input.max_uses,
    active: input.active,
    expires_at: input.expires_at ? datetimeLocalToIso(input.expires_at) : null,
  };
}

export function rowToCouponForm(row: Record<string, unknown>): CouponFormInput {
  return {
    code: (row.code as string) ?? "",
    description: (row.description as string | null) ?? null,
    discount_type: (row.discount_type as "percent" | "fixed") ?? "percent",
    discount_value: Number(row.discount_value) || 0,
    max_discount: row.max_discount != null ? Number(row.max_discount) : null,
    min_order: Number(row.min_order) || 0,
    max_uses: row.max_uses != null ? Number(row.max_uses) : null,
    active: row.active !== false,
    expires_at: row.expires_at ? isoToDatetimeLocal(row.expires_at as string) : null,
  };
}
