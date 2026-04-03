import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "25"));
  const search  = searchParams.get("search") ?? "";
  const segment = searchParams.get("segment") ?? "";

  const where: any = {};
  if (search) {
    where.OR = [
      { email:     { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName:  { contains: search, mode: "insensitive" } },
    ];
  }
  if (segment) {
    where.segments = { has: segment };
  }

  const [customers, total] = await Promise.all([
    db.importedCustomer.findMany({
      where,
      orderBy: { ordersCount: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    db.importedCustomer.count({ where }),
  ]);

  // Segment counts for sidebar filters
  const segmentCounts = await db.$queryRaw<Array<{ seg: string; count: bigint }>>`
    SELECT unnest(segments) as seg, COUNT(*) as count
    FROM "ImportedCustomer"
    GROUP BY seg
    ORDER BY count DESC
  `;

  const totalCustomers = await db.importedCustomer.count();

  return NextResponse.json({
    customers,
    total,
    page,
    limit,
    totalCustomers,
    segmentCounts: segmentCounts.map((s) => ({ segment: s.seg, count: Number(s.count) })),
  });
}
