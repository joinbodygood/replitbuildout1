"use client";
import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Megaphone } from "lucide-react";

export default function AdminMarketingPage() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => { fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => setUser(d.user)); }, []);
  return (
    <div className="flex flex-col h-full">
      <AdminTopBar title="Marketing" breadcrumbs={[{ label: "Admin" }, { label: "Marketing" }]} user={user ?? { name: "Admin", role: "" }} />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-[#FDE7E7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone size={24} className="text-[#ED1B1B]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0C0D0F] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>Marketing Hub</h2>
          <p className="text-sm text-[#55575A]">Email campaigns, SMS campaigns, referral program management, and review moderation. Connect Mailgun and Twilio via Settings → Integrations to enable campaigns.</p>
        </div>
      </div>
    </div>
  );
}
