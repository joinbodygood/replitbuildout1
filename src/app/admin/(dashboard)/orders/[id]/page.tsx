"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { ArrowLeft, Package, User, CreditCard, MapPin, Save, Truck, ExternalLink, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = ["pending_intake", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  pending_intake: "bg-yellow-100 text-yellow-800",
  processing:     "bg-blue-100 text-blue-800",
  shipped:        "bg-purple-100 text-purple-800",
  delivered:      "bg-green-100 text-green-800",
  cancelled:      "bg-gray-100 text-gray-600",
  refunded:       "bg-red-100 text-red-700",
};

const SHOPIFY_STATUS_COLORS: Record<string, string> = {
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100 text-green-800",
  failed:     "bg-red-100 text-red-700",
};

const PRODUCT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  rx:           { label: "Rx",           color: "bg-indigo-100 text-indigo-700" },
  supplement:   { label: "Supplement",   color: "bg-teal-100 text-teal-700" },
  consultation: { label: "Consultation", color: "bg-yellow-100 text-yellow-700" },
};

export default function AdminOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder]       = useState<any>(null);
  const [shopifyOrder, setShopifyOrder] = useState<any>(null);
  const [user, setUser]         = useState<any>(null);
  const [status, setStatus]     = useState("");
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchOrder = useCallback(async () => {
    const [orderData, meData, shopifyData] = await Promise.all([
      fetch(`/api/admin/orders/${id}`).then((r) => r.json()),
      fetch("/api/admin/auth/me").then((r) => r.json()),
      fetch(`/api/admin/shopify/order?orderId=${id}`).then((r) => r.ok ? r.json() : { shopifyOrder: null }).catch(() => ({ shopifyOrder: null })),
    ]);
    setOrder(orderData.order);
    setStatus(orderData.order?.status ?? "");
    setNotes(orderData.order?.notes ?? "");
    setUser(meData.user);
    setShopifyOrder(shopifyData.shopifyOrder ?? null);
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/orders/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status, notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleRetryShopify() {
    setRetrying(true);
    setRetryMsg(null);
    const res = await fetch("/api/admin/shopify/retry-order", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orderId: id }),
    });
    const data = await res.json();
    setRetrying(false);
    if (res.ok) {
      setRetryMsg({ type: "ok", text: "Shopify order successfully created. Refreshing…" });
      setTimeout(() => { setRetryMsg(null); fetchOrder(); }, 2000);
    } else {
      setRetryMsg({ type: "err", text: data.error ?? "Retry failed" });
    }
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-[#55575A] text-sm">Loading order…</div>
      </div>
    );
  }

  const supplementItems = order.items.filter((i: any) => i.productType === "supplement");
  const rxItems         = order.items.filter((i: any) => i.productType === "rx");
  const consultItems    = order.items.filter((i: any) => i.productType === "consultation");
  const hasSupplements  = supplementItems.length > 0;

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
          {/* Left: items + fulfillment + status */}
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
                    <th className="text-left py-2 text-xs font-semibold text-[#55575A]">Type</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#55575A]">Variant</th>
                    <th className="text-right py-2 text-xs font-semibold text-[#55575A]">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold text-[#55575A]">Price</th>
                    <th className="text-left py-2 text-xs font-semibold text-[#55575A] pl-4">Fulfillment</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => {
                    const typeInfo = PRODUCT_TYPE_LABELS[item.productType] ?? PRODUCT_TYPE_LABELS.rx;
                    const shopifyStatus = item.shopifyFulfillmentStatus;
                    return (
                      <tr key={item.id} className="border-b border-[#E5E5E5] last:border-0">
                        <td className="py-3 text-xs font-medium text-[#0C0D0F]">{item.productName}</td>
                        <td className="py-3">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-[#55575A]">{item.variantLabel}</td>
                        <td className="py-3 text-xs text-right text-[#55575A]">{item.quantity}</td>
                        <td className="py-3 text-xs text-right font-semibold text-[#0C0D0F]">${(item.price / 100).toFixed(2)}</td>
                        <td className="py-3 pl-4">
                          {item.productType === "supplement" ? (
                            <div>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SHOPIFY_STATUS_COLORS[shopifyStatus] ?? "bg-gray-100 text-gray-500"}`}>
                                {shopifyStatus ? shopifyStatus.charAt(0).toUpperCase() + shopifyStatus.slice(1) : "Pending"}
                              </span>
                              {item.trackingNumber && (
                                <p className="text-xs text-[#55575A] mt-0.5">
                                  {item.trackingCarrier}: {item.trackingNumber}
                                </p>
                              )}
                            </div>
                          ) : item.productType === "rx" ? (
                            <span className="text-xs text-[#55575A]">Pharmacy</span>
                          ) : (
                            <span className="text-xs text-[#55575A]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E5E5E5]">
                    <td colSpan={4} className="pt-3 text-xs font-semibold text-[#0C0D0F] text-right pr-4">
                      {order.discount > 0 && (
                        <span className="block text-green-600 mb-1">Discount: −${(order.discount / 100).toFixed(2)}</span>
                      )}
                      Total:
                    </td>
                    <td className="pt-3 text-sm font-bold text-[#0C0D0F] text-right">${(order.total / 100).toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Shopify / Supplement fulfillment panel */}
            {hasSupplements && (
              <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
                <h2 className="text-sm font-semibold text-[#0C0D0F] mb-4 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  <Truck size={15} /> Supplement Fulfillment (Supliful / Shopify)
                </h2>

                {shopifyOrder ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[#55575A]">Shopify Order ID</p>
                        <p className="font-mono font-medium text-[#0C0D0F] mt-0.5">{shopifyOrder.shopifyOrderId}</p>
                      </div>
                      <div>
                        <p className="text-[#55575A]">Status</p>
                        <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${SHOPIFY_STATUS_COLORS[shopifyOrder.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {shopifyOrder.status.charAt(0).toUpperCase() + shopifyOrder.status.slice(1)}
                        </span>
                      </div>
                      {shopifyOrder.trackingNumber && (
                        <>
                          <div>
                            <p className="text-[#55575A]">Carrier</p>
                            <p className="font-medium text-[#0C0D0F] mt-0.5">{shopifyOrder.trackingCarrier ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-[#55575A]">Tracking Number</p>
                            <p className="font-mono font-medium text-[#0C0D0F] mt-0.5">{shopifyOrder.trackingNumber}</p>
                          </div>
                        </>
                      )}
                      {shopifyOrder.shippedAt && (
                        <div>
                          <p className="text-[#55575A]">Shipped At</p>
                          <p className="font-medium text-[#0C0D0F] mt-0.5">{new Date(shopifyOrder.shippedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {shopifyOrder.shopifyOrderUrl && !shopifyOrder.shopifyOrderId.startsWith("FAILED") && (
                      <a
                        href={shopifyOrder.shopifyOrderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#ED1B1B] font-medium hover:underline"
                      >
                        View in Shopify <ExternalLink size={11} />
                      </a>
                    )}

                    {shopifyOrder.status === "failed" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
                          <AlertTriangle size={13} /> Fulfillment Failed — Manual Review Required
                        </p>
                        {shopifyOrder.failureReason && (
                          <p className="text-xs text-red-600 font-mono bg-red-100 rounded px-2 py-1">{shopifyOrder.failureReason}</p>
                        )}
                        {retryMsg && (
                          <p className={`text-xs ${retryMsg.type === "ok" ? "text-green-700" : "text-red-700"} flex items-center gap-1`}>
                            {retryMsg.type === "ok" ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                            {retryMsg.text}
                          </p>
                        )}
                        <button
                          onClick={handleRetryShopify}
                          disabled={retrying}
                          className="inline-flex items-center gap-1.5 text-xs bg-red-600 text-white px-3 py-1.5 rounded-full font-medium hover:bg-red-700 disabled:opacity-60"
                        >
                          <RefreshCw size={12} className={retrying ? "animate-spin" : ""} />
                          {retrying ? "Retrying…" : "Retry Shopify Order"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[#55575A]">No Shopify order record found. This may mean the order was placed before the Shopify integration was enabled, or routing failed silently.</p>
                    {retryMsg && (
                      <p className={`text-xs ${retryMsg.type === "ok" ? "text-green-700" : "text-red-700"} flex items-center gap-1`}>
                        {retryMsg.type === "ok" ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {retryMsg.text}
                      </p>
                    )}
                    <button
                      onClick={handleRetryShopify}
                      disabled={retrying}
                      className="inline-flex items-center gap-1.5 text-xs bg-[#ED1B1B] text-white px-3 py-1.5 rounded-full font-medium hover:bg-red-700 disabled:opacity-60"
                    >
                      <RefreshCw size={12} className={retrying ? "animate-spin" : ""} />
                      {retrying ? "Routing…" : "Route to Shopify"}
                    </button>
                  </div>
                )}
              </div>
            )}

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

          {/* Right: Patient + Payment + Shipping + Fulfillment Summary */}
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

            {/* Fulfillment summary */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-3 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <Truck size={15} /> Fulfillment Routing
              </h2>
              <div className="space-y-2 text-xs">
                {rxItems.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#55575A]">{rxItems.length} Rx item{rxItems.length !== 1 ? "s" : ""}</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">Pharmacy</span>
                  </div>
                )}
                {supplementItems.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#55575A]">{supplementItems.length} supplement{supplementItems.length !== 1 ? "s" : ""}</span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded font-medium">Supliful</span>
                  </div>
                )}
                {consultItems.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#55575A]">{consultItems.length} consultation{consultItems.length !== 1 ? "s" : ""}</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">Clinical</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
              <h2 className="text-sm font-semibold text-[#0C0D0F] mb-3 flex items-center gap-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                <CreditCard size={15} /> Payment
              </h2>
              <div className="space-y-1.5 text-xs text-[#55575A]">
                {order.paypalOrderId && (
                  <div className="flex justify-between">
                    <span>PayPal Order</span>
                    <span className="font-mono text-[10px] text-[#0C0D0F]">{order.paypalOrderId.slice(0, 12)}…</span>
                  </div>
                )}
                {order.paypalSubscriptionId && (
                  <div className="flex justify-between">
                    <span>Subscription</span>
                    <span className="font-mono text-[10px] text-[#0C0D0F]">{order.paypalSubscriptionId.slice(0, 12)}…</span>
                  </div>
                )}
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
