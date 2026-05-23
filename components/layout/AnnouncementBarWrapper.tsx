import { getAnnouncement } from "@/lib/content/announcement";
import AnnouncementBar from "./AnnouncementBar";

export default async function AnnouncementBarWrapper() {
  const data = await getAnnouncement();
  if (!data.active) return null;
  return <AnnouncementBar data={data} />;
}
