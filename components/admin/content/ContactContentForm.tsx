"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import type { ContactContent } from "@/lib/content/types";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/types";

const labelClass =
  "block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2";
const inputClass =
  "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-black";

export default function ContactContentForm() {
  const router = useRouter();
  const [form, setForm] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content/contact")
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

    const res = await fetch("/api/admin/content/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Could not save.");
    } else {
      setMessage("Contact page saved.");
      router.refresh();
    }
    setSaving(false);
  };

  const updateSubject = (index: number, value: string) => {
    const subjectOptions = [...form.form.subjectOptions];
    subjectOptions[index] = value;
    setForm({ ...form, form: { ...form.form, subjectOptions } });
  };

  const addSubject = () => {
    setForm({
      ...form,
      form: { ...form.form, subjectOptions: [...form.form.subjectOptions, ""] },
    });
  };

  const removeSubject = (index: number) => {
    setForm({
      ...form,
      form: {
        ...form.form,
        subjectOptions: form.form.subjectOptions.filter((_, i) => i !== index),
      },
    });
  };

  const updateStudioLine = (index: number, value: string) => {
    const lines = [...form.sidebar.studio.lines];
    lines[index] = value;
    setForm({
      ...form,
      sidebar: { ...form.sidebar, studio: { ...form.sidebar.studio, lines } },
    });
  };

  const addStudioLine = () => {
    setForm({
      ...form,
      sidebar: {
        ...form.sidebar,
        studio: { ...form.sidebar.studio, lines: [...form.sidebar.studio.lines, ""] },
      },
    });
  };

  const removeStudioLine = (index: number) => {
    setForm({
      ...form,
      sidebar: {
        ...form.sidebar,
        studio: {
          ...form.sidebar.studio,
          lines: form.sidebar.studio.lines.filter((_, i) => i !== index),
        },
      },
    });
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
          <label className={labelClass}>Title</label>
          <input
            value={form.hero.title}
            onChange={(e) => setForm({ ...form, hero: { ...form.hero, title: e.target.value } })}
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
        <h2 className="text-sm font-black uppercase tracking-wider">Contact form</h2>
        <div>
          <label className={labelClass}>Heading</label>
          <input
            value={form.form.heading}
            onChange={(e) => setForm({ ...form, form: { ...form.form, heading: e.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Intro text</label>
          <textarea
            rows={3}
            value={form.form.intro}
            onChange={(e) => setForm({ ...form, form: { ...form.form, intro: e.target.value } })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subject options</label>
          <div className="space-y-2">
            {form.form.subjectOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={opt}
                  onChange={(e) => updateSubject(i, e.target.value)}
                  className={inputClass}
                  placeholder="Order inquiry"
                />
                <button
                  type="button"
                  onClick={() => removeSubject(i)}
                  className="p-2.5 border border-neutral-200 text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Remove subject"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSubject}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black"
            >
              <Plus size={14} />
              Add subject
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Success title</label>
          <input
            value={form.form.successTitle}
            onChange={(e) =>
              setForm({ ...form, form: { ...form.form, successTitle: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Success message</label>
          <textarea
            rows={2}
            value={form.form.successMessage}
            onChange={(e) =>
              setForm({ ...form, form: { ...form.form, successMessage: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </section>

      <section className="space-y-4 border-b border-neutral-200 pb-10">
        <h2 className="text-sm font-black uppercase tracking-wider">Sidebar — direct lines</h2>
        <div>
          <label className={labelClass}>Section eyebrow</label>
          <input
            value={form.sidebar.eyebrow}
            onChange={(e) =>
              setForm({ ...form, sidebar: { ...form.sidebar, eyebrow: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email label</label>
            <input
              value={form.sidebar.email.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  sidebar: {
                    ...form.sidebar,
                    email: { ...form.sidebar.email, label: e.target.value },
                  },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email address</label>
            <input
              type="email"
              value={form.sidebar.email.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  sidebar: {
                    ...form.sidebar,
                    email: { ...form.sidebar.email, address: e.target.value },
                  },
                })
              }
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>WhatsApp label</label>
            <input
              value={form.sidebar.whatsapp.label}
              onChange={(e) =>
                setForm({
                  ...form,
                  sidebar: {
                    ...form.sidebar,
                    whatsapp: { ...form.sidebar.whatsapp, label: e.target.value },
                  },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone display</label>
            <input
              value={form.sidebar.whatsapp.display}
              onChange={(e) =>
                setForm({
                  ...form,
                  sidebar: {
                    ...form.sidebar,
                    whatsapp: { ...form.sidebar.whatsapp, display: e.target.value },
                  },
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>WhatsApp link</label>
            <input
              value={form.sidebar.whatsapp.href}
              onChange={(e) =>
                setForm({
                  ...form,
                  sidebar: {
                    ...form.sidebar,
                    whatsapp: { ...form.sidebar.whatsapp, href: e.target.value },
                  },
                })
              }
              className={inputClass}
              placeholder="https://wa.me/234..."
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Studio label</label>
          <input
            value={form.sidebar.studio.label}
            onChange={(e) =>
              setForm({
                ...form,
                sidebar: {
                  ...form.sidebar,
                  studio: { ...form.sidebar.studio, label: e.target.value },
                },
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Studio address lines</label>
          <div className="space-y-2">
            {form.sidebar.studio.lines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={line}
                  onChange={(e) => updateStudioLine(i, e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeStudioLine(i)}
                  className="p-2.5 border border-neutral-200 text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Remove line"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addStudioLine}
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:text-black"
            >
              <Plus size={14} />
              Add line
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Footer note</label>
          <textarea
            rows={3}
            value={form.sidebar.note}
            onChange={(e) =>
              setForm({ ...form, sidebar: { ...form.sidebar, note: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#d94625] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save contact page"}
      </button>
    </form>
  );
}
