"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Search, RefreshCw, Mail } from "lucide-react";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/patients?${params}`);
    const data = await res.json();
    setPatients(data.patients ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetchPatients();
  }, [fetchPatients]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Patients"
        breadcrumbs={[{ label: "Admin" }, { label: "Patients" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Total patients", value: total },
            { label: "With orders", value: patients.filter((p) => p.orderCount > 0).length },
            { label: "New this week", value: "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[12px] border border-[#E5E5E5] p-4">
              <p className="text-xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-[#55575A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          {/* Filters */}
          <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E5]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55575A]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by email…"
                className="pl-9 pr-4 py-2 text-sm border border-[#E5E5E5] rounded-lg w-full focus:outline-none focus:border-[#ED1B1B]"
              />
            </div>
            <button onClick={fetchPatients} className="p-2 text-[#55575A] hover:text-[#0C0D0F] border border-[#E5E5E5] rounded-lg">
              <RefreshCw size={15} />
            </button>
            <span className="text-xs text-[#55575A] ml-auto">{total} patients</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-gray-50">
                  {["Patient", "Quiz Outcome", "Orders", "LTV", "Last Order", "Joined", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#55575A] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#55575A] text-sm">Loading…</td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#55575A] text-sm">No patients found</td>
                  </tr>
                ) : (
                  patients.map((p) => (
                    <tr key={p.id} className="border-b border-[#E5E5E5] hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#0C0D0F]">{p.email}</p>
                        {p.phone && <p className="text-xs text-[#55575A]">{p.phone}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {p.quizOutcome ? (
                          <span className="text-xs bg-[#FDE7E7] text-[#ED1B1B] px-2 py-0.5 rounded-full font-medium">
                            {p.quizOutcome}
                          </span>
                        ) : (
                          <span className="text-xs text-[#55575A]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#0C0D0F] font-medium">{p.orderCount}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#0C0D0F]">
                        {p.ltv > 0 ? `$${p.ltv.toFixed(0)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55575A]">
                        {p.lastOrderDate ? new Date(p.lastOrderDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55575A]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${p.email}`}
                          className="inline-flex items-center gap-1 text-xs text-[#ED1B1B] font-medium hover:underline"
                        >
                          <Mail size={11} /> Email
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-xs px-3 py-1.5 border border-[#E5E5E5] rounded-lg disabled:opacity-40 hover:border-[#ED1B1B] transition-colors">
                Previous
              </button>
              <span className="text-xs text-[#55575A]">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-xs px-3 py-1.5 border border-[#E5E5E5] rounded-lg disabled:opacity-40 hover:border-[#ED1B1B] transition-colors">
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
