import Link from "next/link";

export const metadata = {
  title: "Careers | T40 Perfumes",
  description: "Work with T40 Perfumes — current openings and how to get in touch.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-t40-white">
      <section className="t40-container px-4 md:px-8 pt-16 lg:pt-24 pb-20 lg:pb-32 max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-4 font-heading">
          The House
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-t40-black uppercase tracking-tighter font-heading mb-6">
          Careers
        </h1>
        <p className="text-t40-grey font-body text-base leading-relaxed mb-6">
          We are not hiring for full-time roles at the moment. When positions open up,
          we will post them here and on our social channels.
        </p>
        <p className="text-t40-grey font-body text-base leading-relaxed mb-10">
          If you would like to introduce yourself for future opportunities — retail,
          creative, operations, or partnerships — send a short note and your CV to{" "}
          <a
            href="mailto:hello@t40perfumes.com"
            className="text-t40-black underline underline-offset-2 hover:text-[#d94625]"
          >
            hello@t40perfumes.com
          </a>
          .
        </p>
        <Link
          href="/contact"
          className="inline-block bg-t40-black text-t40-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] font-heading hover:bg-[#d94625] transition-colors"
        >
          Contact us
        </Link>
      </section>
    </div>
  );
}
