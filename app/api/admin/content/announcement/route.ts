import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/apiAuth";
import {
  createAnnouncement,
  getAnnouncementsAdmin,
  importDefaultAnnouncementsIfEmpty,
  type AnnouncementFormInput,
} from "@/lib/content/announcement";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;
  const announcements = await getAnnouncementsAdmin();
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as AnnouncementFormInput & { action?: string };

    if (body.action === "import_defaults") {
      const count = await importDefaultAnnouncementsIfEmpty();
      return NextResponse.json({ ok: true, imported: count });
    }

    if (!body.messageShort?.trim() || !body.messageFull?.trim()) {
      return NextResponse.json({ error: "Announcement messages are required." }, { status: 400 });
    }

    const id = await createAnnouncement(body);
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT() {
  const auth = await requireAdminApi();
  if (auth instanceof NextResponse) return auth;

  try {
    const count = await importDefaultAnnouncementsIfEmpty();
    return NextResponse.json({ ok: true, imported: count });
  } catch {
    return NextResponse.json({ error: "Could not import defaults." }, { status: 400 });
  }
}
