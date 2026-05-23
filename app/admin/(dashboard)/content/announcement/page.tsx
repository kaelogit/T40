import AnnouncementForm from "@/components/admin/content/AnnouncementForm";

export const metadata = { title: "Announcement | T40 Perfumes" };

export default function AnnouncementAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Announcement bar</h1>
      <AnnouncementForm />
    </div>
  );
}
