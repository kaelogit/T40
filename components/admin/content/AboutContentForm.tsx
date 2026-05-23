"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import type { AboutContent } from "@/lib/content/types";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

export default function AboutContentForm() {
  const router = useRouter();
  const [form, setForm] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content/about")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) setForm(d.content);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-neutral-400" />
      </div>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/content/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save.");
    } else {
      setMessage("About page saved.");
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-12">
      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Hero</h2>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            value={form.hero.eyebrow}
            onChange={(e) => setForm({ ...form, hero: { ...form.hero, eyebrow: e.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Title (use \n for line break)</label>
          <textarea
            rows={2}
            value={form.hero.title}
            onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <textarea
            rows={3}
            value={form.hero.subtitle}
            onChange={(e) => setForm({ ...form, hero: { ...form.hero, subtitle: e.target.value } })}
            className={inputClass}
          />
        </div>
        <SingleImageUploader
          label="Hero background image"
          image={form.hero.imageUrl}
          onChange={(url) => setForm({ ...form, hero: { ...form.hero, imageUrl: url } })}
        />
      </section>

      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Origin story</h2>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            value={form.origin.eyebrow}
            onChange={(e) =>
              setForm({ ...form, origin: { ...form.origin, eyebrow: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <textarea
            rows={2}
            value={form.origin.title}
            onChange={(e) =>
              setForm({ ...form, origin: { ...form.origin, title: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Paragraphs (one per line block)</label>
          <textarea
            rows={8}
            value={form.origin.paragraphs.join("\n\n")}
            onChange={(e) =>
              setForm({
                ...form,
                origin: {
                  ...form.origin,
                  paragraphs: e.target.value.split("\n\n").filter(Boolean),
                },
              })
            }
            className={inputClass}
          />
        </div>
      </section>

      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Awards section</h2>
        <div>
          <label className={labelClass}>Eyebrow</label>
          <input
            value={form.awards.eyebrow}
            onChange={(e) =>
              setForm({ ...form, awards: { ...form.awards, eyebrow: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <textarea
            rows={2}
            value={form.awards.title}
            onChange={(e) =>
              setForm({ ...form, awards: { ...form.awards, title: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            rows={3}
            value={form.awards.description}
            onChange={(e) =>
              setForm({ ...form, awards: { ...form.awards, description: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Award highlights (one per line)</label>
          <textarea
            rows={5}
            value={(form.awards.highlights ?? []).join("\n")}
            onChange={(e) =>
              setForm({
                ...form,
                awards: {
                  ...form.awards,
                  highlights: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            placeholder="Award-winning perfumes — UK & USA"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Featured product slugs (comma-separated)</label>
          <input
            value={form.awards.productSlugs.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                awards: {
                  ...form.awards,
                  productSlugs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            placeholder="revenge, sweet-noble, 24th-oud"
            className={inputClass}
          />
          <p className="text-[10px] text-neutral-400 mt-1">
            Images and names pull from your product catalog when available.
          </p>
        </div>
      </section>

      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Values</h2>
        <div>
          <label className={labelClass}>Section title</label>
          <input
            value={form.values.title}
            onChange={(e) =>
              setForm({ ...form, values: { ...form.values, title: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        {form.values.items.map((item, i) => (
          <div key={i} className="border border-neutral-200 p-4 space-y-2">
            <input
              value={item.title}
              onChange={(e) => {
                const items = [...form.values.items];
                items[i] = { ...items[i], title: e.target.value };
                setForm({ ...form, values: { ...form.values, items } });
              }}
              placeholder="Value title"
              className={inputClass}
            />
            <textarea
              rows={2}
              value={item.body}
              onChange={(e) => {
                const items = [...form.values.items];
                items[i] = { ...items[i], body: e.target.value };
                setForm({ ...form, values: { ...form.values, items } });
              }}
              placeholder="Description"
              className={inputClass}
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Timeline</h2>
        {form.milestones.items.map((m, i) => (
          <div key={i} className="grid sm:grid-cols-[100px_1fr] gap-3">
            <input
              value={m.year}
              onChange={(e) => {
                const items = [...form.milestones.items];
                items[i] = { ...items[i], year: e.target.value };
                setForm({ ...form, milestones: { ...form.milestones, items } });
              }}
              className={inputClass}
            />
            <input
              value={m.label}
              onChange={(e) => {
                const items = [...form.milestones.items];
                items[i] = { ...items[i], label: e.target.value };
                setForm({ ...form, milestones: { ...form.milestones, items } });
              }}
              className={inputClass}
            />
          </div>
        ))}
      </section>

      <section className="space-y-4 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Bottom call-to-action</h2>
        <input
          value={form.cta.title}
          onChange={(e) => setForm({ ...form, cta: { ...form.cta, title: e.target.value } })}
          placeholder="Title"
          className={inputClass}
        />
        <textarea
          rows={2}
          value={form.cta.description}
          onChange={(e) => setForm({ ...form, cta: { ...form.cta, description: e.target.value } })}
          placeholder="Description"
          className={inputClass}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            value={form.cta.primaryLabel}
            onChange={(e) =>
              setForm({ ...form, cta: { ...form.cta, primaryLabel: e.target.value } })
            }
            placeholder="Primary button label"
            className={inputClass}
          />
          <input
            value={form.cta.primaryHref}
            onChange={(e) =>
              setForm({ ...form, cta: { ...form.cta, primaryHref: e.target.value } })
            }
            placeholder="Primary button link"
            className={inputClass}
          />
          <input
            value={form.cta.secondaryLabel}
            onChange={(e) =>
              setForm({ ...form, cta: { ...form.cta, secondaryLabel: e.target.value } })
            }
            placeholder="Secondary button label"
            className={inputClass}
          />
          <input
            value={form.cta.secondaryHref}
            onChange={(e) =>
              setForm({ ...form, cta: { ...form.cta, secondaryHref: e.target.value } })
            }
            placeholder="Secondary button link"
            className={inputClass}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save about page"}
      </button>
    </form>
  );
}
