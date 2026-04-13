import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

export default async function LeadsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // For MVP we surface quiz leads from Prisma; ManyChat + OpenSend will be
  // added in Phase 4 once their webhook handlers land.
  const leads = await db.quizLead.findMany({
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Leads
        </h1>
        <p className="text-body-muted mb-8">
          Lead pipeline. Quiz leads shown today; ManyChat + OpenSend wire up in
          Phase 4.
        </p>

        {leads.length === 0 ? (
          <Card>
            <p className="text-body-muted">No leads yet.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-3 px-4 font-heading text-heading text-sm">Email</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Outcome</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Source</th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-border-light hover:bg-surface-dim"
                  >
                    <td className="py-3 px-4 text-sm">{l.email}</td>
                    <td className="py-3 px-4 text-sm">{l.quizOutcome ?? "—"}</td>
                    <td className="py-3 px-4 text-sm text-body-muted">
                      {l.utmSource ?? "organic"}
                    </td>
                    <td className="py-3 px-4 text-sm text-body-muted">
                      {l.completedAt
                        ? new Date(l.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}
