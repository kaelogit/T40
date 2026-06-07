"use client";

import { CreditCard, Lock } from "lucide-react";
import PaystackButton from "./PaystackButton";
import { formatPrice } from "@/lib/products/pricing";
import { isNigeriaCheckout } from "@/lib/checkout/countries";
import { Button } from "@/components/ui/Button";

type Props = {
  total: number;
  country: string;
  disabled?: boolean;
  onPaystack: () => Promise<void>;
  onStripe: () => Promise<void>;
  stripeLoading?: boolean;
  onUsePaystack?: () => void;
  onBackToDelivery?: () => void;
};

export default function PaymentStep({
  total,
  country,
  disabled,
  onPaystack,
  onStripe,
  stripeLoading,
  onUsePaystack,
  onBackToDelivery,
}: Props) {
  const isNigeria = isNigeriaCheckout(country);
  const stripeEnabled = process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_ENABLED === "true";

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
            International card payments via Stripe are <strong className="text-t40-black">coming soon</strong>.
            For now, checkout with Paystack — available for Nigeria delivery addresses.
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
      ) : stripeEnabled ? (
        <button
          type="button"
          onClick={onStripe}
          disabled={disabled || stripeLoading}
          className="w-full flex items-center justify-center gap-2 bg-t40-black text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors disabled:opacity-50"
        >
          <CreditCard size={16} />
          {stripeLoading ? "Redirecting..." : "Pay with Stripe"}
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className="w-full flex items-center justify-center gap-2 border border-t40-light bg-t40-light/40 text-t40-grey py-4 px-6 text-[11px] font-bold uppercase tracking-[0.2em] font-heading cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <Lock size={16} className="shrink-0" />
            Pay with Stripe — Coming soon
          </div>

          {onUsePaystack && (
            <Button
              type="button"
              className="w-full"
              onClick={onUsePaystack}
            >
              Use Paystack (Nigeria)
            </Button>
          )}

          {onBackToDelivery && (
            <button
              type="button"
              onClick={onBackToDelivery}
              className="w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors py-2"
            >
              ← Back to delivery address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
