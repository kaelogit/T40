"use client";

import { CreditCard } from "lucide-react";
import PaystackButton from "./PaystackButton";
import { formatPrice } from "@/lib/products/pricing";
import { isNigeriaCheckout } from "./ShippingForm";

type Props = {
  total: number;
  country: string;
  disabled?: boolean;
  onPaystack: () => Promise<void>;
  onStripe: () => Promise<void>;
  stripeLoading?: boolean;
};

export default function PaymentStep({
  total,
  country,
  disabled,
  onPaystack,
  onStripe,
  stripeLoading,
}: Props) {
  const isNigeria = isNigeriaCheckout(country);

  return (
    <div className="space-y-6">
      <p className="text-sm text-t40-grey font-body leading-relaxed">
        {isNigeria ? (
          <>
            Pay securely in Naira with <strong className="text-t40-black">Paystack</strong> —
            cards, bank transfer, and USSD.
          </>
        ) : (
          <>
            Pay securely with <strong className="text-t40-black">Stripe</strong> using your
            international card. Amount is charged in Naira (₦).
          </>
        )}
      </p>

      <div className="p-4 border border-t40-light bg-white">
        <p className="text-[10px] font-bold uppercase tracking-widest text-t40-grey font-heading mb-1">
          Amount due
        </p>
        <p className="text-2xl font-black font-heading text-t40-black">{formatPrice(total)}</p>
      </div>

      {isNigeria ? (
        <PaystackButton disabled={disabled} onPay={onPaystack} />
      ) : (
        <button
          type="button"
          onClick={onStripe}
          disabled={disabled || stripeLoading}
          className="w-full flex items-center justify-center gap-2 bg-t40-black text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors disabled:opacity-50"
        >
          <CreditCard size={16} />
          {stripeLoading ? "Redirecting..." : "Pay with Stripe"}
        </button>
      )}
    </div>
  );
}
