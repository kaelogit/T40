import Link from "next/link";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { getFaqCategories } from "@/lib/content/faq";

export const metadata = {
  title: "FAQ | T40 Perfumes",
  description:
    "Orders, shipping, payments, authenticity, and returns — everything you need to know about T40 Perfumes.",
};

export const revalidate = 60;

export default async function FaqPage() {
  const categories = await getFaqCategories();

  return (
    <div className="min-h-screen bg-t40-white">
      <section className="t40-container px-4 md:px-8 pt-16 lg:pt-24 pb-12 lg:pb-16">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading">
            Client Services
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-t40-grey font-body text-base leading-relaxed">
            Everything you need to know about ordering, wearing, and caring for your T40 fragrances.
            Can&apos;t find what you need?{" "}
            <Link href="/contact" className="text-t40-black underline underline-offset-2 hover:text-[#d94625]">
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 pb-20 lg:pb-32 max-w-3xl">
        <FaqAccordion categories={categories} />
      </section>

      <section className="bg-t40-light/50 border-t border-t40-light py-16">
        <div className="t40-container px-4 md:px-8 text-center">
          <p className="text-sm text-t40-grey font-body mb-6">Still have questions?</p>
          <Button href="/contact">Get in touch</Button>
        </div>
      </section>
    </div>
  );
}
