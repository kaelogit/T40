import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <AdminShell email={user.email ?? ""}>{children}</AdminShell>
  );
}
