import Image from "next/image";
import ContactForm, { ContactSidebar } from "@/components/contact/ContactForm";
import { getContactContent } from "@/lib/content/contact";

export const metadata = {
  title: "Contact | T40 Perfumes",
  description: "Get in touch with T40 Perfumes — orders, product questions, wholesale, and press.",
};

export default async function ContactPage() {
  const content = await getContactContent();

  return (
    <div className="min-h-screen bg-t40-white">
      <section className="relative min-h-[40vh] flex items-end overflow-hidden">
        <Image
          src={content.hero.imageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-t40-black/90 via-t40-black/40 to-transparent" />
        <div className="relative t40-container px-4 md:px-8 pb-12 pt-24 w-full">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-3 font-heading">
            {content.hero.eyebrow}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-t40-white uppercase tracking-tighter font-heading">
            {content.hero.title}
          </h1>
        </div>
      </section>

      <section className="t40-container px-4 md:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20">
          <div className="lg:col-span-5">
            <ContactSidebar content={content.sidebar} />
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-xl font-black uppercase tracking-wider font-heading text-t40-black mb-2">
              {content.form.heading}
            </h2>
            <p className="text-sm text-t40-grey font-body mb-8 leading-relaxed">{content.form.intro}</p>
            <ContactForm content={content.form} />
          </div>
        </div>
      </section>
    </div>
  );
}
