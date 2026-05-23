"use client";

import type { CheckoutCustomer } from "@/types/order";

type Props = {
  value: CheckoutCustomer;
  onChange: (value: CheckoutCustomer) => void;
};

const inputClass =
  "w-full border border-neutral-200 px-4 py-3 text-sm font-heading focus:outline-none focus:border-t40-black transition-colors";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey mb-2";

export default function GuestForm({ value, onChange }: Props) {
  const set = (field: keyof CheckoutCustomer, v: string) =>
    onChange({ ...value, [field]: v });

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={value.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            required
            autoComplete="family-name"
            value={value.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          Phone (WhatsApp preferred)
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+234..."
          value={value.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
