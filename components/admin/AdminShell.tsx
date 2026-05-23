"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 text-neutral-700 hover:text-black"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-heading text-lg font-black uppercase tracking-tighter">T40 Perfumes Admin</span>
        <span className="w-9" aria-hidden />
      </header>

      {open && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="lg:hidden absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 bg-white border border-neutral-200 text-neutral-700 hover:text-black"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <AdminSidebar email={email} onNavigate={() => setOpen(false)} />
      </div>

      <main className="flex-1 p-4 pt-16 lg:p-10 lg:pt-10 overflow-x-auto min-w-0">{children}</main>
    </div>
  );
}
