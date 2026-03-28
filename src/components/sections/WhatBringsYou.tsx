import Link from "next/link";
import { useLocale } from "next-intl";

const categories = [
  {
    icon: "⚖️",
    label: { en: "Lose Weight", es: "Bajar de Peso" },
    href: { en: "/en/programs", es: "/es/programs" },
    bg: "bg-rose-50",
  },
  {
    icon: "💊",
    label: { en: "GLP-1 Medications", es: "Medicamentos GLP-1" },
    href: { en: "/en/products/compounded-semaglutide", es: "/es/products/compounded-semaglutide" },
    bg: "bg-pink-50",
  },
  {
    icon: "🏥",
    label: { en: "Use Insurance", es: "Usar Seguro" },
    href: { en: "/en/insurance-check", es: "/es/insurance-check" },
    bg: "bg-red-50",
  },
  {
    icon: "💉",
    label: { en: "No Needles Option", es: "Sin Agujas" },
    href: { en: "/en/products/oral-glp1", es: "/es/products/oral-glp1" },
    bg: "bg-orange-50",
  },
  {
    icon: "📋",
    label: { en: "Branded Rx", es: "Receta de Marca" },
    href: { en: "/en/products/branded-glp1-rx", es: "/es/products/branded-glp1-rx" },
    bg: "bg-amber-50",
  },
  {
    icon: "🤔",
    label: { en: "Not Sure? Take the Quiz", es: "¿No sé? El Quiz" },
    href: { en: "/en/quiz", es: "/es/quiz" },
    bg: "bg-brand-pink-soft",
    highlight: true,
  },
];

export function WhatBringsYou() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-heading text-heading text-3xl font-bold text-center mb-10">
          {isEs ? "¿Qué te trae hoy?" : "What brings you here today?"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.label.en}
              href={isEs ? cat.href.es : cat.href.en}
              className={`group flex flex-col items-center justify-center gap-3 rounded-card p-6 text-center border transition-all hover:-translate-y-1 hover:shadow-card-hover ${
                cat.highlight
                  ? "border-brand-red border-2 bg-brand-pink-soft"
                  : `border-border ${cat.bg} hover:border-brand-red`
              }`}
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className={`font-heading font-semibold text-sm ${cat.highlight ? "text-brand-red" : "text-heading"}`}>
                {isEs ? cat.label.es : cat.label.en}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
