import Link from "next/link";
import { Megaphone, FileText, HelpCircle, Info, Mail, CalendarDays } from "lucide-react";

const SECTIONS = [
  {
    href: "/admin/content/announcement",
    label: "Announcement bar",
    description: "Top banner message and quick links on every page",
    icon: Megaphone,
  },
  {
    href: "/admin/content/events",
    label: "Events",
    description: "Pop-up shows, dates, venues, images, and ticket links",
    icon: CalendarDays,
  },
  {
    href: "/admin/content/blog",
    label: "Blog / Journal",
    description: "Articles with cover images and rich text",
    icon: FileText,
  },
  {
    href: "/admin/content/faq",
    label: "FAQ",
    description: "Questions and answers by category",
    icon: HelpCircle,
  },
  {
    href: "/admin/content/about",
    label: "About page",
    description: "Hero, story, awards, values, and timeline",
    icon: Info,
  },
  {
    href: "/admin/content/contact",
    label: "Contact page",
    description: "Hero, form copy, email, WhatsApp, and studio details",
    icon: Mail,
  },
];

export const metadata = { title: "Content | T40 Perfumes" };

export default function ContentHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Content</h1>
      <p className="text-sm text-neutral-500 mb-10">
        Edit storefront pages without touching code.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="border border-neutral-200 bg-white p-6 hover:border-black transition-colors group"
          >
            <Icon size={20} className="text-neutral-400 group-hover:text-[#d94625] mb-4" />
            <p className="text-sm font-black uppercase tracking-wider mb-2">{label}</p>
            <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
