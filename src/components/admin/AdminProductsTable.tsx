"use client";

import { useState, useTransition, useMemo, Fragment } from "react";

type Product = {
  id: string;
  slug: string;
  sku: string | null;
  category: string;
  fulfillment: string | null;
  dosageForm: string | null;
  forGender: string | null;
  requiresPrescription: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  pathBConsultPrice: number | null;
  pathBOngoingPrice: number | null;
  fccMedicationName: string | null;
  fccConcentration: string | null;
  programTag: string | null;
  variantCount: number;
  lowestPrice: number;
  highestPrice: number;
  nameEn: string;
  createdAt: string;
};

type Props = {
  products: Product[];
  categoryLabels: Record<string, string>;
  fulfillmentLabels: Record<string, { label: string; color: string }>;
  locale: string;
};

const fmt = (cents: number) =>
  cents > 0 ? `$${(cents / 100).toFixed(0)}` : "—";

export function AdminProductsTable({ products, categoryLabels, fulfillmentLabels }: Props) {
  const [items, setItems] = useState<Product[]>(products);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
      if (fulfillmentFilter !== "all" && p.fulfillment !== fulfillmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.nameEn.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          (p.fccMedicationName ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, activeCategory, search, statusFilter, fulfillmentFilter]);

  async function toggle(id: string, field: "isActive" | "isFeatured") {
    setTogglingId(id + field);
    const product = items.find((p) => p.id === id);
    if (!product) return;
    const newVal = !product[field];

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: newVal }),
        });
        if (res.ok) {
          setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: newVal } : p)));
        }
      } finally {
        setTogglingId(null);
      }
    });
  }

  const categories = [
    { key: "all", label: "All" },
    ...Object.entries(categoryLabels).map(([k, v]) => ({ key: k, label: v })),
  ];

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, SKU, or medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          >
            <option value="all">All Fulfillment</option>
            <option value="direct_ship">Direct Ship</option>
            <option value="pharmacy_rx">Pharmacy Rx</option>
            <option value="dual_path">Dual Path</option>
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const count = cat.key === "all"
              ? items.length
              : items.filter((p) => p.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.key
                    ? "bg-brand-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-body-muted">
          Showing <strong>{filtered.length}</strong> of {items.length} products
        </p>
        <p className="text-xs text-body-muted">
          {items.filter((p) => p.isActive).length} active · {items.filter((p) => p.isFeatured).length} featured
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide hidden lg:table-cell">Fulfillment</th>
                <th className="text-left px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide hidden xl:table-cell">Medication</th>
                <th className="text-center px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide">Price</th>
                <th className="text-center px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide hidden sm:table-cell">Vars</th>
                <th className="text-center px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide">Active</th>
                <th className="text-center px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide hidden sm:table-cell">Featured</th>
                <th className="text-center px-4 py-3 font-semibold text-body-muted text-xs uppercase tracking-wide">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-body-muted">
                    No products match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const ff = fulfillmentLabels[p.fulfillment ?? "direct_ship"] ?? { label: p.fulfillment ?? "—", color: "bg-gray-100 text-gray-600" };
                const isExpanded = expandedId === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr
                      className={`hover:bg-gray-50 transition-colors ${!p.isActive ? "opacity-50" : ""}`}
                    >
                      {/* Product Name + SKU */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-heading">{p.nameEn}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.sku && (
                              <span className="text-xs font-mono text-body-muted bg-gray-100 px-1.5 py-0.5 rounded">
                                {p.sku}
                              </span>
                            )}
                            {p.requiresPrescription && (
                              <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">Rx</span>
                            )}
                            {p.forGender && p.forGender !== "all" && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded capitalize">
                                {p.forGender}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-body-muted">
                          {categoryLabels[p.category] ?? p.category}
                        </span>
                      </td>

                      {/* Fulfillment */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ff.color}`}>
                          {ff.label}
                        </span>
                      </td>

                      {/* Medication */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <div className="text-xs text-body-muted max-w-[160px]">
                          {p.fccMedicationName ? (
                            <>
                              <div className="font-medium text-heading truncate">{p.fccMedicationName}</div>
                              {p.fccConcentration && (
                                <div className="font-mono text-[10px] truncate">{p.fccConcentration}</div>
                              )}
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-heading">
                          {p.highestPrice > p.lowestPrice
                            ? `${fmt(p.lowestPrice)}–${fmt(p.highestPrice)}`
                            : fmt(p.lowestPrice)}
                        </span>
                        {p.pathBConsultPrice && (
                          <div className="text-[10px] text-purple-600">
                            B: {fmt(p.pathBConsultPrice)}
                          </div>
                        )}
                      </td>

                      {/* Variant count */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {p.variantCount}
                        </span>
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggle(p.id, "isActive")}
                          disabled={togglingId === p.id + "isActive"}
                          title={p.isActive ? "Deactivate" : "Activate"}
                          className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-1 disabled:opacity-50 ${
                            p.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                              p.isActive ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Featured toggle */}
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <button
                          onClick={() => toggle(p.id, "isFeatured")}
                          disabled={togglingId === p.id + "isFeatured"}
                          title={p.isFeatured ? "Unfeature" : "Feature"}
                          className={`text-lg transition-opacity disabled:opacity-50 ${
                            p.isFeatured ? "opacity-100" : "opacity-20"
                          }`}
                        >
                          ★
                        </button>
                      </td>

                      {/* Expand detail */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="text-body-muted hover:text-brand-red text-xs font-medium transition-colors"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-body-muted uppercase text-[10px] tracking-wide mb-1">Identifiers</p>
                              <p><span className="text-body-muted">Slug:</span> <span className="font-mono">{p.slug}</span></p>
                              <p><span className="text-body-muted">SKU:</span> <span className="font-mono">{p.sku ?? "—"}</span></p>
                              <p><span className="text-body-muted">Category:</span> {categoryLabels[p.category] ?? p.category}</p>
                              <p><span className="text-body-muted">Gender:</span> {p.forGender ?? "all"}</p>
                              <p><span className="text-body-muted">Dosage Form:</span> {p.dosageForm ?? "—"}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-body-muted uppercase text-[10px] tracking-wide mb-1">Clinical</p>
                              <p><span className="text-body-muted">FCC Name:</span> {p.fccMedicationName ?? "—"}</p>
                              <p><span className="text-body-muted">Concentration:</span> <span className="font-mono">{p.fccConcentration ?? "—"}</span></p>
                              <p><span className="text-body-muted">Fulfillment:</span> {p.fulfillment ?? "—"}</p>
                              <p><span className="text-body-muted">Rx Required:</span> {p.requiresPrescription ? "Yes" : "No"}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-body-muted uppercase text-[10px] tracking-wide mb-1">Pricing</p>
                              <p><span className="text-body-muted">From:</span> <strong>{fmt(p.lowestPrice)}</strong></p>
                              {p.pathBConsultPrice && (
                                <p><span className="text-body-muted">Path B Consult:</span> {fmt(p.pathBConsultPrice)}</p>
                              )}
                              {p.pathBOngoingPrice && (
                                <p><span className="text-body-muted">Path B Ongoing:</span> {fmt(p.pathBOngoingPrice)}/mo</p>
                              )}
                              <p><span className="text-body-muted">Variants:</span> {p.variantCount}</p>
                              {p.programTag && (
                                <p className="mt-1"><span className="text-body-muted">Tags:</span> <span className="font-mono text-[10px] break-all">{p.programTag}</span></p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending state indicator */}
      {isPending && (
        <p className="text-center text-xs text-body-muted animate-pulse">Saving changes...</p>
      )}
    </div>
  );
}
