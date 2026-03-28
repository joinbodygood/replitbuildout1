import Link from "next/link";
import { useLocale } from "next-intl";

export function ThreePaths() {
  const locale = useLocale();
  const isEs = locale === "es";

  const paths = [
    {
      icon: "🤔",
      badge: isEs ? "MÁS POPULAR" : "MOST POPULAR",
      heading: isEs ? "No estoy segura qué quiero" : "Not sure what you want?",
      subheading: isEs
        ? "Toma nuestro quiz de 2 minutos y te recomendamos el programa perfecto para ti."
        : "Take our 2-minute quiz and we'll recommend the perfect program for you.",
      cta: isEs ? "Tomar el Quiz →" : "Take the Quiz →",
      href: `/${locale}/quiz`,
      style: "primary",
      detail: isEs
        ? "Quiz · Recomendación personalizada · Email al final"
        : "Quiz · Personalized recommendation · Email collected at end",
    },
    {
      icon: "💊",
      badge: null,
      heading: isEs ? "Ya sé lo que quiero" : "I know what I want",
      subheading: isEs
        ? "Explora nuestros programas GLP-1, precios transparentes y selecciona el tuyo."
        : "Browse our GLP-1 programs, transparent pricing, and pick your plan.",
      cta: isEs ? "Ver Programas →" : "See Programs →",
      href: `/${locale}/programs`,
      style: "outline",
      detail: isEs
        ? "Semaglutida · Tirzepatida · GLP-1 Oral · Receta de Marca"
        : "Semaglutide · Tirzepatide · Oral GLP-1 · Branded Rx",
    },
    {
      icon: "🏥",
      badge: null,
      heading: isEs
        ? "¿Mi seguro cubre mis medicamentos?"
        : "Will my insurance cover my meds?",
      subheading: isEs
        ? "Verifica gratis en 30 segundos si tu aseguradora cubre medicamentos GLP-1."
        : "Check for free in 30 seconds if your insurer covers GLP-1 medications.",
      cta: isEs ? "Verificar Cobertura Gratis →" : "Check Coverage Free →",
      href: `/${locale}/insurance-check`,
      style: "outline",
      detail: isEs
        ? "Cobertura de Blue Cross, Aetna, United, Cigna y más"
        : "Covers Blue Cross, Aetna, United, Cigna & more",
    },
  ];

  return (
    <section className="py-16 bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-3">
          {isEs ? "¿Por dónde quieres empezar?" : "Where would you like to start?"}
        </h2>
        <p className="text-body-muted text-center text-lg mb-10">
          {isEs
            ? "Elige el camino que mejor te describe."
            : "Choose the path that best describes you."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {paths.map((path) => (
            <Link
              key={path.heading}
              href={path.href}
              className={`group relative flex flex-col rounded-card p-7 border-2 transition-all hover:-translate-y-1 hover:shadow-card-hover ${
                path.style === "primary"
                  ? "border-brand-red bg-brand-pink-soft"
                  : "border-border bg-surface hover:border-brand-red"
              }`}
            >
              {path.badge && (
                <span className="absolute -top-3 left-6 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full">
                  {path.badge}
                </span>
              )}

              <div className="text-4xl mb-4">{path.icon}</div>

              <h3 className="font-heading text-heading text-xl font-bold mb-2 leading-snug">
                {path.heading}
              </h3>
              <p className="text-body-muted text-sm leading-relaxed mb-5 flex-grow">
                {path.subheading}
              </p>

              <div className="border-t border-border pt-4 mt-auto">
                <p className="text-body-muted text-xs mb-3">{path.detail}</p>
                <span
                  className={`inline-flex items-center font-heading font-semibold text-sm transition-colors ${
                    path.style === "primary"
                      ? "text-brand-red"
                      : "text-body group-hover:text-brand-red"
                  }`}
                >
                  {path.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
