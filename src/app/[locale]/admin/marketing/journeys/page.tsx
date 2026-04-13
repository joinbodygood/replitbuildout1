import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { dittofeed, listJourneys } from "@/lib/dittofeed";

type Props = { params: Promise<{ locale: string }> };

export default async function JourneysPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const journeys = dittofeed.enabled ? await listJourneys() : [];

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Journeys
        </h1>
        <p className="text-body-muted mb-8">
          Event-triggered automated sequences. Edit in Dittofeed UI for now;
          inline editor coming in Phase 2.
        </p>

        {journeys.length === 0 ? (
          <Card>
            <p className="text-body-muted">
              {dittofeed.enabled
                ? "No journeys yet. Create your first one in Dittofeed."
                : "Dittofeed not connected — see /admin/marketing for setup."}
            </p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border text-left">
                  <th className="py-3 px-4 font-heading text-heading text-sm">
                    Name
                  </th>
                  <th className="py-3 px-4 font-heading text-heading text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {journeys.map((j) => (
                  <tr
                    key={j.id}
                    className="border-b border-border-light hover:bg-surface-dim"
                  >
                    <td className="py-3 px-4 text-sm font-medium">{j.name}</td>
                    <td className="py-3 px-4 text-sm">{j.status}</td>
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
