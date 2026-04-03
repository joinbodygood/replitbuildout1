"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

type LogEntry = {
  id: string;
  type: string;
  filename: string | null;
  status: string;
  imported: number;
  skipped: number;
  errors: number;
  total: number;
  notes: string | null;
  createdAt: string;
};

type Summary = {
  type: string;
  _sum: { imported: number | null; skipped: number | null; errors: number | null };
  _max: { createdAt: string | null };
  _count: { id: number };
};

const DATA_TYPES = [
  { key: "customers", label: "Customers", desc: "Shopify customer export" },
  { key: "reviews", label: "Reviews", desc: "Judge.me JSON export" },
  { key: "referrals", label: "Referral Members", desc: "Referral program CSV" },
  { key: "blog", label: "Blog Posts", desc: "Shopify blog export" },
  { key: "pages", label: "Legal Pages", desc: "Shopify pages export" },
];

const TYPE_LINKS: Record<string, string> = {
  customers: "/admin/settings/import/customers",
  reviews: "/admin/settings/import/reviews",
  referrals: "/admin/settings/import/referrals",
};

export default function MigrationDashboardPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/import-logs");
    const data = await res.json();
    setLogs(data.logs ?? []);
    setSummary(data.summary ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function getSummary(type: string) {
    return summary.find((s) => s.type === type);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-heading text-2xl font-bold flex items-center gap-2">
            <Database size={22} />
            Migration Dashboard
          </h1>
          <p className="text-body-muted text-sm mt-1">
            Import status and history for all data migration types
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-card text-sm hover:border-brand-red hover:text-brand-red transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {DATA_TYPES.map((dt) => {
          const s = getSummary(dt.key);
          const imported = s?._sum?.imported ?? 0;
          const hasData = imported > 0;
          const lastRun = s?._max?.createdAt;
          const runCount = s?._count?.id ?? 0;

          return (
            <div key={dt.key} className="bg-white border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-bold text-heading text-base">{dt.label}</p>
                  <p className="text-xs text-body-muted">{dt.desc}</p>
                </div>
                {hasData ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                    <CheckCircle size={11} /> Done
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                    <Clock size={11} /> Pending
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Imported", value: s?._sum?.imported ?? 0, green: true },
                  { label: "Skipped", value: s?._sum?.skipped ?? 0 },
                  { label: "Errors", value: s?._sum?.errors ?? 0, red: (s?._sum?.errors ?? 0) > 0 },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-2 bg-surface-dim rounded-card">
                    <p className={`text-lg font-bold font-heading ${stat.green && stat.value > 0 ? "text-emerald-600" : stat.red ? "text-red-600" : "text-heading"}`}>
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-body-muted">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-body-muted">
                  {runCount > 0
                    ? `${runCount} run${runCount !== 1 ? "s" : ""} · Last: ${new Date(lastRun!).toLocaleDateString()}`
                    : "Not yet imported"}
                </p>
                {TYPE_LINKS[dt.key] && (
                  <a
                    href={TYPE_LINKS[dt.key]}
                    className="text-xs font-medium text-brand-red hover:underline"
                  >
                    {hasData ? "Re-import →" : "Import →"}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity log */}
      <div>
        <h2 className="font-heading font-bold text-heading text-lg mb-4">Import Activity Log</h2>
        <div className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-dim">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-body-muted uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-body-muted uppercase tracking-wide">File</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Imported</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Skipped</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-body-muted uppercase tracking-wide">Errors</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-body-muted uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-body-muted">Loading…</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-body-muted">No import activity yet</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-dim/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="capitalize font-medium text-heading">{log.type}</span>
                    </td>
                    <td className="px-4 py-3 text-body-muted text-xs font-mono truncate max-w-[180px]">
                      {log.filename ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {log.status === "completed" ? (
                        <span className="flex items-center justify-center gap-1 text-xs text-emerald-700">
                          <CheckCircle size={12} /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-xs text-red-600">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-body-muted">{log.total}</td>
                    <td className="px-4 py-3 text-center font-medium text-emerald-600">{log.imported}</td>
                    <td className="px-4 py-3 text-center text-body-muted">{log.skipped}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={log.errors > 0 ? "text-red-600 font-medium" : "text-body-muted"}>{log.errors}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-body-muted">
                      {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
