import { useTranslations, useLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ locale: string }> };

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HowItWorksContent />;
}

function HowItWorksContent() {
  const t = useTranslations("howItWorks");
  const locale = useLocale();

  const steps = [
    { number: "1", title: t("step1Title"), description: t("step1Description") },
    { number: "2", title: t("step2Title"), description: t("step2Description") },
    { number: "3", title: t("step3Title"), description: t("step3Description") },
    { number: "4", title: t("step4Title"), description: t("step4Description") },
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
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-red text-white font-heading font-bold text-lg flex items-center justify-center">
                  {step.number}
                </div>
                <div>
                  <h2 className="font-heading text-heading text-xl font-semibold mb-2">
                    {step.title}
                  </h2>
                  <p className="text-body leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="font-heading text-heading text-2xl font-bold mb-4">
              {t("ctaTitle")}
            </p>
            <Button href={`/${locale}/quiz`} size="lg">
              {t("ctaButton")}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
