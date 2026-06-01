export const CHECKOUT_COUNTRY_NIGERIA = "Nigeria";
export const CHECKOUT_COUNTRY_OTHER = "Other";

export function isNigeriaCheckout(country: string): boolean {
  return country === CHECKOUT_COUNTRY_NIGERIA;
}
