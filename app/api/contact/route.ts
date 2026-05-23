import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidEmail } from "@/lib/validations/checkout";

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
    };

    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Please select a subject." }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a message (at least 10 characters)." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_EMAIL ?? process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1];
    const from = process.env.RESEND_FROM_EMAIL ?? "T40 Perfumes <onboarding@resend.dev>";

    if (apiKey && to) {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: email.trim(),
        subject: `[T40 Contact] ${subject.trim()} — ${name.trim()}`,
        html: `
          <p><strong>Name:</strong> ${name.trim()}</p>
          <p><strong>Email:</strong> ${email.trim()}</p>
          ${phone?.trim() ? `<p><strong>Phone:</strong> ${phone.trim()}</p>` : ""}
          <p><strong>Subject:</strong> ${subject.trim()}</p>
          <hr />
          <p>${message.trim().replace(/\n/g, "<br />")}</p>
        `,
      });
      if (error) {
        return NextResponse.json({ error: "Could not send message. Try again later." }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
