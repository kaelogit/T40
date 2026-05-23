import type { CheckoutAddress, CheckoutCartItem, CheckoutCustomer } from "@/types/order";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateCheckout(
  customer: CheckoutCustomer,
  address: CheckoutAddress,
  items: CheckoutCartItem[]
): string | null {
  if (!items.length) return "Your cart is empty.";

  if (!customer.firstName.trim() || !customer.lastName.trim()) {
    return "Please enter your full name.";
  }
  if (!isValidEmail(customer.email)) return "Please enter a valid email address.";
  if (!customer.phone.trim() || customer.phone.trim().length < 7) {
    return "Please enter a valid phone number.";
  }

  if (!address.addressLine1.trim()) return "Please enter your delivery address.";
  if (!address.city.trim()) return "Please enter your city.";
  if (!address.state.trim()) return "Please enter your state.";

  for (const item of items) {
    if (!item.name || item.quantity < 1 || item.price < 0) {
      return "Invalid cart item.";
    }
  }

  return null;
}
