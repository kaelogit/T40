"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/content/types";

export default function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/content/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const importDefaults = async () => {
    setImporting(true);
    await fetch("/api/admin/content/blog", { method: "PUT" });
    load();
    setImporting(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    setDeleting(id);
    await fetch(`/api/admin/content/blog/${id}`, { method: "DELETE" });
    setPosts((p) => p.filter((x) => x.id !== id));
    setDeleting(null);
  };

  const needsImport = posts.length > 0 && posts.every((p) => !p.id);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Blog</h1>
        <div className="flex gap-3">
          {needsImport && (
            <button
              type="button"
              onClick={importDefaults}
              disabled={importing}
              className="border border-neutral-300 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-black disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import default posts"}
            </button>
          )}
          <Link
            href="/admin/content/blog/new"
            className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625]"
          >
            New post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="space-y-4">
          <p className="text-neutral-500 text-sm">No blog posts in the database yet.</p>
          <button
            type="button"
            onClick={importDefaults}
            disabled={importing}
            className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
          >
            Import default posts
          </button>
        </div>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Status</th>
                <th className="p-4 w-24" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id ?? p.slug} className="border-b border-neutral-100">
                  <td className="p-4">
                    <p className="font-bold text-xs">{p.title}</p>
                    <p className="text-[10px] text-neutral-400">{p.slug}</p>
                  </td>
                  <td className="p-4 text-xs">{p.category}</td>
                  <td className="p-4 text-xs">{p.publishedAt}</td>
                  <td className="p-4">
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-1 ${
                        p.published === false
                          ? "bg-neutral-100 text-neutral-500"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {p.published === false ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.id ? (
                      <div className="flex gap-2">
                        <Link href={`/admin/content/blog/${p.id}`} className="p-2 hover:bg-neutral-200">
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(p.id!)}
                          disabled={deleting === p.id}
                          className="p-2 hover:bg-red-100 text-red-600"
                        >
                          {deleting === p.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-neutral-400">Import first</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
