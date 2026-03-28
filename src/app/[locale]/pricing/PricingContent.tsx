"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Variant = {
  id: string;
  supplyDuration: string | null;
  price: number;
  compareAtPrice: number | null;
  isAvailable: boolean;
};

type Translation = {
  name: string;
  descriptionShort: string | null;
};

type Product = {
  id: string;
  slug: string;
  category: string;
  sortOrder: number;
  variants: Variant[];
  translations: Translation[];
};

type Props = {
  products: Product[];
  locale: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function getPrice(product: Product, duration: string): string | null {
  const v = product.variants.find((v) => v.supplyDuration === duration);
  return v ? fmt(v.price) : null;
}

function getTotal(product: Product, duration: string): string | null {
  const v = product.variants.find((v) => v.supplyDuration === duration);
  if (!v) return null;
  if (duration === "3-month") return `${fmt(v.price * 3)} total`;
  if (duration === "6-month") return `${fmt(v.price * 6)} total`;
  return null;
}

// ─── Row display name overrides ───────────────────────────────────────────────
const DISPLAY_NAMES: Record<string, { en: string; es: string }> = {
  "compounded-semaglutide":           { en: "Semaglutide",        es: "Semaglutida"          },
  "compounded-tirzepatide-starter":   { en: "Tirz Starter",       es: "Tirz Inicio"          },
  "compounded-tirzepatide-maintenance":{ en: "Tirz Maintenance",   es: "Tirz Mantenimiento"   },
  "oral-semaglutide":                 { en: "Oral Semaglutide",   es: "Semaglutida Oral"     },
};

// ─── Section groupings ────────────────────────────────────────────────────────
type Section = {
  titleEn: string;
  titleEs: string;
  categories: string[];
  note?: { en: string; es: string };
  cta?: { href: string; en: string; es: string };
};

const SECTIONS: Section[] = [
  {
    titleEn: "GLP-1 Programs",
    titleEs: "Programas GLP-1",
    categories: ["compounded", "oral"],
    note: {
      en: "All plans include physician consult, prescription & follow-ups.",
      es: "Todos los planes incluyen consulta médica, receta y seguimiento.",
    },
  },
  {
    titleEn: "Insurance & Managed Rx",
    titleEs: "Seguro y Rx Administrado",
    categories: ["insurance", "branded_mgmt"],
    cta: {
      href: "/insurance-check",
      en: "Check your coverage for free →",
      es: "Verificar cobertura gratis →",
    },
  },
  {
    titleEn: "Wellness Injections",
    titleEs: "Inyecciones de Bienestar",
    categories: ["wellness-injection"],
    note: {
      en: "Physician-prescribed. Shipped to your door.",
      es: "Con receta médica. Enviadas a domicilio.",
    },
    cta: {
      href: "/wellness-injections",
      en: "View full catalog →",
      es: "Ver catálogo completo →",
    },
  },
];

// ─── Price cell ───────────────────────────────────────────────────────────────
function PriceCell({
  main, sub, isBest,
}: {
  main: string | null;
  sub?: string | null;
  isBest?: boolean;
}) {
  if (!main) {
    return <td className="px-6 py-4 text-center text-gray-300 text-lg">—</td>;
  }
  return (
    <td className="px-6 py-4 text-center">
      <span className="font-heading font-bold text-gray-900 text-base">{main}</span>
      {sub && <span className="text-gray-400 text-sm">/mo</span>}
      {isBest && (
        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide mt-0.5">Best price</div>
      )}
    </td>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PricingContent({ products, locale }: Props) {
  const isEs = locale === "es";

  return (
    <section className="py-12 pb-24">
      <div className="max-w-4xl mx-auto px-5 space-y-14">
        {SECTIONS.map((section) => {
          const sectionProducts = products.filter((p) =>
            section.categories.includes(p.category)
          );
          if (sectionProducts.length === 0) return null;

          return (
            <div key={section.titleEn}>
              {/* Section header */}
              <div className="flex items-center gap-4 mb-1">
                <h2 className="font-heading font-bold text-xl text-gray-900 whitespace-nowrap">
                  {isEs ? section.titleEs : section.titleEn}
                </h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {section.note && (
                <p className="text-sm text-gray-400 mb-5">
                  {isEs ? section.note.es : section.note.en}
                </p>
              )}

              {/* Table */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">
                        {isEs ? "Programa" : "Program"}
                      </th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isEs ? "1 Mes" : "1 Month"}
                      </th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isEs ? "3 Meses" : "3 Months"}
                      </th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isEs ? "6 Meses" : "6 Months"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sectionProducts.map((product, i) => {
                      const t = product.translations[0];
                      if (!t) return null;

                      const displayName = DISPLAY_NAMES[product.slug];
                      const name = displayName
                        ? (isEs ? displayName.es : displayName.en)
                        : t.name;

                      const oneMonth  = getPrice(product, "1-month")  || getPrice(product, "one-time");
                      const threeMonth = getPrice(product, "3-month");
                      const sixMonth  = getPrice(product, "6-month");

                      // For insurance-style products: show flat total instead of /mo
                      const isInsuranceLike = product.category === "insurance";

                      // Special 3-month display for insurance (flat total)
                      const threeVariant = product.variants.find(v => v.supplyDuration === "3-month");
                      const threeDisplay = isInsuranceLike && threeVariant
                        ? `${fmt(threeVariant.price)} total`
                        : threeMonth;

                      const hasSixMonth = !!sixMonth;
                      const isLastInSection = i === sectionProducts.length - 1;

                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-[#fdf9f9] transition-colors group ${
                            !isLastInSection ? "border-b border-gray-50" : ""
                          }`}
                        >
                          {/* Program name */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-[#ed1b1b] transition-colors">
                              {name}
                            </p>
                            {t.descriptionShort && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                {t.descriptionShort}
                              </p>
                            )}
                          </td>

                          {/* 1 Month */}
                          <PriceCell
                            main={oneMonth}
                            sub={!isInsuranceLike ? oneMonth : null}
                          />

                          {/* 3 Months */}
                          <td className="px-6 py-4 text-center">
                            {threeDisplay ? (
                              <>
                                <span className="font-heading font-bold text-gray-900 text-base">
                                  {isInsuranceLike ? threeDisplay : threeMonth}
                                </span>
                                {!isInsuranceLike && threeMonth && (
                                  <span className="text-gray-400 text-sm">/mo</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-300 text-lg">—</span>
                            )}
                          </td>

                          {/* 6 Months */}
                          <td className="px-6 py-4 text-center">
                            {sixMonth ? (
                              <div>
                                <span className="font-heading font-bold text-gray-900 text-base">{sixMonth}</span>
                                <span className="text-gray-400 text-sm">/mo</span>
                                <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide mt-0.5">
                                  {isEs ? "Mejor precio" : "Best price"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-lg">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Section CTA */}
              {section.cta && (
                <div className="mt-3 text-right">
                  <Link
                    href={`/${locale}${section.cta.href}`}
                    className="inline-flex items-center gap-1 text-sm text-[#ed1b1b] font-semibold hover:underline"
                  >
                    {isEs ? section.cta.es : section.cta.en}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Bottom CTA ── */}
        <div className="rounded-2xl bg-gradient-to-br from-[#fde7e7] to-pink-50 border border-red-100 p-8 text-center">
          <p className="font-heading font-bold text-2xl text-gray-900 mb-2">
            {isEs ? "¿No estás segura cuál plan es para ti?" : "Not sure which plan is right for you?"}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {isEs
              ? "Nuestro cuestionario de 2 minutos te conecta con el programa perfecto."
              : "Our 2-minute quiz matches you with the perfect program for your goals."}
          </p>
          <Link
            href={`/${locale}/quiz`}
            className="inline-block px-8 py-3.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90 bg-[#ed1b1b]"
          >
            {isEs ? "Tomar el cuestionario — gratis" : "Take the Quiz — Free"}
          </Link>
        </div>
      </div>
    </section>
  );
}
