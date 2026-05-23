import AboutContentForm from "@/components/admin/content/AboutContentForm";

export const metadata = { title: "About Page | T40 Perfumes" };

export default function AboutAdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-8">About page</h1>
      <AboutContentForm />
    </div>
  );
}
