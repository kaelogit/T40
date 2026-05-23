"use client";

import type { CheckoutAddress } from "@/types/order";

export const CHECKOUT_COUNTRY_NIGERIA = "Nigeria";
export const CHECKOUT_COUNTRY_OTHER = "Other";

type Props = {
  value: CheckoutAddress;
  onChange: (value: CheckoutAddress) => void;
};

const inputClass =
  "w-full border border-neutral-200 px-4 py-3 text-sm font-heading focus:outline-none focus:border-t40-black transition-colors";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey mb-2";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

export function isNigeriaCheckout(country: string): boolean {
  return country === CHECKOUT_COUNTRY_NIGERIA;
}

export default function ShippingForm({ value, onChange }: Props) {
  const isNigeria = isNigeriaCheckout(value.country);

  const set = (field: keyof CheckoutAddress, v: string) =>
    onChange({ ...value, [field]: v });

  const setCountry = (country: string) => {
    onChange({
      ...value,
      country,
      state: country === CHECKOUT_COUNTRY_NIGERIA ? value.state : "",
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="country">
          Country
        </label>
        <select
          id="country"
          required
          value={value.country}
          onChange={(e) => setCountry(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value={CHECKOUT_COUNTRY_NIGERIA}>Nigeria</option>
          <option value={CHECKOUT_COUNTRY_OTHER}>Other countries</option>
        </select>
        <p className="mt-2 text-xs text-t40-grey font-body leading-relaxed">
          {isNigeria
            ? "Nigerian orders pay with Paystack (card, bank transfer, USSD)."
            : "International orders pay with Stripe (card). Prices are in Naira (₦)."}
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="addressLine1">
          Street address
        </label>
        <input
          id="addressLine1"
          type="text"
          required
          autoComplete="address-line1"
          value={value.addressLine1}
          onChange={(e) => set("addressLine1", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="addressLine2">
          Apartment, suite, etc. (optional)
        </label>
        <input
          id="addressLine2"
          type="text"
          autoComplete="address-line2"
          value={value.addressLine2 ?? ""}
          onChange={(e) => set("addressLine2", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="city">
            City
          </label>
          <input
            id="city"
            type="text"
            required
            autoComplete="address-level2"
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="state">
            {isNigeria ? "State" : "State / Province / Region"}
          </label>
          {isNigeria ? (
            <select
              id="state"
              required
              value={value.state}
              onChange={(e) => set("state", e.target.value)}
              className={`${inputClass} bg-white`}
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="state"
              type="text"
              required
              autoComplete="address-level1"
              value={value.state}
              onChange={(e) => set("state", e.target.value)}
              className={inputClass}
              placeholder="e.g. California, Ontario"
            />
          )}
        </div>
      </div>
    </div>
  );
}
