import { useTranslations } from "next-intl";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-brand-pink-soft py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest mb-4">
          {t("heroEyebrow")}
        </p>
        <h1 className="font-heading text-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
          {t("heroTitle")}
        </h1>
        <p className="text-body-muted text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
      </div>
    </section>
  );
}
