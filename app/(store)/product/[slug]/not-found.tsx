import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ProductNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
        Not found
      </p>
      <h1 className="text-3xl md:text-4xl font-black text-t40-black uppercase tracking-tighter font-heading mb-4">
        Fragrance unavailable
      </h1>
      <p className="text-t40-grey text-sm max-w-md mb-8 font-body">
        This product may have been removed or the link is incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button href="/shop">Browse shop</Button>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] font-heading border border-t40-black/20 hover:border-t40-black transition-colors"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
