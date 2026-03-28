"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Users, Shield } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinical_admin: "Clinical Admin",
  provider: "Provider",
  support: "Support Agent",
  marketing: "Marketing",
  developer: "Developer",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-[#FDE7E7] text-[#ED1B1B]",
  clinical_admin: "bg-blue-100 text-blue-800",
  provider: "bg-purple-100 text-purple-800",
  support: "bg-yellow-100 text-yellow-800",
  marketing: "bg-green-100 text-green-700",
  developer: "bg-gray-100 text-gray-700",
};

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/auth/me").then((r) => r.json()),
      fetch("/api/admin/team").then((r) => r.json()),
    ]).then(([me, teamData]) => {
      setUser(me.user);
      setTeam(teamData.team ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const teamConfig = [
    { name: "Dr. Linda Moleon, MD", role: "super_admin", email: "linda@bodygoodstudio.com" },
    { name: "Dr. Sharmaine", role: "clinical_admin", email: "sharmaine@bodygoodstudio.com" },
    { name: "Jena PA", role: "provider", email: "jena@bodygoodstudio.com" },
    { name: "Rhea PA", role: "provider", email: "rhea@bodygoodstudio.com" },
    { name: "Kira", role: "support", email: "kira@bodygoodstudio.com" },
    { name: "Cassey", role: "marketing", email: "cassey@bodygoodstudio.com" },
    { name: "Ayush", role: "developer", email: "ayush@bodygoodstudio.com" },
  ];

  const displayTeam = team.length > 0 ? team : teamConfig;

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Team"
        breadcrumbs={[{ label: "Admin" }, { label: "Settings" }, { label: "Team" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-[#ED1B1B]" />
              <span className="text-xs font-semibold text-[#55575A]">Total Members</span>
            </div>
            <p className="text-2xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {displayTeam.length}
            </p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-[#ED1B1B]" />
              <span className="text-xs font-semibold text-[#55575A]">Roles</span>
            </div>
            <p className="text-2xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>6</p>
          </div>
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-[#55575A]" />
              <span className="text-xs font-semibold text-[#55575A]">Providers</span>
            </div>
            <p className="text-2xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
              {displayTeam.filter((m: any) => m.role === "provider" || m.role === "clinical_admin").length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5]">
            <h2 className="text-sm font-semibold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Team Members
            </h2>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {displayTeam.map((member: any, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 bg-[#ED1B1B] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0C0D0F]">{member.name}</p>
                  <p className="text-xs text-[#55575A]">{member.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
                {member.lastLoginAt && (
                  <span className="text-xs text-[#55575A] whitespace-nowrap hidden lg:block">
                    Last login: {new Date(member.lastLoginAt).toLocaleDateString()}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${member.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {member.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 bg-[#FDE7E7] border border-[#ED1B1B]/20 rounded-[12px] p-4">
          <p className="text-xs font-semibold text-[#ED1B1B] mb-1">To add a team member</p>
          <p className="text-xs text-[#55575A]">
            Run the admin seeder script with their email, name, and role. Admin accounts are created securely via the command line, not self-service, to prevent unauthorized access.
          </p>
          <code className="block mt-2 text-xs bg-white border border-[#E5E5E5] rounded p-2 text-[#0C0D0F] font-mono">
            npx ts-node prisma/seed-admin.ts
          </code>
        </div>
      </div>
    </div>
  );
}
