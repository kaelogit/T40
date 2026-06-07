import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validateCoupon, incrementCouponUsage } from "@/lib/coupons/validateCoupon";
import { getGiftSetContents, formatGiftSetLineName } from "@/lib/products/giftSets";
import { computeGiftSetAvailability } from "@/lib/products/giftSetAvailability";
import {
  lineDisplayName,
  parseLegacyCartLineId,
  variantCompareAtPrice,
  variantEffectivePrice,
  mapVariant,
  getDefaultVariant,
  type ProductVariant,
  type VariantRow,
} from "@/lib/products/variants";
import { effectiveInStock } from "@/lib/products/stock";
import { isSaleActive } from "@/lib/products/sale";
import { isUuid } from "@/lib/products/urls";
import type { CheckoutAddress, CheckoutCartItem, CheckoutCustomer } from "@/types/order";

type ResolvedLineItem = {
  variant: ProductVariant | null;
  product: Record<string, unknown> & { id: string; name: string; price: number | string; sale_price?: number | string | null; images?: string[] | null; product_type?: string | null; category?: string | null; stock_quantity?: number | null; on_sale?: boolean | null; sale_ends_at?: string | null };
  variantId: string | null;
};

function generateOrderNumber(): string {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `T40-${suffix}`;
}

async function getDb() {
  return hasAdminClient() ? createAdminClient() : await createClient();
}

/** Checkout uses service role when available — avoids RLS gaps on variants during payment. */
async function getCheckoutDb() {
  return getDb();
}

async function loadVariantForProduct(
  productId: string,
  sizeLabel: string
): Promise<ProductVariant | null> {
  const supabase = await getCheckoutDb();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const variants = ((data as VariantRow[]) ?? []).map(mapVariant);
  if (!variants.length) return null;

  const normalizedSize = sizeLabel.trim();
  if (normalizedSize && normalizedSize !== "default") {
    const match = variants.find(
      (v) =>
        v.label === normalizedSize ||
        v.label.replace(/\s/g, "") === normalizedSize.replace(/\s/g, "")
    );
    if (match) return match;
  }

  return getDefaultVariant(variants);
}

async function loadVariantWithProduct(variantId: string): Promise<ResolvedLineItem | null> {
  const supabase = await getCheckoutDb();
  const { data: variantRow } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .eq("is_active", true)
    .maybeSingle();

  if (!variantRow) return null;

  const variant = mapVariant(variantRow as VariantRow);
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", variant.product_id)
    .maybeSingle();

  if (!product) return null;
  return { variant, product, variantId: variant.id };
}

async function resolveProductLine(
  productId: string,
  sizeLabel: string
): Promise<ResolvedLineItem | null> {
  const supabase = await getCheckoutDb();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return null;

  const variant = await loadVariantForProduct(productId, sizeLabel);
  return { variant, product, variantId: variant?.id ?? null };
}

async function resolveLineItem(item: CheckoutCartItem): Promise<ResolvedLineItem | { error: string }> {
  const candidateVariantId = item.variantId ?? (isUuid(item.id) ? item.id : null);

  if (candidateVariantId) {
    const byVariant = await loadVariantWithProduct(candidateVariantId);
    if (byVariant) return byVariant;

    const byProductId = await resolveProductLine(candidateVariantId, item.size?.trim() ?? "");
    if (byProductId) return byProductId;

    return { error: `Product not found: ${item.name}` as const };
  }

  const legacy = parseLegacyCartLineId(item.id);
  if (legacy) {
    const resolved = await resolveProductLine(legacy.productId, legacy.sizeLabel);
    if (resolved) return resolved;
    return { error: `Product not found: ${item.name}` as const };
  }

  if (item.productId && isUuid(item.productId)) {
    const resolved = await resolveProductLine(item.productId, item.size?.trim() ?? "");
    if (resolved) return resolved;
  }

  return { error: "Invalid product in cart." as const };
}

function productLevelPrice(
  product: ResolvedLineItem["product"],
  onSale: boolean
): { unitPrice: number; compareAt: number | null } {
  const base = Number(product.price);
  const unitPrice =
    onSale && product.sale_price != null && Number(product.sale_price) > 0
      ? Number(product.sale_price)
      : base;
  const compareAt =
    onSale && product.sale_price != null && unitPrice < base
      ? base
      : unitPrice < base
        ? base
        : null;
  return { unitPrice, compareAt };
}

