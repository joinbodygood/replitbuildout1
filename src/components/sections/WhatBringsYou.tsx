import Link from "next/link";
import { useLocale } from "next-intl";
import { Scale, Sparkles, Heart, Brain, ClipboardList } from "lucide-react";

const categories = [
  {
    icon: Scale,
    label: { en: "Weight Management", es: "Control de Peso" },
    desc: { en: "GLP-1 medications, personalized plans", es: "Medicamentos GLP-1, planes personalizados" },
    href: { en: "/en/programs", es: "/es/programs" },
    comingSoon: false,
    highlight: false,
  },
  {
    icon: Sparkles,
    label: { en: "Hair & Skin", es: "Cabello y Piel" },
    desc: { en: "Clinically proven treatments", es: "Tratamientos clínicamente probados" },
    href: { en: "/en/programs", es: "/es/programs" },
    comingSoon: true,
    highlight: false,
  },
  {
    icon: Heart,
    label: { en: "Feminine Health", es: "Salud Femenina" },
    desc: { en: "Hormones, perimenopause & more", es: "Hormonas, perimenopausia y más" },
    href: { en: "/en/programs", es: "/es/programs" },
    comingSoon: true,
    highlight: false,
  },
  {
    icon: Brain,
    label: { en: "Mental Wellness", es: "Bienestar Mental" },
    desc: { en: "Anxiety, mood, and cognitive health", es: "Ansiedad, estado de ánimo y salud cognitiva" },
    href: { en: "/en/programs", es: "/es/programs" },
    comingSoon: true,
    highlight: false,
  },
  {
    icon: ClipboardList,
    label: { en: "Not Sure? Take the Quiz", es: "¿No sé? El Quiz" },
    desc: { en: "Get a personalized recommendation in 2 min", es: "Obtén una recomendación personalizada en 2 min" },
    href: { en: "/en/quiz", es: "/es/quiz" },
    comingSoon: false,
    highlight: true,
  },
];

export function WhatBringsYou() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "Nuestros servicios" : "Our services"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-3">
          {isEs ? "¿Qué te trae hoy?" : "What brings you here today?"}
        </h2>
        <p className="text-body-muted text-center mb-10 text-lg">
          {isEs
            ? "Body Good atiende la salud de la mujer de manera integral."
            : "Body Good cares for women's health holistically."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const label = isEs ? cat.label.es : cat.label.en;
            const desc = isEs ? cat.desc.es : cat.desc.en;
            const href = isEs ? cat.href.es : cat.href.en;

            return (
              <Link
                key={cat.label.en}
                href={href}
                className={`group relative flex flex-col gap-3 rounded-card p-6 border transition-all hover:-translate-y-1 hover:shadow-card-hover ${
                  cat.highlight
                    ? "border-brand-red border-2 bg-brand-pink-soft"
                    : "border-border bg-surface hover:border-brand-red"
                }`}
              >
                {cat.comingSoon && (
                  <span className="absolute top-4 right-4 text-xs font-semibold text-body-muted bg-surface-dim px-2 py-0.5 rounded-full border border-border">
                    {isEs ? "Próximamente" : "Coming Soon"}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  cat.highlight ? "bg-brand-red" : "bg-brand-pink-soft"
                }`}>
                  <Icon
                    size={22}
                    className={cat.highlight ? "text-white" : "text-brand-red"}
                  />
                </div>
                <div>
                  <p className={`font-heading font-bold text-base mb-1 ${cat.highlight ? "text-brand-red" : "text-heading"}`}>
                    {label}
                  </p>
                  <p className="text-body-muted text-sm">{desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
