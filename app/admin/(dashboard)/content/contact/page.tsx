import ContactContentForm from "@/components/admin/content/ContactContentForm";

export const metadata = { title: "Contact Page | T40 Perfumes" };

export default function ContactAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">Contact page</h1>
      <ContactContentForm />
    </div>
  );
}
