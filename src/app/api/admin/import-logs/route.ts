import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const logs = await db.importLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const summary = await db.importLog.groupBy({
    by: ["type"],
    _sum: { imported: true, skipped: true, errors: true },
    _max: { createdAt: true },
    _count: { id: true },
  });

  return NextResponse.json({ logs, summary });
}
