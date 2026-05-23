"use client";

import { useState } from "react";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ContactContent } from "@/lib/content/types";
import { DEFAULT_CONTACT_CONTENT } from "@/lib/content/types";

type FormContent = ContactContent["form"];
type SidebarContent = ContactContent["sidebar"];

export default function ContactForm({ content = DEFAULT_CONTACT_CONTENT.form }: { content?: FormContent }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send message.");
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "block text-[10px] font-bold uppercase tracking-[0.2em] font-heading text-t40-grey mb-2";
  const inputClass =
    "w-full border border-t40-light bg-white px-4 py-3.5 text-sm font-body text-t40-black placeholder:text-t40-grey/40 focus:outline-none focus:border-t40-black transition-colors";

  if (success) {
    return (
      <div className="border border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-800 font-heading mb-3">
          {content.successTitle}
        </p>
        <p className="text-sm text-emerald-900 font-body leading-relaxed">{content.successMessage}</p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-[10px] font-bold uppercase tracking-widest font-heading text-emerald-800 underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="contact-name">
            Full name
          </label>
          <input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-phone">
          Phone <span className="text-t40-grey/60 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+234 ..."
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-subject">
          Subject
        </label>
        <select
          id="contact-subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Select a topic</option>
          {content.subjectOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y min-h-[140px]`}
          placeholder="How can we help?"
        />
      </div>
      {error && <p className="text-sm text-red-600 font-body">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Sending...
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  );
}

export function ContactSidebar({
  content = DEFAULT_CONTACT_CONTENT.sidebar,
}: {
  content?: SidebarContent;
}) {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d94625] mb-6 font-heading">
          {content.eyebrow}
        </p>
        <ul className="space-y-6">
          <li className="flex gap-4">
            <Mail size={18} className="text-t40-black shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey mb-1">
                {content.email.label}
              </p>
              <a
                href={`mailto:${content.email.address}`}
                className="text-sm font-body text-t40-black hover:text-[#d94625] transition-colors"
              >
                {content.email.address}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <Phone size={18} className="text-t40-black shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey mb-1">
                {content.whatsapp.label}
              </p>
              <a
                href={content.whatsapp.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-body text-t40-black hover:text-[#d94625] transition-colors"
              >
                {content.whatsapp.display}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <MapPin size={18} className="text-t40-black shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest font-heading text-t40-grey mb-1">
                {content.studio.label}
              </p>
              <p className="text-sm font-body text-t40-grey leading-relaxed">
                {content.studio.lines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < content.studio.lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </li>
        </ul>
      </div>
      <div className="border-t border-t40-light pt-10">
        <p className="text-sm text-t40-grey font-body leading-relaxed">{content.note}</p>
      </div>
    </div>
  );
}
