import { getAnnouncements } from "@/lib/content/announcement";
import AnnouncementBar from "./AnnouncementBar";

export const dynamic = "force-dynamic";

export default async function AnnouncementBarWrapper() {
  const announcements = await getAnnouncements();
  const active = announcements.filter((a) => a.active);
  if (!active.length) return null;
  return <AnnouncementBar announcements={active} />;
}
