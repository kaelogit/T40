import AnnouncementsAdmin from "@/components/admin/content/AnnouncementsAdmin";

export const metadata = { title: "Announcements | T40 Perfumes" };

export default function AnnouncementAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Announcement bar</h1>
      <AnnouncementsAdmin />
    </div>
  );
}
