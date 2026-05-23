"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  disabled?: boolean;
  onPay: () => Promise<void>;
};

export default function PaystackButton({ disabled, onPay }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onPay();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 bg-[#00C3F7] hover:bg-[#00a8d6] text-white py-4 px-6 text-[11px] font-bold uppercase tracking-[0.2em] font-heading transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Processing...
        </>
      ) : (
        <>Pay with Paystack</>
      )}
    </button>
  );
}
