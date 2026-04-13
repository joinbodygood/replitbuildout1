import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { dittofeed, listTemplates } from "@/lib/dittofeed";

type Props = { params: Promise<{ locale: string }> };

export default async function TemplatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const templates = dittofeed.enabled ? await listTemplates() : [];

  return (
    <section className="py-8">
      <Container>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">
          Templates
        </h1>
        <p className="text-body-muted mb-8">
          Email and SMS templates. Use Liquid conditionals to handle program
          variants per Section 12 of the spec.
        </p>

        {templates.length === 0 ? (
          <Card>
            <p className="text-body-muted">No templates yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t) => (
              <Card key={t.id}>
                <p className="font-heading font-bold">{t.name}</p>
                <p className="text-body-muted text-sm">{t.type}</p>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
