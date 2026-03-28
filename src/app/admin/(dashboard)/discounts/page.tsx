"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Plus, RefreshCw, X } from "lucide-react";

function randomCode() {
  return "BGS" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: randomCode(),
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxUses: "",
    expiresAt: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discounts");
    const data = await res.json();
    setDiscounts(data.discounts ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetchDiscounts();
  }, [fetchDiscounts]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: form.type === "percentage" ? parseInt(form.value) : Math.round(parseFloat(form.value) * 100),
        minOrderValue: form.minOrderValue ? Math.round(parseFloat(form.minOrderValue) * 100) : null,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      }),
    });
    if (!res.ok) {
      setError("Failed to create discount code");
    } else {
      setShowForm(false);
      setForm({ code: randomCode(), type: "percentage", value: "", minOrderValue: "", maxUses: "", expiresAt: "" });
      fetchDiscounts();
    }
    setCreating(false);
  }

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Discounts"
        breadcrumbs={[{ label: "Admin" }, { label: "Discounts" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-[#55575A]">{total} discount codes</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-[#ED1B1B] text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            <Plus size={15} /> Create Code
          </button>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Create Discount Code
                </h2>
                <button onClick={() => setShowForm(false)} className="text-[#55575A] hover:text-[#0C0D0F]">
                  <X size={18} />
                </button>
              </div>
              {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#55575A] mb-1.5">Code</label>
                  <div className="flex gap-2">
                    <input
                      value={form.code}
                      onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="flex-1 text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B] font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, code: randomCode() }))}
                      className="text-xs text-[#ED1B1B] border border-[#ED1B1B] px-3 py-2 rounded-lg hover:bg-[#FDE7E7]"
                    >
                      Random
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#55575A] mb-1.5">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                    >
                      <option value="percentage">Percentage %</option>
                      <option value="fixed">Fixed $ amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#55575A] mb-1.5">
                      Value ({form.type === "percentage" ? "%" : "$"})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={form.type === "percentage" ? "1" : "0.01"}
                      value={form.value}
                      onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                      className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#55575A] mb-1.5">Min order ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.minOrderValue}
                      onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                      placeholder="None"
                      className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#55575A] mb-1.5">Max uses</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxUses}
                      onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                      placeholder="Unlimited"
                      className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#55575A] mb-1.5">Expires at</label>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-sm border border-[#E5E5E5] py-2 rounded-full hover:border-[#ED1B1B] transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 text-sm bg-[#ED1B1B] text-white font-semibold py-2 rounded-full hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {creating ? "Creating…" : "Create Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E5]">
            <button onClick={fetchDiscounts} className="p-2 text-[#55575A] hover:text-[#0C0D0F] border border-[#E5E5E5] rounded-lg ml-auto">
              <RefreshCw size={15} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-gray-50">
                  {["Code", "Type", "Value", "Usage", "Min Order", "Expires", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#55575A] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[#55575A] text-sm">Loading…</td></tr>
                ) : discounts.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-[#55575A] text-sm">No discount codes yet</td></tr>
                ) : (
                  discounts.map((d) => {
                    const expired = d.expiresAt && new Date(d.expiresAt) < new Date();
                    const exhausted = d.maxUses && d.usedCount >= d.maxUses;
                    const active = d.isActive && !expired && !exhausted;
                    return (
                      <tr key={d.id} className="border-b border-[#E5E5E5] hover:bg-gray-50 last:border-0">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-[#0C0D0F]">{d.code}</td>
                        <td className="px-4 py-3 text-xs text-[#55575A] capitalize">{d.type}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-[#0C0D0F]">
                          {d.type === "percentage" ? `${d.value}%` : `$${(d.value / 100).toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#55575A]">
                          {d.usedCount}{d.maxUses ? `/${d.maxUses}` : ""}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#55575A]">
                          {d.minOrderValue ? `$${(d.minOrderValue / 100).toFixed(0)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#55575A]">
                          {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {active ? "Active" : expired ? "Expired" : exhausted ? "Used up" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
