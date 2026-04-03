"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { Search, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending_intake", label: "Pending Intake" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_COLORS: Record<string, string> = {
  pending_intake: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    fetch("/api/admin/auth/me").then((r) => r.json()).then((d) => setUser(d.user));
    fetchOrders();
  }, [fetchOrders]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title="Orders"
        breadcrumbs={[{ label: "Admin" }, { label: "Orders" }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        <div className="bg-white rounded-[12px] border border-[#E5E5E5]">
          {/* Filters */}
          <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E5]">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#55575A]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search orders, email, name…"
                className="pl-9 pr-4 py-2 text-sm border border-[#E5E5E5] rounded-lg w-full focus:outline-none focus:border-[#ED1B1B]"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={fetchOrders}
              className="p-2 text-[#55575A] hover:text-[#0C0D0F] border border-[#E5E5E5] rounded-lg"
            >
              <RefreshCw size={15} />
            </button>
            <span className="text-xs text-[#55575A] ml-auto">{total} orders</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-gray-50">
                  {["Order", "Date", "Patient", "Items", "Total", "Status", "Route", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-[#55575A] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#55575A] text-sm">
                      Loading…
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#55575A] text-sm">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#E5E5E5] hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#0C0D0F]">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55575A] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-[#0C0D0F]">{order.shippingName ?? "—"}</p>
                        <p className="text-xs text-[#55575A]">{order.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#55575A]">
                        {order.items?.map((i: any) => i.productName).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-[#0C0D0F]">
                        ${(order.total / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.items?.some((i: any) => i.productType === "rx") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">Rx</span>
                          )}
                          {order.items?.some((i: any) => i.productType === "supplement") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">Supl</span>
                          )}
                          {order.items?.some((i: any) => i.productType === "consultation") && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">Consult</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs text-[#ED1B1B] font-medium hover:underline"
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5]">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 border border-[#E5E5E5] rounded-lg disabled:opacity-40 hover:border-[#ED1B1B] transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-[#55575A]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs px-3 py-1.5 border border-[#E5E5E5] rounded-lg disabled:opacity-40 hover:border-[#ED1B1B] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
