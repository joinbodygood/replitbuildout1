import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.quizLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quizLead.count({ where }),
  ]);

  // Enrich with order data
  const emails = leads.map((l) => l.email);
  const orders = await prisma.order.findMany({
    where: { email: { in: emails } },
    select: { email: true, total: true, createdAt: true, status: true },
  });

  const ordersByEmail: Record<string, typeof orders> = {};
  for (const o of orders) {
    if (!ordersByEmail[o.email]) ordersByEmail[o.email] = [];
    ordersByEmail[o.email].push(o);
  }

  const enriched = leads.map((l) => {
    const userOrders = ordersByEmail[l.email] ?? [];
    const ltv = userOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      ...l,
      orderCount: userOrders.length,
      ltv: ltv / 100,
      lastOrderDate: userOrders[0]?.createdAt ?? null,
    };
  });

  return NextResponse.json({ patients: enriched, total, page, limit });
}
