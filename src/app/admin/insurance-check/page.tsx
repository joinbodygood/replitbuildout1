import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function InsuranceCheckAdminDashboard() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  const since30d = new Date(Date.now() - 30 * 86400000);
  const sinceTotal = new Date(Date.now() - 90 * 86400000);

  const [leads30d, hotLeads30d, conversions30d, indexCount, freshIndex, workerErrs] = await Promise.all([
    db.insuranceCheckLead.count({ where: { createdAt: { gte: since30d } } }),
    db.insuranceCheckLead.count({
      where: {
        createdAt: { gte: since30d },
        resultBucket: { in: ["high_probability", "coverage_with_pa"] },
      },
    }),
    db.insuranceCheckLead.count({
      where: { createdAt: { gte: since30d }, convertedToPaid: true },
    }),
    db.coverageIndex.count(),
    db.coverageIndex.count({ where: { lastSeenAt: { gte: since30d } } }),
    db.workerRun.findMany({
      where: { status: "error", startedAt: { gte: sinceTotal } },
      take: 20,
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const conversionPct = hotLeads30d
    ? ((conversions30d / hotLeads30d) * 100).toFixed(1)
    : "0";
  const freshPct = indexCount
    ? ((freshIndex / indexCount) * 100).toFixed(1)
    : "0";

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <h1 className="text-3xl font-normal mb-6">Insurance Check &mdash; 30-day KPIs</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Leads (30d)" value={leads30d.toLocaleString()} />
        <Stat label="Hot leads (30d)" value={hotLeads30d.toLocaleString()} />
        <Stat
          label="$25 conversions"
          value={`${conversions30d} (${conversionPct}%)`}
        />
        <Stat label="Index freshness" value={`${freshPct}% < 30d`} />
      </div>
      <h2 className="text-xl font-semibold mb-3">Recent worker errors</h2>
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {workerErrs.length === 0 && (
          <p className="p-4 text-sm text-neutral-500">
            No errors in the last 90 days.
          </p>
        )}
        {workerErrs.map((w) => (
          <div
            key={w.id}
            className="border-b border-neutral-100 px-4 py-3 last:border-b-0"
          >
            <div className="flex justify-between text-xs text-neutral-500">
              <span>{w.workerName}</span>
              <span>{w.startedAt.toISOString()}</span>
            </div>
            <p className="text-sm text-[#ED1B1B] mt-1">{w.errorMessage}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4">
      <p className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
        {label}
      </p>
      <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
    </div>
  );
}
