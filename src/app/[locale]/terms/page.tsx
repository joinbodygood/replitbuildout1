import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";

type Props = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}

function TermsContent() {
  const t = useTranslations("legal");
  return (
    <section className="py-20">
      <Container narrow>
        <h1 className="font-heading text-heading text-3xl font-bold mb-2">{t("termsTitle")}</h1>
        <p className="text-body-muted text-sm mb-8">{t("lastUpdated")}: March 27, 2026</p>
        <div className="prose prose-lg text-body"><p>{t("placeholder")}</p></div>
      </Container>
    </section>
  );
}
