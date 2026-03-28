import { useTranslations } from "next-intl";

export function StatsBar() {
  const t = useTranslations("home");

  const stats = [
    { value: "2,500+", label: t("statsPatients") },
    { value: "15-20%", label: t("statsWeightLoss") },
    { value: "96%", label: t("statsSatisfaction") },
  ];

  return (
    <section className="py-12 bg-surface-dim border-y border-border">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-heading text-3xl md:text-4xl font-bold">
                {stat.value}
              </p>
              <p className="text-body-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
