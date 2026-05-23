import Link from "next/link";
import type { LegalPageContent } from "@/lib/content/legal";

type Props = {
  content: LegalPageContent;
};

export default function LegalPageContent({ content }: Props) {
  return (
    <div className="min-h-screen bg-t40-white">
      <section className="t40-container px-4 md:px-8 pt-16 lg:pt-24 pb-12 lg:pb-16">
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading">
            {content.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading mb-6">
            {content.title}
          </h1>
          <p className="text-t40-grey font-body text-base leading-relaxed mb-4">{content.intro}</p>
          <p className="text-[11px] text-t40-grey/80 font-heading uppercase tracking-widest">
            Last updated: {content.lastUpdated}
          </p>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 pb-20 lg:pb-32 max-w-3xl">
        <div className="space-y-10">
          {content.sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-sm font-black uppercase tracking-wider font-heading text-t40-black mb-4">
                {section.title}
              </h2>
              <div className="space-y-4 text-sm text-t40-grey font-body leading-relaxed">
                {section.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-2">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-t40-light flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-widest font-heading">
          <Link href="/terms" className="text-t40-grey hover:text-t40-black transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-t40-grey hover:text-t40-black transition-colors">
            Privacy Policy
          </Link>
          <Link href="/shipping" className="text-t40-grey hover:text-t40-black transition-colors">
            Shipping & Returns
          </Link>
          <Link href="/contact" className="text-[#d94625] hover:text-t40-black transition-colors">
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}
