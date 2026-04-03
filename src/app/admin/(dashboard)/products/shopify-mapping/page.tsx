"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Link2, Trash2, Plus, RefreshCw, ExternalLink, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Mapping {
  id: string;
  ourSku: string;
  productId: string | null;
  shopifyProductId: string;
  shopifyVariantId: string;
  isActive: boolean;
}

interface Supplement {
  id: string;
  slug: string;
  sku: string | null;
  translations: { name: string }[];
  variants: { id: string; sku: string; label: string | null }[];
}

export default function ShopifyMappingPage() {
  const [user, setUser]             = useState<any>(null);
  const [mappings, setMappings]     = useState<Mapping[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [form, setForm] = useState({
    ourSku:           "",
    shopifyProductId: "",
    shopifyVariantId: "",
    isActive:         true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [meRes, dataRes] = await Promise.all([
      fetch("/api/admin/auth/me").then((r) => r.json()),
      fetch("/api/admin/shopify/mapping").then((r) => r.json()),
    ]);
    setUser(meRes.user);
    setMappings(dataRes.mappings ?? []);
    setSupplements(dataRes.supplements ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function flash(type: "ok" | "err", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ourSku || !form.shopifyProductId || !form.shopifyVariantId) {
      flash("err", "All fields are required");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/shopify/mapping", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      flash("ok", "Mapping saved");
      setForm({ ourSku: "", shopifyProductId: "", shopifyVariantId: "", isActive: true });
      fetchData();
    } else {
      const d = await res.json();
      flash("err", d.error ?? "Failed to save");
    }
  }

  async function handleDelete(sku: string) {
    if (!confirm(`Remove mapping for SKU ${sku}?`)) return;
    const res = await fetch(`/api/admin/shopify/mapping?sku=${encodeURIComponent(sku)}`, { method: "DELETE" });
    if (res.ok) { flash("ok", "Mapping removed"); fetchData(); }
    else flash("err", "Failed to remove");
  }

  // Build a set of already-mapped SKUs for quick lookup
  const mappedSkus = new Set(mappings.map((m) => m.ourSku));

  // All unmapped supplement variant SKUs
  const unmappedVariants = supplements.flatMap((s) =>
    s.variants.filter((v) => !mappedSkus.has(v.sku)).map((v) => ({ ...v, productName: s.translations[0]?.name ?? s.slug }))
  );

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Shopify Product Mapping"
        breadcrumbs={[{ label: "Admin" }, { label: "Products", href: "/admin/products" }, { label: "Shopify Mapping" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#55575A] max-w-xl">
              Map each supplement SKU to its Shopify product variant so orders are auto-routed to Supliful for fulfillment.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 border border-[#E5E5E5] rounded-lg text-[#55575A] hover:text-[#0C0D0F]"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Flash message */}
        {message && (
          <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.type === "ok" ? <CheckCircle size={15} /> : <XCircle size={15} />}
            {message.text}
          </div>
        )}

        {/* Add mapping form */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
          <h2 className="text-sm font-semibold text-[#0C0D0F] mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
            <Plus size={15} /> Add Mapping
          </h2>

          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#55575A] mb-1">Our SKU</label>
              <select
                value={form.ourSku}
                onChange={(e) => setForm((f) => ({ ...f, ourSku: e.target.value }))}
                className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
              >
                <option value="">Select SKU…</option>
                {unmappedVariants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.sku} — {v.productName}{v.label ? ` (${v.label})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#55575A] mb-1">Shopify Product ID</label>
              <input
                value={form.shopifyProductId}
                onChange={(e) => setForm((f) => ({ ...f, shopifyProductId: e.target.value }))}
                placeholder="e.g. 8123456789"
                className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#55575A] mb-1">Shopify Variant ID</label>
              <input
                value={form.shopifyVariantId}
                onChange={(e) => setForm((f) => ({ ...f, shopifyVariantId: e.target.value }))}
                placeholder="e.g. 45678901234"
                className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#ED1B1B] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                <Link2 size={14} />
                {saving ? "Saving…" : "Save Mapping"}
              </button>
            </div>
          </form>

          {unmappedVariants.length > 0 && (
            <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
              <AlertCircle size={12} />
              {unmappedVariants.length} supplement SKU{unmappedVariants.length !== 1 ? "s" : ""} still need{unmappedVariants.length === 1 ? "s" : ""} a Shopify mapping.
            </p>
          )}
        </div>

        {/* Existing mappings */}
        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
              Active Mappings
            </h2>
            <span className="text-xs text-[#55575A]">{mappings.length} mapped</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-gray-50">
                  {["Our SKU", "Shopify Product ID", "Shopify Variant ID", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#55575A] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-sm text-[#55575A]">Loading…</td>
                  </tr>
                ) : mappings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-sm text-[#55575A]">No mappings yet</td>
                  </tr>
                ) : (
                  mappings.map((m) => {
                    const variant = supplements
                      .flatMap((s) => s.variants.map((v) => ({ ...v, productName: s.translations[0]?.name ?? s.slug })))
                      .find((v) => v.sku === m.ourSku);

                    return (
                      <tr key={m.id} className="border-b border-[#E5E5E5] last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono font-medium text-[#0C0D0F]">{m.ourSku}</p>
                          {variant && <p className="text-xs text-[#55575A]">{variant.productName}{variant.label ? ` — ${variant.label}` : ""}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[#55575A]">{m.shopifyProductId}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#55575A]">{m.shopifyVariantId}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {m.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(m.ourSku)}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unmapped supplements warning */}
        {!loading && unmappedVariants.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle size={15} /> Unmapped Supplement SKUs
            </h3>
            <p className="text-xs text-amber-700 mb-3">
              The following supplement SKUs have no Shopify mapping. Orders containing these products will fail Shopify routing and be marked for manual review.
            </p>
            <div className="flex flex-wrap gap-2">
              {unmappedVariants.map((v) => (
                <span key={v.sku} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                  {v.sku}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
