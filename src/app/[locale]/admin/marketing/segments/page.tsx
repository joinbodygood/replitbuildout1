import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { dittofeed, listSegments } from "@/lib/dittofeed";

type Props = { params: Promise<{ locale: string }> };

export default async function SegmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const segments = dittofeed.enabled ? await listSegments() : [];

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Segments
        </h1>
        <p className="text-body-muted mb-8">
          Audience definitions used by journeys and broadcast campaigns.
        </p>

        {segments.length === 0 ? (
          <Card>
            <p className="text-body-muted">No segments yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((s) => (
              <Card key={s.id}>
                <p className="font-heading font-bold">{s.name}</p>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
