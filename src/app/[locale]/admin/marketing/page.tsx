import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/db";
import { dittofeed, listJourneys, listTemplates, listSegments } from "@/lib/dittofeed";

type Props = { params: Promise<{ locale: string }> };

export default async function MarketingDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [journeys, templates, segments, leadCount, recentOrders] =
    await Promise.all([
      dittofeed.enabled ? listJourneys() : [],
      dittofeed.enabled ? listTemplates() : [],
      dittofeed.enabled ? listSegments() : [],
      db.quizLead.count(),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          email: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const activeJourneys = journeys.filter((j) => j.status === "Running");
  const emailTemplates = templates.filter((t) => t.type === "Email");
  const smsTemplates = templates.filter((t) => t.type === "Sms");

  const stats = [
    {
      label: "Active journeys",
      value: activeJourneys.length,
      total: journeys.length,
      href: `/${locale}/admin/marketing/journeys`,
    },
    {
      label: "Email templates",
      value: emailTemplates.length,
      href: `/${locale}/admin/marketing/templates`,
    },
    {
      label: "SMS templates",
      value: smsTemplates.length,
      href: `/${locale}/admin/marketing/templates`,
    },
    {
      label: "Segments",
      value: segments.length,
      href: `/${locale}/admin/marketing/segments`,
    },
    {
      label: "Quiz leads",
      value: leadCount,
      href: `/${locale}/admin/marketing/leads`,
    },
  ];

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-heading text-3xl font-bold mb-1">
              Marketing
            </h1>
            <p className="text-body-muted text-sm">
              Communications engine — Dittofeed + Postmark + Twilio
            </p>
          </div>
          {dittofeed.enabled && (
            <a
              href="https://dittofeed.bgs.dev/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-body-muted hover:text-brand-red transition-colors"
            >
              Open Dittofeed →
            </a>
          )}
        </div>

        {!dittofeed.enabled && (
          <Card className="mb-6 border-warning bg-yellow-50">
            <p className="text-sm">
              <strong>Dittofeed not connected.</strong> Set{" "}
              <code>DITTOFEED_API_BASE</code>, <code>DITTOFEED_WRITE_KEY</code>{" "}
              and <code>DITTOFEED_WORKSPACE_ID</code> in your environment.
            </p>
          </Card>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="hover:bg-surface-dim transition-colors cursor-pointer text-center">
                <p className="font-heading text-heading text-2xl font-bold">
                  {s.value}
                  {s.total !== undefined && (
                    <span className="text-body-muted text-sm font-normal">
                      {" "}/ {s.total}
                    </span>
                  )}
                </p>
                <p className="text-body-muted text-sm">{s.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Journeys */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-heading text-xl font-bold">
                Active journeys
              </h2>
              <Link
                href={`/${locale}/admin/marketing/journeys`}
                className="text-sm text-body-muted hover:text-brand-red transition-colors"
              >
                View all →
              </Link>
            </div>
            {activeJourneys.length === 0 ? (
              <Card>
                <p className="text-body-muted text-sm">
                  No active journeys.{" "}
                  {dittofeed.enabled
                    ? "Create your first one in Dittofeed."
                    : "Connect Dittofeed to get started."}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeJourneys.map((j) => (
                  <Card key={j.id} className="!p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-heading font-bold text-sm">
                        {j.name}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Running
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders (for comms context) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-heading text-xl font-bold">
                Recent orders
              </h2>
              <Link
                href={`/${locale}/admin`}
                className="text-sm text-body-muted hover:text-brand-red transition-colors"
              >
                View all →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <Card>
                <p className="text-body-muted text-sm">No orders yet.</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border text-left">
                      <th className="py-2 px-3 font-heading text-heading text-xs">
                        Email
                      </th>
                      <th className="py-2 px-3 font-heading text-heading text-xs">
                        Total
                      </th>
                      <th className="py-2 px-3 font-heading text-heading text-xs">
                        Status
                      </th>
                      <th className="py-2 px-3 font-heading text-heading text-xs">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border-light hover:bg-surface-dim"
                      >
                        <td className="py-2 px-3 text-xs">{o.email}</td>
                        <td className="py-2 px-3 text-xs font-medium">
                          {formatPrice(o.total)}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              o.status === "pending_intake"
                                ? "bg-yellow-100 text-yellow-800"
                                : o.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : o.status === "shipped"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {o.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-body-muted">
                          {new Date(o.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick nav */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Campaigns", href: `/${locale}/admin/marketing/campaigns` },
            { label: "Analytics", href: `/${locale}/admin/marketing/analytics` },
            { label: "Settings", href: `/${locale}/admin/marketing/settings` },
            { label: "Leads", href: `/${locale}/admin/marketing/leads` },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="hover:bg-surface-dim transition-colors cursor-pointer !p-4 text-center">
                <p className="font-heading text-heading text-sm font-bold">
                  {item.label}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
