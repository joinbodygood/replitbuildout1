import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";
import { getWorkload } from "@/lib/pa/assignment-service";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [casesByStage, approvalData, totalCases, teamWorkload, avgProcessing] = await Promise.all([
    prisma.insuranceCase.groupBy({ by: ["stage"], _count: { id: true } }),
    prisma.pASubmission.groupBy({
      by: ["drug", "status"],
      _count: { id: true },
      where: { status: { in: ["approved", "denied"] } },
    }),
    prisma.insuranceCase.count(),
    getWorkload(),
    prisma.insuranceCase.findMany({
      where: { approvedAt: { not: null } },
      select: { createdAt: true, approvedAt: true },
    }),
  ]);

  const byStage: Record<string, number> = {};
  for (const row of casesByStage) {
    byStage[row.stage] = row._count.id;
  }

  const approvalRates: Record<string, { approved: number; denied: number; total: number; rate: number }> = {};
  for (const row of approvalData) {
    if (!approvalRates[row.drug]) {
      approvalRates[row.drug] = { approved: 0, denied: 0, total: 0, rate: 0 };
    }
    if (row.status === "approved") approvalRates[row.drug].approved = row._count.id;
    if (row.status === "denied") approvalRates[row.drug].denied = row._count.id;
  }
  for (const drug of Object.keys(approvalRates)) {
    const d = approvalRates[drug];
    d.total = d.approved + d.denied;
    d.rate = d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0;
  }

  let avgProcessingDays = 0;
  if (avgProcessing.length > 0) {
    const totalDays = avgProcessing.reduce((sum, c) => {
      const days = (c.approvedAt!.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    avgProcessingDays = Math.round(totalDays / avgProcessing.length);
  }

  return NextResponse.json({
    byStage,
    approvalRates,
    totalCases,
    teamWorkload,
    avgProcessingDays,
  });
}
