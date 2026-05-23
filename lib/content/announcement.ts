import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnnouncementContent } from "./types";
import { DEFAULT_ANNOUNCEMENT } from "./defaults/announcement";

function mapAnnouncement(
  settings: {
    active: boolean;
    badge_label: string;
    message_short: string;
    message_full: string;
    read_link_label: string;
    read_link_href: string;
    updated_at?: string;
  },
  links: { id: string; label: string; href: string; sort_order: number }[]
): AnnouncementContent {
  return {
    active: settings.active,
    badgeLabel: settings.badge_label,
    messageShort: settings.message_short,
    messageFull: settings.message_full,
    readLinkLabel: settings.read_link_label,
    readLinkHref: settings.read_link_href,
    updatedAt: settings.updated_at,
    links: links
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        id: l.id,
        label: l.label,
        href: l.href,
        sortOrder: l.sort_order,
      })),
  };
}

export async function getAnnouncement(): Promise<AnnouncementContent> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("announcement_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (!settings) return DEFAULT_ANNOUNCEMENT;

  const { data: links } = await supabase
    .from("announcement_links")
    .select("id, label, href, sort_order")
    .order("sort_order", { ascending: true });

  return mapAnnouncement(settings, links ?? []);
}

export async function getAnnouncementAdmin(): Promise<AnnouncementContent> {
  const supabase = createAdminClient();
  const { data: settings } = await supabase
    .from("announcement_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (!settings) return DEFAULT_ANNOUNCEMENT;

  const { data: links } = await supabase
    .from("announcement_links")
    .select("id, label, href, sort_order")
    .order("sort_order", { ascending: true });

  return mapAnnouncement(settings, links ?? []);
}

export type AnnouncementFormInput = AnnouncementContent;

export async function saveAnnouncement(input: AnnouncementFormInput) {
  const supabase = createAdminClient();

  await supabase.from("announcement_settings").upsert({
    singleton: true,
    active: input.active,
    badge_label: input.badgeLabel,
    message_short: input.messageShort,
    message_full: input.messageFull,
    read_link_label: input.readLinkLabel,
    read_link_href: input.readLinkHref,
    updated_at: new Date().toISOString(),
  });

  await supabase.from("announcement_links").delete().not("id", "is", null);

  if (input.links.length > 0) {
    await supabase.from("announcement_links").insert(
      input.links.map((l, i) => ({
        label: l.label,
        href: l.href,
        sort_order: l.sortOrder ?? i,
      }))
    );
  }
}
