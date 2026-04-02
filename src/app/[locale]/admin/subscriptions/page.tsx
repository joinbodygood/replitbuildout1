"use client";

import { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { RefreshCw, XCircle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

type OrderItem = {
  id: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
};

type SubscriptionOrder = {
  id: string;
  email: string;
  phone: string | null;
  status: string;
  total: number;
  paypalSubscriptionId: string;
  shippingName: string | null;
  locale: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending_intake: "bg-warning-soft text-warning border border-warning/30",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border border-purple-200",
  delivered: "bg-success-soft text-success border border-success/30",
  cancelled: "bg-error-soft text-error border border-error/30",
  refunded: "bg-gray-100 text-gray-600 border border-gray-200",
};

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function SubscriptionRow({ order, onCancel }: { order: SubscriptionOrder; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm(`Cancel subscription for ${order.email}? This cannot be undone.`)) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Cancelled by admin" }),
      });
      if (res.ok) {
        onCancel(order.id);
      } else {
        alert("Failed to cancel subscription. Please try again.");
      }
    } catch {
      alert("Error cancelling subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const statusLabel = order.status.replace(/_/g, " ");
  const statusClass = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600";
  const isCancelled = order.status === "cancelled";

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface-dim transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-heading text-sm">{order.email}</span>
            {order.shippingName && (
              <span className="text-body-muted text-xs">({order.shippingName})</span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-xs text-body-muted mt-1">
            {order.items.map((i) => i.productName).join(", ")}
          </div>
          <div className="text-xs text-body-muted mt-0.5 font-mono">
            Sub: {order.paypalSubscriptionId}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-heading font-bold text-heading text-sm">
            {formatCents(order.total)}/mo
          </div>
          <div className="text-xs text-body-muted">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-body-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-body-muted" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-surface-dim space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-body-muted text-xs mb-1">Order ID</p>
              <p className="font-mono text-heading text-xs">{order.id}</p>
            </div>
            <div>
              <p className="text-body-muted text-xs mb-1">Email</p>
              <p className="text-heading">{order.email}</p>
            </div>
            <div>
              <p className="text-body-muted text-xs mb-1">Phone</p>
              <p className="text-heading">{order.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-body-muted text-xs mb-1">Locale</p>
              <p className="text-heading uppercase">{order.locale}</p>
            </div>
          </div>

          <div>
            <p className="text-body-muted text-xs mb-2">Items</p>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-heading">
                    {item.productName}
                    {item.variantLabel && (
                      <span className="text-body-muted ml-1 text-xs">({item.variantLabel})</span>
                    )}
                  </span>
                  <span className="text-heading font-medium">
                    {formatCents(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <a
              href={`https://www.sandbox.paypal.com/billing/subscriptions/${order.paypalSubscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-brand-red hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View in PayPal
            </a>

            {!isCancelled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={cancelling}
                className="flex items-center gap-1.5 text-sm text-error hover:underline disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "cancelled">("active");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o))
    );
  };

  const filtered = orders.filter((o) => {
    if (filter === "active") return o.status !== "cancelled" && o.status !== "refunded";
    if (filter === "cancelled") return o.status === "cancelled" || o.status === "refunded";
    return true;
  });

  const totalMRR = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-heading text-3xl font-bold">Subscriptions</h1>
            <p className="text-body-muted text-sm mt-1">
              Active MRR:{" "}
              <span className="font-semibold text-success">{formatCents(totalMRR)}/mo</span>
              {" "}across {orders.filter((o) => o.status !== "cancelled").length} active subscriptions
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-card border border-border hover:bg-surface-dim transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["active", "cancelled", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-card text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-brand-red text-white"
                  : "border border-border text-body-muted hover:text-heading"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-body-muted">Loading subscriptions...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-card">
            <p className="text-body-muted">No subscriptions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <SubscriptionRow key={order.id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
