"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/admin");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-sm">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black"
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
      </button>
    </form>
  );
}
