import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getSocialLinks } from "@/lib/site/social";
import { SHOP_COLLECTIONS, shopCollectionHref } from "@/lib/shop/collections";

const SHOP_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "T40 Exclusives", href: "/shop/t40-exclusives", accent: true },
  ...SHOP_COLLECTIONS.map(({ label, slug }) => ({
    label,
    href: shopCollectionHref(slug),
  })),
  { label: "Shop by Scent", href: "/shop/scent" },
];

const SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping & Returns", href: "/shipping" },
];

const COMPANY_LINKS = [
  { label: "About T40", href: "/about" },
  { label: "Journal", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const SOCIAL_ABBR: Record<string, string> = {
  Instagram: "IG",
  TikTok: "TT",
  X: "X",
};

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-black font-heading leading-none">
      {SOCIAL_ABBR[label] ?? label.charAt(0)}
    </span>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const socialLinks = getSocialLinks();

  return (
    <footer className="w-full bg-t40-black text-t40-white">
      {/* Accent rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d94625] to-transparent opacity-60" />

      <div className="t40-container px-4 md:px-8 pt-16 pb-10 lg:pt-24 lg:pb-14">
        {/* Brand + featured */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 mb-16 lg:mb-20">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="inline-flex w-fit" aria-label="T40 Perfumes home">
              <Image
                src="/t40-logo.png"
                alt="T40 Perfumes"
                width={240}
                height={80}
                className="h-14 w-auto md:h-16 lg:h-20 object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-t40-white/55 leading-relaxed max-w-sm">
              Luxury fragrances for everyday wear. Hand-picked scents, house-made exclusives, and
              delivery across Nigeria.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="flex h-10 w-10 items-center justify-center border border-t40-white/15 text-t40-white/70 hover:border-[#d94625] hover:text-[#d94625] transition-colors"
                  >
                    <SocialIcon label={link.label} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <Link
              href="/shop/t40-exclusives"
              className="group relative block overflow-hidden border border-[#d94625]/30 bg-[#d94625]/[0.07] p-8 md:p-10 transition-colors hover:border-[#d94625]/60 hover:bg-[#d94625]/[0.12]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#d94625]/10 blur-3xl rounded-full pointer-events-none" />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] font-heading text-[#d94625] mb-3">
                T40 Exclusives
              </p>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter font-heading text-t40-white mb-3 max-w-md">
                Fragrances made in-house
              </h2>
              <p className="text-sm text-t40-white/55 max-w-lg mb-6 leading-relaxed">
                Hair perfumes, body mists, and signature blends you will not find anywhere else.
              </p>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-white group-hover:text-[#d94625] transition-colors">
                Explore the collection
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 lg:gap-12 mb-10 lg:mb-12">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] font-heading text-t40-white/40 mb-6">
              Shop
            </h4>
            <ul className="space-y-4">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-xs font-bold uppercase tracking-widest font-heading transition-colors hover:text-[#d94625] ${
                      link.accent ? "text-[#d94625]" : "text-t40-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] font-heading text-t40-white/40 mb-6">
              Customer Care
            </h4>
            <ul className="space-y-4">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs font-bold uppercase tracking-widest font-heading text-t40-white/80 hover:text-[#d94625] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] font-heading text-t40-white/40 mb-6">
              The House
            </h4>
            <ul className="space-y-4">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-bold uppercase tracking-widest font-heading text-t40-white/80 hover:text-[#d94625] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/35">
            © {currentYear} T40 Perfumes. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/terms"
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/35 hover:text-[#d94625] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/35 hover:text-[#d94625] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/shipping"
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/35 hover:text-[#d94625] transition-colors"
            >
              Shipping
            </Link>
            <a
              href="mailto:hello@t40perfumesng.com"
              className="text-[9px] font-bold uppercase tracking-widest font-heading text-t40-white/35 hover:text-[#d94625] transition-colors"
            >
              hello@t40perfumesng.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
