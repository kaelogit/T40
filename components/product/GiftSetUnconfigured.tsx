import Link from "next/link";

type Props = {
  productName: string;
  adminEditHref?: string;
};

export default function GiftSetUnconfigured({ productName, adminEditHref }: Props) {
  return (
    <section className="mt-8 border border-amber-300 bg-amber-50 p-6 lg:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-900 font-heading mb-2">
        Gift set not configured
      </p>
      <p className="text-sm text-amber-950 font-body leading-relaxed mb-3">
        <strong>{productName}</strong> is marked as a gift set, but no perfumes are linked yet — so
        customers cannot see what is included or buy it at checkout.
      </p>
      <p className="text-xs text-amber-900/80 font-body leading-relaxed">
        In admin, edit this gift set and select at least 2 perfumes under{" "}
        <strong>Gift set details</strong>, then save.
      </p>
      {adminEditHref && (
        <Link
          href={adminEditHref}
          className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest underline underline-offset-2 text-amber-950"
        >
          Open in admin →
        </Link>
      )}
    </section>
  );
}
