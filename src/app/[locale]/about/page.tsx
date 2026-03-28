import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

type Props = { params: Promise<{ locale: string }> };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("about");

  const values = [
    { title: t("value1Title"), description: t("value1Description") },
    { title: t("value2Title"), description: t("value2Description") },
    { title: t("value3Title"), description: t("value3Description") },
  ];

  return (
    <>
      <section className="py-20 bg-brand-pink-soft">
        <Container narrow>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {t("title")}
          </h1>
          <p className="text-body-muted text-lg text-center">{t("subtitle")}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <h2 className="font-heading text-heading text-2xl font-bold mb-4">
            {t("drLindaTitle")}
          </h2>
          <p className="text-body leading-relaxed mb-8">{t("drLindaBio")}</p>

          <h2 className="font-heading text-heading text-2xl font-bold mb-4">
            {t("teamTitle")}
          </h2>
          <p className="text-body leading-relaxed mb-12">{t("teamDescription")}</p>

          <h2 className="font-heading text-heading text-2xl font-bold mb-6">
            {t("valuesTitle")}
          </h2>
          <div className="grid gap-6">
            {values.map((v) => (
              <Card key={v.title}>
                <h3 className="font-heading text-heading text-lg font-semibold mb-2">
                  {v.title}
                </h3>
                <p className="text-body">{v.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
