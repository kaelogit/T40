import { createAdminClient } from "@/lib/supabase/admin";
import type { AnnouncementContent } from "./types";
import { DEFAULT_ANNOUNCEMENTS } from "./defaults/announcement";

type AnnouncementRow = {
  id: string;
  active: boolean;
  badge_label: string;
  message_short: string;
  message_full: string;
  read_link_label: string;
  read_link_href: string;
  sort_order: number;
  updated_at: string;
};

type LinkRow = {
  id: string;
  announcement_id: string | null;
  label: string;
  href: string;
  sort_order: number;
};

function mapAnnouncement(row: AnnouncementRow, links: LinkRow[]): AnnouncementContent {
  return {
    id: row.id,
    active: row.active,
    badgeLabel: row.badge_label,
    messageShort: row.message_short,
    messageFull: row.message_full,
    readLinkLabel: row.read_link_label,
    readLinkHref: row.read_link_href,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
    links: links
      .filter((l) => l.announcement_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((l) => ({
        id: l.id,
        label: l.label,
        href: l.href,
        sortOrder: l.sort_order,
      })),
  };
}

function mapLegacyAnnouncement(
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
    sortOrder: 0,
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

async function fetchAnnouncementsFromTable(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>
): Promise<AnnouncementContent[] | null> {
  const { data: rows, error } = await supabase
    .from("announcements")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !rows?.length) return null;

  const { data: links } = await supabase
    .from("announcement_links")
    .select("id, announcement_id, label, href, sort_order")
    .order("sort_order", { ascending: true });

  return (rows as AnnouncementRow[]).map((row) =>
    mapAnnouncement(row, (links ?? []) as LinkRow[])
  );
}

async function fetchLegacyAnnouncement(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>
): Promise<AnnouncementContent[] | null> {
  const { data: settings } = await supabase
    .from("announcement_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();

  if (!settings) return null;

  const { data: links } = await supabase
    .from("announcement_links")
    .select("id, label, href, sort_order")
    .order("sort_order", { ascending: true });

  return [mapLegacyAnnouncement(settings, links ?? [])];
}

export async function getAnnouncements(): Promise<AnnouncementContent[]> {
  // Service role on the server — announcements are public storefront content.
  // The anon client is blocked when RLS is enabled on `announcements` without a policy.
  const supabase = createAdminClient();
  const fromTable = await fetchAnnouncementsFromTable(supabase);
  if (fromTable?.length) return fromTable;

  const legacy = await fetchLegacyAnnouncement(supabase);
  if (legacy?.length) return legacy;

  return DEFAULT_ANNOUNCEMENTS;
}

export async function getAnnouncementsAdmin(): Promise<AnnouncementContent[]> {
  const supabase = createAdminClient();
  const fromTable = await fetchAnnouncementsFromTable(supabase);
  if (fromTable?.length) return fromTable;

  const legacy = await fetchLegacyAnnouncement(supabase);
  if (legacy?.length) return legacy;

  return DEFAULT_ANNOUNCEMENTS;
}

export type AnnouncementFormInput = Omit<AnnouncementContent, "id" | "updatedAt"> & {
  id?: string;
};

async function syncAnnouncementLinks(
  supabase: ReturnType<typeof createAdminClient>,
  announcementId: string,
  links: AnnouncementFormInput["links"]
) {
  await supabase.from("announcement_links").delete().eq("announcement_id", announcementId);

  if (links.length > 0) {
    await supabase.from("announcement_links").insert(
      links.map((l, i) => ({
        announcement_id: announcementId,
        label: l.label,
        href: l.href,
        sort_order: l.sortOrder ?? i,
      }))
    );
  }
}

export async function createAnnouncement(input: AnnouncementFormInput) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      active: input.active,
      badge_label: input.badgeLabel,
      message_short: input.messageShort,
      message_full: input.messageFull,
      read_link_label: input.readLinkLabel,
      read_link_href: input.readLinkHref,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error("Could not create announcement.");

  await syncAnnouncementLinks(supabase, data.id, input.links);
  return data.id;
}

export async function updateAnnouncement(id: string, input: AnnouncementFormInput) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("announcements")
    .update({
      active: input.active,
      badge_label: input.badgeLabel,
      message_short: input.messageShort,
      message_full: input.messageFull,
      read_link_label: input.readLinkLabel,
      read_link_href: input.readLinkHref,
      sort_order: input.sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error("Could not update announcement.");

  await syncAnnouncementLinks(supabase, id, input.links);
}

export async function deleteAnnouncement(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error("Could not delete announcement.");
}

export async function importDefaultAnnouncementsIfEmpty(): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase.from("announcements").select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) return 0;

  for (const [i, item] of DEFAULT_ANNOUNCEMENTS.entries()) {
    await createAnnouncement({ ...item, sortOrder: item.sortOrder ?? i });
  }

  return DEFAULT_ANNOUNCEMENTS.length;
}

/** @deprecated Use getAnnouncements */
export async function getAnnouncement(): Promise<AnnouncementContent> {
  const items = await getAnnouncements();
  return items.find((a) => a.active) ?? items[0] ?? DEFAULT_ANNOUNCEMENTS[0];
}

/** @deprecated Use getAnnouncementsAdmin */
export async function getAnnouncementAdmin(): Promise<AnnouncementContent> {
  const items = await getAnnouncementsAdmin();
  return items[0] ?? DEFAULT_ANNOUNCEMENTS[0];
}

/** @deprecated Use updateAnnouncement / createAnnouncement */
export async function saveAnnouncement(input: AnnouncementFormInput) {
  const supabase = createAdminClient();
  const existing = await fetchAnnouncementsFromTable(supabase);

  if (existing?.[0]?.id) {
    await updateAnnouncement(existing[0].id, input);
    return;
  }

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
