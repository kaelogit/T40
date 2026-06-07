import EventForm from "@/components/admin/content/EventForm";

export const metadata = { title: "New event | T40 Perfumes" };

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">New event</h1>
      <EventForm />
    </div>
  );
}
