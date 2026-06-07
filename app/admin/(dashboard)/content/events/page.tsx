import EventsAdmin from "@/components/admin/content/EventsAdmin";

export const metadata = { title: "Events | T40 Perfumes" };

export default function EventsAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Events</h1>
      <EventsAdmin />
    </div>
  );
}