export async function validateAndPriceItems(items: CheckoutCartItem[]) {
  const supabase = await getCheckoutDb();
  const priced: CheckoutCartItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    const resolved = await resolveLineItem(item);
    if ("error" in resolved) {
      return { error: resolved.error };
    }

    const { variant, product, variantId } = resolved;

    if (!effectiveInStock(product)) {
      return { error: `${product.name} is out of stock.` as const };
    }

    if (product.stock_quantity != null && product.stock_quantity < item.quantity) {
      return {
        error: `Only ${product.stock_quantity} left of ${product.name}.` as const,
      };
    }

    const isGiftSet =
      product.product_type === "gift_set" || product.category === "gift-sets";

    let bundleIncludes: string[] | undefined = item.bundleIncludes;
    let bundleUnavailable: string[] | undefined;
    let bundlePartial: boolean | undefined;
    let lineName = variant
      ? lineDisplayName(product.name, variant.label)
      : item.size && item.size !== "default"
        ? lineDisplayName(product.name, item.size)
        : product.name;

    if (isGiftSet) {
      const contents = await getGiftSetContents(supabase, product.id);
      if (contents.length < 2) {
        return { error: `${product.name} is not configured as a valid gift set.` as const };
      }
      const availability = computeGiftSetAvailability(contents);
      if (!availability.canPurchase) {
        return {
          error: `Only ${availability.available} of ${availability.total} fragrances available in ${product.name}.` as const,
        };
      }
      bundleIncludes = availability.availableNames;
      bundleUnavailable =
        availability.unavailableNames.length > 0 ? availability.unavailableNames : undefined;
      bundlePartial = availability.isPartial || undefined;
      lineName = formatGiftSetLineName(
        product.name,
        availability.availableNames.map((name) => ({ name }))
      );
    }

    const onSale = isSaleActive(product);
    const { unitPrice, compareAt } = variant
      ? {
          unitPrice: variantEffectivePrice(variant, onSale),
          compareAt: variantCompareAtPrice(variant, onSale, variantEffectivePrice(variant, onSale)),
        }
      : productLevelPrice(product, onSale);

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    priced.push({
      id: variantId ?? product.id,
      variantId: variantId ?? undefined,
      productId: product.id,
      name: lineName,
      price: unitPrice,
      compareAtPrice: compareAt ?? undefined,
      image: product.images?.[0] ?? item.image,
      quantity: item.quantity,
      size: isGiftSet ? "Gift set" : variant?.label.trim() || item.size || undefined,
      bundleIncludes,
      bundleUnavailable,
      bundlePartial,
    });
  }

  return { priced, subtotal, total: subtotal };
}

export async function createOrderRecord(
  customer: CheckoutCustomer,
  address: CheckoutAddress,
  pricedItems: CheckoutCartItem[],
  subtotal: number,
  total: number,
  options?: {
    couponCode?: string;
    discountAmount?: number;
    status?: "pending" | "paid";
    paymentProvider?: "paystack" | "stripe";
    paymentReference?: string;
  }
) {
  const supabase = await getDb();
  const orderNumber = generateOrderNumber();
  const discountAmount = options?.discountAmount ?? 0;
  const couponCode = options?.couponCode?.trim().toUpperCase() || null;
  const status = options?.status ?? "pending";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status,
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      first_name: customer.firstName.trim(),
      last_name: customer.lastName.trim(),
      address_line1: address.addressLine1.trim(),
      address_line2: address.addressLine2?.trim() || null,
      city: address.city.trim(),
      state: address.state.trim(),
      country: address.country.trim() || "Nigeria",
      subtotal,
      total,
      discount_amount: discountAmount,
      coupon_code: couponCode,
      currency: "NGN",
      payment_provider: options?.paymentProvider ?? null,
      payment_reference: options?.paymentReference ?? null,
    })
    .select("id, order_number, total, email")
    .single();

  if (orderError || !order) {
    return { error: orderError?.message ?? "Failed to create order." };
  }

  const orderItems = pricedItems.map((item) => {
    const bundleDetails =
      item.bundleIncludes && item.bundleIncludes.length > 0
        ? {
            includes: item.bundleIncludes,
            ...(item.bundleUnavailable?.length
              ? { unavailable: item.bundleUnavailable, partial: item.bundlePartial ?? true }
              : {}),
          }
        : null;
    return {
      order_id: order.id,
      product_id: item.productId ?? null,
      variant_id: item.variantId ?? null,
      product_name: item.name,
      product_image: item.image,
      size: item.size ?? null,
      quantity: item.quantity,
      unit_price: item.price,
      compare_at_price: item.compareAtPrice ?? null,
      line_total: item.price * item.quantity,
      bundle_details: bundleDetails,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: itemsError.message };
  }

  if (couponCode) {
    await incrementCouponUsage(couponCode);
  }

  return { order };
}

export async function applyCouponToOrder(
  couponCode: string | undefined,
  subtotal: number
): Promise<
  | { discountAmount: number; couponCode?: string; total: number }
  | { error: string }
> {
  if (!couponCode?.trim()) {
    return { discountAmount: 0, total: subtotal };
  }

  const result = await validateCoupon(couponCode, subtotal);
  if (!result.ok) {
    return { error: result.error };
  }

  const discountAmount = result.coupon.discountAmount;
  const total = Math.max(0, subtotal - discountAmount);

  return {
    discountAmount,
    couponCode: result.coupon.code,
    total,
  };
}
