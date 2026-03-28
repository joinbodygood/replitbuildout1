import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F9F9]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
