import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

export function HomeCTAs() {
  const t = useTranslations("home");
  const locale = useLocale();

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button href={`/${locale}/quiz`} size="lg">
            {t("ctaQuiz")}
          </Button>
          <Button href={`/${locale}/programs`} variant="outline" size="lg">
            {t("ctaPrograms")}
          </Button>
          <Button href={`/${locale}/insurance-check`} variant="secondary" size="lg">
            {t("ctaInsurance")}
          </Button>
        </div>
      </div>
    </section>
  );
}
