import { useTranslations } from "next-intl";

export function TrustBar() {
  const t = useTranslations("home");

  const badges = [
    "HIPAA Compliant",
    "Board-Certified Physicians",
    "Licensed Pharmacy",
    "Bilingual Care",
  ];

  return (
    <section className="py-10 bg-surface">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-body-muted text-sm font-medium mb-6">
          {t("trustTitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-dim rounded-pill text-sm text-body-muted border border-border"
            >
              <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
