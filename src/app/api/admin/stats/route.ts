import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    ordersToday,
    ordersThisWeek,
    ordersThisMonth,
    totalOrders,
    leadsThisWeek,
    pendingOrders,
    recentOrders,
    recentLeads,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: startOfToday } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfWeek } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true }),
    prisma.quizLead.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.order.count({ where: { status: { in: ["pending_intake", "processing"] } } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.quizLead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Revenue chart: last 30 days by day
  const chartOrders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "cancelled" } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  const revenueByDay: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    revenueByDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of chartOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (revenueByDay[day] !== undefined) revenueByDay[day] += o.total;
  }

  const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue: revenue / 100,
  }));

  // Orders by status
  const statusCounts = await prisma.order.groupBy({ by: ["status"], _count: true });

  return NextResponse.json({
    kpis: {
      revenueToday: (ordersToday._sum.total ?? 0) / 100,
      revenueWeek: (ordersThisWeek._sum.total ?? 0) / 100,
      revenueMonth: (ordersThisMonth._sum.total ?? 0) / 100,
      revenueTotal: (totalOrders._sum.total ?? 0) / 100,
      ordersToday: ordersToday._count,
      ordersWeek: ordersThisWeek._count,
      ordersTotal: totalOrders._count,
      newLeadsWeek: leadsThisWeek,
      pendingOrders,
    },
    revenueChart,
    statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count })),
    recentOrders,
    recentLeads,
  });
}
