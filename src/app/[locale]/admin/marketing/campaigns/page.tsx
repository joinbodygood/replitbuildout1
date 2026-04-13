import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

type Props = { params: Promise<{ locale: string }> };

export default async function CampaignsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Campaigns
        </h1>
        <p className="text-body-muted mb-8">
          One-off broadcast sends to segments. 3x/week cadence per Section 8 of
          the spec (Tue educational / Thu promotional / Sat spotlight).
        </p>
        <Card>
          <p className="text-body-muted">
            Campaign scheduler coming in Phase 5. For now, use Dittofeed UI.
          </p>
        </Card>
      </Container>
    </section>
  );
}
