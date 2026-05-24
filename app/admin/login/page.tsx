import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { requireAdminUser } from "@/lib/admin/auth";

export const metadata = { title: "Admin Login | T40" };

export default async function AdminLoginPage() {
  const user = await requireAdminUser();
  if (user) redirect("/admin");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-50">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-3xl font-black uppercase tracking-tighter mb-2">
          T40 Perfumes Admin
        </h1>
       
        <AdminLoginForm />
      </div>
    </div>
  );
}
