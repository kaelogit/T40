"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { CheckoutAddress, CheckoutCustomer } from "@/types/order";
import GuestForm from "./GuestForm";
import ShippingForm from "./ShippingForm";
import { CHECKOUT_COUNTRY_NIGERIA } from "@/lib/checkout/countries";
import PaymentStep from "./PaymentStep";
import OrderSummary from "./OrderSummary";
import CouponInput, { type AppliedCoupon } from "./CouponInput";
import { Button } from "@/components/ui/Button";

const STEPS = ["Details", "Delivery", "Payment"] as const;

const emptyCustomer: CheckoutCustomer = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
};

const emptyAddress: CheckoutAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: CHECKOUT_COUNTRY_NIGERIA,
};

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, cartTotal } = useCart();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState<CheckoutCustomer>(emptyCustomer);
  const [address, setAddress] = useState<CheckoutAddress>(emptyAddress);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);

  const cancelled = searchParams.get("cancelled");
  const discount = appliedCoupon?.discountAmount ?? 0;
  const orderTotal = Math.max(0, cartTotal - discount);

  useEffect(() => {
    if (cart.length === 0 && !redirectingToPayment) {
      router.replace("/cart");
    }
  }, [cart.length, redirectingToPayment, router]);

  if (cart.length === 0 && !redirectingToPayment) {
    return null;
  }

  const handlePaystack = async () => {
    setError(null);
    setRedirectingToPayment(true);
    try {
      const payRes = await fetch("/api/checkout/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          address,
          items: cart,
          couponCode: appliedCoupon?.code,
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error ?? "Paystack failed.");
      }
      if (!payData.authorizationUrl) {
        throw new Error(
          "Paystack did not return a payment link. Check PAYSTACK_SECRET_KEY on the server."
        );
      }
      // Keep cart until payment succeeds — clearing here races with checkout redirect.
      window.location.assign(payData.authorizationUrl);
    } catch (err) {
      setRedirectingToPayment(false);
      setError(err instanceof Error ? err.message : "Payment failed.");
    }
  };

  const handleStripe = async () => {
    setStripeLoading(true);
    setError(null);
    setRedirectingToPayment(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          address,
          items: cart,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Stripe failed.");
      }
      if (!data.url) {
        throw new Error("Stripe did not return a checkout link.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setRedirectingToPayment(false);
      setError(err instanceof Error ? err.message : "Payment failed.");
      setStripeLoading(false);
    }
  };

  const goNext = () => {
    setError(null);
    if (step === 0) {
      if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
        setError("Please complete your contact details.");
        return;
      }
    }
    if (step === 1) {
      if (!address.addressLine1 || !address.city || !address.state || !address.country) {
        setError("Please complete your delivery address.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="t40-container px-4 md:px-8 py-8 lg:py-12">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey hover:text-t40-black transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to cart
        </Link>

        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
            Secure checkout
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading">
            Checkout
          </h1>
        </div>

        {cancelled && (
          <p className="mb-6 p-4 border border-amber-200 bg-amber-50 text-sm text-amber-900 font-body">
            Payment was cancelled. You can try again below.
          </p>
        )}

        {error && (
          <p className="mb-6 p-4 border border-red-200 bg-red-50 text-sm text-red-800 font-body">
            {error}
          </p>
        )}

        <div className="flex gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`flex-1 text-center py-2 text-[10px] font-bold uppercase tracking-widest font-heading border-b-2 ${
                i === step
                  ? "border-t40-black text-t40-black"
                  : i < step
                    ? "border-[#d94625] text-[#d94625]"
                    : "border-t40-light text-t40-grey"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            {step === 0 && (
              <section>
                <h2 className="text-lg font-black font-heading uppercase tracking-wider text-t40-black mb-6">
                  Contact details
                </h2>
                <GuestForm value={customer} onChange={setCustomer} />
              </section>
            )}

            {step === 1 && (
              <section>
                <h2 className="text-lg font-black font-heading uppercase tracking-wider text-t40-black mb-6">
                  Delivery address
                </h2>
                <ShippingForm value={address} onChange={setAddress} subtotal={orderTotal} />
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="text-lg font-black font-heading uppercase tracking-wider text-t40-black mb-6">
                  Payment
                </h2>
                <PaymentStep
                  total={orderTotal}
                  country={address.country}
                  disabled={redirectingToPayment || stripeLoading}
                  onPaystack={handlePaystack}
                  onStripe={handleStripe}
                  stripeLoading={stripeLoading}
                  onUsePaystack={() => {
                    setAddress((a) => ({ ...a, country: CHECKOUT_COUNTRY_NIGERIA }));
                    setError(null);
                  }}
                  onBackToDelivery={() => {
                    setStep(1);
                    setError(null);
                  }}
                />
              </section>
            )}

            {step < 2 && (
              <div className="mt-8 flex gap-3">
                {step > 0 && (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                <Button onClick={goNext} className="flex items-center gap-2">
                  Continue
                  <ArrowRight size={14} />
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <CouponInput
              subtotal={cartTotal}
              applied={appliedCoupon}
              onApply={setAppliedCoupon}
              onClear={() => setAppliedCoupon(null)}
            />
            <OrderSummary
              items={cart}
              subtotal={cartTotal}
              discount={discount}
              couponCode={appliedCoupon?.code}
              total={orderTotal}
              state={address.state}
              country={address.country}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
