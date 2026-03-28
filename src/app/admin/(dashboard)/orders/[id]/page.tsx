"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { ArrowLeft, Package, User, CreditCard, MapPin, Save } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = [
  "pending_intake",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_COLORS: Record<string, string> = {
  pending_intake: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/orders/${id}`).then((r) => r.json()),
      fetch("/api/admin/auth/me").then((r) => r.json()),
    ]).then(([orderData, meData]) => {
      setOrder(orderData.order);
      setStatus(orderData.order?.status ?? "");
      setNotes(orderData.order?.notes ?? "");
      setUser(meData.user);
    });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-[#55575A] text-sm">Loading order…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        breadcrumbs={[{ label: "Admin" }, { label: "Orders", href: "/admin/orders" }, { label: `#${order.id.slice(-8).toUpperCase()}` }]}
        user={user ?? { name: "Admin", role: "" }}
      />

      <div className="flex-1 p-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-[#55575A] hover:text-[#ED1B1B] mb-5 transition-colors">
          <ArrowLeft size={15} />
          Back to orders
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Order items + status */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <Package size={16} /> Order Items
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E5E5]">
                    <th className="text-left py-2 text-xs font-semibold text-[#55575A]">Product</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#55575A]">Variant</th>
                    <th className="text-right py-2 text-xs font-semibold text-[#55575A]">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold text-[#55575A]">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="border-b border-[#E5E5E5] last:border-0">
                      <td className="py-3 text-xs font-medium text-[#0C0D0F]">{item.productName}</td>
                      <td className="py-3 text-xs text-[#55575A]">{item.variantLabel}</td>
                      <td className="py-3 text-xs text-right text-[#55575A]">{item.quantity}</td>
                      <td className="py-3 text-xs text-right font-semibold text-[#0C0D0F]">${(item.price / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E5E5E5]">
                    <td colSpan={3} className="pt-3 text-xs font-semibold text-[#0C0D0F] text-right pr-4">
                      {order.discount > 0 && (
                        <span className="block text-green-600 mb-1">Discount: −${(order.discount / 100).toFixed(2)}</span>
                      )}
                      Total:
                    </td>
                    <td className="pt-3 text-sm font-bold text-[#0C0D0F] text-right">${(order.total / 100).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Status & Notes */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                Status & Notes
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#55575A] mb-1.5">Order Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B]"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#55575A] mb-1.5">Internal Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:border-[#ED1B1B] resize-none"
                    placeholder="Add notes visible only to the team…"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#ED1B1B] text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  <Save size={14} />
                  {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Patient + Payment + Shipping */}
          <div className="space-y-4">
            {/* Patient */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-3 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <User size={15} /> Patient
              </h2>
              <p className="text-sm font-medium text-[#0C0D0F]">{order.shippingName ?? "—"}</p>
              <p className="text-xs text-[#55575A] mt-0.5">{order.email}</p>
              {order.phone && <p className="text-xs text-[#55575A]">{order.phone}</p>}
            </div>

            {/* Payment */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-3 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <CreditCard size={15} /> Payment
              </h2>
              <div className="space-y-1.5 text-xs text-[#55575A]">
                <div className="flex justify-between">
                  <span>PayPal Order ID</span>
                  <span className="font-mono text-[10px] text-[#0C0D0F]">{order.paypalOrderId ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.discountCode})</span>
                    <span>−${(order.discount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-[#0C0D0F] border-t border-[#E5E5E5] pt-1.5 mt-1.5">
                  <span>Total charged</span>
                  <span>${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-3 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <MapPin size={15} /> Shipping Address
              </h2>
              {order.shippingAddress ? (
                <div className="text-xs text-[#55575A] space-y-0.5">
                  <p>{order.shippingName}</p>
                  <p>{order.shippingAddress}</p>
                  <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                </div>
              ) : (
                <p className="text-xs text-[#55575A]">No shipping address on file</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
