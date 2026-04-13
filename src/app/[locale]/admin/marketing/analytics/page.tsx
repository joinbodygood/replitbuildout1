import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

type Props = { params: Promise<{ locale: string }> };

export default async function AnalyticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Analytics
        </h1>
        <p className="text-body-muted mb-8">
          Sends, opens, clicks and revenue attribution. Wired in Phase 5.
        </p>
        <Card>
          <p className="text-body-muted">
            Pulls from Dittofeed + Postmark APIs. See Section 14 of the spec
            for target metrics.
          </p>
        </Card>
      </Container>
    </section>
  );
}
