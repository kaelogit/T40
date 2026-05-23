"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import { nameToSlug } from "@/lib/products/slug";
import type { BlogPost } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

type Props = { postId?: string; initial?: BlogPost };

const emptyPost: Omit<BlogPost, "id"> = {
  slug: "",
  title: "",
  excerpt: "",
  coverImage: "",
  author: "T40 Editorial",
  publishedAt: new Date().toISOString().slice(0, 10),
  readMinutes: 5,
  category: "The House",
  body: "",
  published: true,
};

export default function BlogPostForm({ postId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...emptyPost, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      slug: form.slug.trim() || nameToSlug(form.title),
    };

    const url = postId ? `/api/admin/content/blog/${postId}` : "/api/admin/content/blog";
    const method = postId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      setSaving(false);
      return;
    }

    router.push("/admin/content/blog");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-6">
      <div>
        <label className={labelClass}>Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-from-title"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Excerpt</label>
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          className={inputClass}
        />
      </div>

      <SingleImageUploader
        label="Cover image"
        image={form.coverImage}
        onChange={(url) => set("coverImage", url)}
        folder="blog"
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Author</label>
          <input
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Publish date</label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => set("publishedAt", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Read time (min)</label>
          <input
            type="number"
            min={1}
            value={form.readMinutes}
            onChange={(e) => set("readMinutes", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Body</label>
        <p className="text-[10px] text-neutral-400 mb-2">
          Use blank lines between paragraphs. Start a line with ### for a subheading. Wrap text in
          **bold** for emphasis.
        </p>
        <textarea
          required
          rows={16}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          className={`${inputClass} font-mono text-xs`}
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.published !== false}
          onChange={(e) => set("published", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-bold">Published (visible on storefront)</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Saving...
          </span>
        ) : postId ? (
          "Update post"
        ) : (
          "Create post"
        )}
      </button>
    </form>
  );
}
