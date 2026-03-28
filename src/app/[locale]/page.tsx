import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-wide mb-4">
          {t("heroEyebrow")}
        </p>
        <h1 className="font-heading text-heading text-4xl md:text-5xl font-bold leading-tight mb-6">
          {t("heroTitle")}
        </h1>
        <p className="text-body-muted text-lg mb-8">
          {t("heroSubtitle")}
        </p>
      </div>
    </main>
  );
}
