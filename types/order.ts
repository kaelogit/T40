export type OrderStatus = "pending" | "paid" | "delivered" | "cancelled" | "failed";

/** Admin may only mark delivered — payment sets paid automatically. */
export const ADMIN_ORDER_STATUSES: OrderStatus[] = ["delivered"];

export type PaymentProvider = "paystack" | "stripe";

export type CheckoutCustomer = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
};

export type CheckoutAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
};

export type CheckoutCartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  variantId?: string;
  productId?: string;
  /** Included perfume names when line is a gift set */
  bundleIncludes?: string[];
  /** Gift set items temporarily unavailable */
  bundleUnavailable?: string[];
  bundlePartial?: boolean;
};

export type CreateOrderPayload = {
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  items: CheckoutCartItem[];
  couponCode?: string;
};

export type OrderRecord = {
  id: string;
  order_number: string;
  status: OrderStatus;
  email: string;
  first_name: string;
  last_name: string;
  subtotal: number;
  total: number;
  currency: string;
  created_at: string;
};
