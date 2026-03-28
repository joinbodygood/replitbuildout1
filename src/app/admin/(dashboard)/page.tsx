"use client";

import { useEffect, useState } from "react";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending_intake: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  refunded: "bg-red-100 text-red-700",
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${accent ? "bg-[#FDE7E7]" : "bg-gray-50"}`}>
          <Icon size={18} className={accent ? "text-[#ED1B1B]" : "text-[#55575A]"} />
        </div>
        <ArrowUpRight size={14} className="text-green-500" />
      </div>
      <p className="text-2xl font-bold text-[#0C0D0F]" style={{ fontFamily: "Poppins, sans-serif" }}>
        {value}
      </p>
      <p className="text-sm text-[#55575A] mt-0.5">{label}</p>
      {sub && <p className="text-xs text-[#55575A] mt-1 opacity-70">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/auth/me").then((r) => r.json()),
    ]).then(([stats, me]) => {
      setData(stats);
      setUser(me.user);
      setLoading(false);
    });
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-[#55575A] text-sm">Loading dashboard…</div>
      </div>
    );
  }

  const { kpis, revenueChart, recentOrders } = data;

  return (
    <div className="flex flex-col h-full">
      <AdminTopBar
        title={`Good day, ${user.name.split(" ")[0]} 👋`}
        breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}
        user={user}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Revenue today"
            value={`$${kpis.revenueToday.toLocaleString()}`}
            sub={`${kpis.ordersToday} orders`}
            accent
          />
          <StatCard
            icon={DollarSign}
            label="Revenue this week"
            value={`$${kpis.revenueWeek.toLocaleString()}`}
            sub={`${kpis.ordersWeek} orders`}
          />
          <StatCard
            icon={DollarSign}
            label="Revenue this month"
            value={`$${kpis.revenueMonth.toLocaleString()}`}
          />
          <StatCard
            icon={TrendingUp}
            label="All-time revenue"
            value={`$${kpis.revenueTotal.toLocaleString()}`}
            sub={`${kpis.ordersTotal} orders total`}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="Pending orders" value={String(kpis.pendingOrders)} accent />
          <StatCard icon={Users} label="New leads this week" value={String(kpis.newLeadsWeek)} />
          <StatCard icon={ShoppingBag} label="Orders this week" value={String(kpis.ordersWeek)} />
          <StatCard icon={Clock} label="Orders this month" value={String(kpis.ordersThisMonth ?? "—")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E5E5E5] p-5">
            <h2
              className="text-sm font-semibold text-[#0C0D0F] mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Revenue — Last 30 days
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#55575A" }}
                  tickFormatter={(v) => v.slice(5)}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#55575A" }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                  labelFormatter={(l) => l}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ED1B1B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-[12px] border border-[#E5E5E5] p-5">
            <h2
              className="text-sm font-semibold text-[#0C0D0F] mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Recent Orders
            </h2>
            <div className="space-y-3">
              {recentOrders.slice(0, 7).map((o: any) => (
                <div key={o.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0C0D0F] truncate">
                      {o.shippingName ?? o.email}
                    </p>
                    <p className="text-xs text-[#55575A] truncate">
                      {o.items?.[0]?.productName ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-[#0C0D0F]">
                      ${(o.total / 100).toFixed(0)}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {o.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/admin/orders"
              className="block mt-4 text-xs text-[#ED1B1B] font-medium hover:underline"
            >
              View all orders →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
