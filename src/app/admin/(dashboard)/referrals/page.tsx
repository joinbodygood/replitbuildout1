"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Search, Download, Check, X, RefreshCw } from "lucide-react";

type Member = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  referralCode: string;
  status: string;
  totalClicks: number;
  successfulReferrals: number;
  totalReferralRevenue: number;
  legacyReferralUrl: string | null;
  linkedCustomerEmail: string | null;
  notifiedAt: string | null;
  createdAt: string;
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bodygoodstudio.com";

export default function ReferralMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ search, status, page: String(page) });
    const res = await fetch(`/api/admin/referral-members?${params}`);
    const data = await res.json();
    setMembers(data.members ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(member: Member) {
    const newStatus = member.status === "enabled" ? "disabled" : "enabled";
    await fetch("/api/admin/referral-members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, status: newStatus }),
    });
    load();
  }

  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Code", "Link", "Status", "Clicks", "Referrals", "Revenue", "Joined"];
    const rows = members.map((m) => [
      m.firstName,
      m.lastName,
      m.email,
      m.phone ?? "",
      m.referralCode,
      `${BASE}/en/refer/${m.referralCode}`,
      m.status,
      m.totalClicks,
      m.successfulReferrals,
      `$${(m.totalReferralRevenue / 100).toFixed(2)}`,
      new Date(m.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referral-members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / 50);
  const enabled = members.filter((m) => m.status === "enabled").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-heading text-2xl font-bold flex items-center gap-2">
            <Users size={22} />
            Referral Members
          </h1>
          <p className="text-body-muted text-sm mt-1">{total} total members</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-card text-sm hover:border-brand-red hover:text-brand-red transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-card text-sm font-medium hover:bg-brand-red-hover transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Members", value: total },
          { label: "Enabled", value: enabled },
          { label: "Total Clicks", value: members.reduce((s, m) => s + m.totalClicks, 0) },
          { label: "Successful Referrals", value: members.reduce((s, m) => s + m.successfulReferrals, 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-card p-4">
            <p className="text-body-muted text-xs mb-1">{stat.label}</p>
            <p className="font-heading text-heading text-2xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-body-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or code…"
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-card text-sm focus:outline-none focus:border-brand-red"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-border rounded-card text-sm focus:outline-none focus:border-brand-red bg-white"
        >
          <option value="all">All Status</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-dim">
                <th className="px-4 py-3 text-left text-xs font-semibold text-body-muted uppercase tracking-wide">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-body-muted uppercase tracking-wide">Code / Link</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Clicks</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Referrals</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Notified</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-body-muted">Loading…</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-body-muted">No referral members found</td></tr>
              ) : members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-dim/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-heading">{m.firstName} {m.lastName}</p>
                    <p className="text-body-muted text-xs">{m.email}</p>
                    {m.phone && <p className="text-body-muted text-xs">{m.phone}</p>}
                    {m.linkedCustomerEmail && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1">
                        <Check size={9} /> Linked
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono font-bold text-brand-red bg-brand-pink-soft px-2 py-0.5 rounded">
                      {m.referralCode}
                    </code>
                    <p className="text-body-muted text-[11px] mt-1 font-mono truncate max-w-[180px]">
                      /en/refer/{m.referralCode}
                    </p>
                    {m.legacyReferralUrl && (
                      <p className="text-[10px] text-body-muted truncate max-w-[180px]" title={m.legacyReferralUrl}>
                        Legacy: {m.legacyReferralUrl.replace("https://", "")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${m.status === "enabled" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                      {m.status === "enabled" ? <Check size={10} /> : <X size={10} />}
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-heading font-medium">{m.totalClicks}</td>
                  <td className="px-4 py-3 text-center text-heading font-medium">{m.successfulReferrals}</td>
                  <td className="px-4 py-3 text-center text-xs text-body-muted">
                    {m.notifiedAt ? new Date(m.notifiedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-body-muted">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(m)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-card border transition-colors ${m.status === "enabled" ? "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
                    >
                      {m.status === "enabled" ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-body-muted">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-border rounded-card text-sm disabled:opacity-40 hover:border-brand-red transition-colors">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-border rounded-card text-sm disabled:opacity-40 hover:border-brand-red transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
