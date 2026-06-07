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
} from "@/lib/products/variants";
import {
  getVariantWithProduct,
  resolveVariantByLegacyLine,
} from "@/lib/products/variants.server";
import { effectiveInStock } from "@/lib/products/stock";
import { isSaleActive } from "@/lib/products/sale";
import { isUuid } from "@/lib/products/urls";
import type { CheckoutAddress, CheckoutCartItem, CheckoutCustomer } from "@/types/order";

function generateOrderNumber(): string {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `T40-${suffix}`;
}

async function getDb() {
  return hasAdminClient() ? createAdminClient() : await createClient();
}

async function resolveProductLine(productId: string, sizeLabel: string) {
  const variant = await resolveVariantByLegacyLine(productId, sizeLabel);
  if (!variant) return null;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (!product) return null;
  return { variant, product, variantId: variant.id };
}

async function resolveLineItem(item: CheckoutCartItem) {
  const candidateVariantId = item.variantId ?? (isUuid(item.id) ? item.id : null);

  if (candidateVariantId) {
    const resolved = await getVariantWithProduct(candidateVariantId);
    if (resolved) {
      const { variant, product } = resolved;
      return { variant, product, variantId: variant.id };
    }

    // Older cart lines used product UUID as id when variants were not loaded client-side.
    const byProductId = await resolveProductLine(candidateVariantId, item.size?.trim() ?? "");
    if (byProductId) return byProductId;

    return { error: `Variant not found for ${item.name}.` as const };
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

export async function validateAndPriceItems(items: CheckoutCartItem[]) {
  const supabase = await createClient();
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
    let lineName = lineDisplayName(product.name, variant.label);

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
    const unitPrice = variantEffectivePrice(variant, onSale);
    const compareAt = variantCompareAtPrice(variant, onSale, unitPrice);

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    priced.push({
      id: variantId,
      variantId,
      productId: product.id,
      name: lineName,
      price: unitPrice,
      compareAtPrice: compareAt ?? undefined,
      image: product.images?.[0] ?? item.image,
      quantity: item.quantity,
      size: isGiftSet ? "Gift set" : variant.label.trim() || undefined,
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
      variant_id: item.variantId ?? (isUuid(item.id) ? item.id : null),
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
