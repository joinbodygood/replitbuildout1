"use client";
import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { FileText } from "lucide-react";

export default function AdminContentPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  return (
    <div className="flex flex-col h-full">
      <AdminTopBar title="Content" breadcrumbs={[{ label: "Admin" }, { label: "Content" }]} user={user ?? { name: "Admin", role: "" }} />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-[#FDE7E7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[#ED1B1B]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0C0D0F] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Content Management</h2>
          <p className="text-sm text-[#55575A]">Blog posts, landing pages, and navigation management. The blog post schema is already in the database. Full content editor coming in the next build phase.</p>
        </div>
      </div>
    </div>
  );
}
