"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Ticket,
  FileText,
  LogOut,
  ExternalLink,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/subcategories", label: "Subcategories", icon: Layers },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/content", label: "Content", icon: FileText },
];

export default function AdminSidebar({
  email,
  onNavigate,
}: {
  email: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-neutral-200">
        <Link href="/admin" className="font-heading text-2xl font-black uppercase tracking-tighter">
          T40
        </Link>
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400 mt-1">
          Admin
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                active
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-200 space-y-3">
        <p className="text-[10px] text-neutral-500 truncate px-2">{email}</p>
        <a
          href={process.env.NEXT_PUBLIC_SITE_URL ?? "/"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black"
        >
          <ExternalLink size={14} />
          View store
        </a>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 w-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-[#d94625]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
