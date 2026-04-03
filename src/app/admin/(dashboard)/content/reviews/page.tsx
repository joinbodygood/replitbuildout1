"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  Star, Search, CheckCircle, XCircle, Pin, Trash2, ChevronLeft, ChevronRight,
  Filter, BadgeCheck, RefreshCw,
} from "lucide-react";

type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  productSlug: string | null;
  source: string;
  createdAt: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#D1D1D1]"} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [total,    setTotal]    = useState(0);
  const [stats,    setStats]    = useState({ totalApproved: 0, avgRating: 0 });
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [approved, setApproved] = useState("");    // "" | "true" | "false"
  const [featured, setFeatured] = useState("");    // "" | "true"
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState<string | null>(null);

  const LIMIT = 25;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search)   params.set("search",   search);
    if (approved) params.set("approved", approved);
    if (featured) params.set("featured", featured);
    const res  = await fetch(`/api/admin/reviews?${params}`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setTotal(data.total ?? 0);
    setStats(data.stats ?? { totalApproved: 0, avgRating: 0 });
    setLoading(false);
  }, [page, search, approved, featured]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function patch(id: string, update: Partial<Review>) {
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
    });
    await fetchReviews();
    setBusy(null);
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    await fetchReviews();
    setBusy(null);
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Reviews"
        breadcrumbs={[{ label: "Admin" }, { label: "Content" }, { label: "Reviews" }]}
        user={{ name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total reviews",   value: total },
            { label: "Published",        value: stats.totalApproved },
            { label: "Avg rating",       value: stats.avgRating ? `${stats.avgRating} / 5` : "—" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[12px] border border-[#E5E5E5] p-4">
              <p className="text-xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>{s.value}</p>
              <p className="text-xs text-[#55575A] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#E5E5E5]">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55575A]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search reviews…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E5E5E5] rounded-[8px] focus:outline-none focus:border-[#0C0D0F]"
              />
            </div>

            <select
              value={approved}
              onChange={(e) => { setApproved(e.target.value); setPage(1); }}
              className="text-sm border border-[#E5E5E5] rounded-[8px] px-3 py-2 focus:outline-none"
            >
              <option value="">All status</option>
              <option value="true">Published</option>
              <option value="false">Pending</option>
            </select>

            <select
              value={featured}
              onChange={(e) => { setFeatured(e.target.value); setPage(1); }}
              className="text-sm border border-[#E5E5E5] rounded-[8px] px-3 py-2 focus:outline-none"
            >
              <option value="">All reviews</option>
              <option value="true">Featured only</option>
            </select>

            <button onClick={fetchReviews} className="flex items-center gap-1.5 text-sm text-[#55575A] hover:text-[#0C0D0F]">
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {/* Review rows */}
          {loading ? (
            <div className="p-8 text-center text-sm text-[#55575A]">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#55575A]">No reviews found</div>
          ) : (
            <div className="divide-y divide-[#F3F3F3]">
              {reviews.map((r) => (
                <div key={r.id} className={`p-4 ${busy === r.id ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Stars rating={r.rating} />
                        <span className="font-semibold text-sm text-[#0C0D0F]">{r.name}</span>
                        {r.isVerified && (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <BadgeCheck size={10} />
                            Verified
                          </span>
                        )}
                        {r.isFeatured && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        {r.source === "imported" && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Imported
                          </span>
                        )}
                        {!r.isApproved && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                      {r.title && <p className="text-sm font-medium text-[#0C0D0F]">{r.title}</p>}
                      <p className="text-sm text-[#55575A] mt-1 line-clamp-2">{r.body}</p>
                      <div className="flex gap-3 mt-1.5 text-xs text-[#A0A0A0]">
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.productSlug && <span>Product: {r.productSlug}</span>}
                        {!r.productSlug && <span className="italic">General / site review</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r.isApproved ? (
                        <button
                          title="Hide review"
                          onClick={() => patch(r.id, { isApproved: false })}
                          className="p-1.5 rounded-[6px] hover:bg-red-50 text-[#55575A] hover:text-red-600 transition-colors"
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          title="Approve review"
                          onClick={() => patch(r.id, { isApproved: true })}
                          className="p-1.5 rounded-[6px] hover:bg-green-50 text-[#55575A] hover:text-green-600 transition-colors"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button
                        title={r.isFeatured ? "Unfeature" : "Feature review"}
                        onClick={() => patch(r.id, { isFeatured: !r.isFeatured })}
                        className={`p-1.5 rounded-[6px] transition-colors ${
                          r.isFeatured
                            ? "bg-yellow-100 text-yellow-600"
                            : "hover:bg-yellow-50 text-[#55575A] hover:text-yellow-600"
                        }`}
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        title="Delete review"
                        onClick={() => deleteReview(r.id)}
                        className="p-1.5 rounded-[6px] hover:bg-red-50 text-[#55575A] hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#E5E5E5]">
              <p className="text-xs text-[#55575A]">
                {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total} reviews
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-[6px] border border-[#E5E5E5] disabled:opacity-40 hover:bg-[#F9F9F9]"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-[#55575A]">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-[6px] border border-[#E5E5E5] disabled:opacity-40 hover:bg-[#F9F9F9]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
