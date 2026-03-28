"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, Shield, FlaskConical, Pill, Tag, Syringe,
  Sparkles, Brain, Heart, ChevronRight, Star,
} from "lucide-react";

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
  descriptionLong: string | null;
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
const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

function getVariant(product: Product, duration: string) {
  return product.variants.find((v) => v.supplyDuration === duration) ?? null;
}

function lowestPrice(product: Product): number | null {
  const prices = product.variants.filter((v) => v.isAvailable).map((v) => v.price);
  return prices.length ? Math.min(...prices) : null;
}

// ─── GLP-1 program metadata (bullets + drug equivalents) ─────────────────────
const PROGRAM_META: Record<string, { equiv?: string; bullets: string[]; accent: string; icon: React.ElementType }> = {
  "compounded-semaglutide": {
    equiv: "= Ozempic / Wegovy active ingredient",
    accent: "#ed1b1b",
    icon: FlaskConical,
    bullets: [
      "Physician-prescribed & monitored",
      "Monthly, 3-month, or 6-month supply",
      "Shipped to your door, discreetly",
      "Includes follow-up check-ins",
      "Dosage adjustments included",
    ],
  },
  "compounded-tirzepatide-starter": {
    equiv: "= Mounjaro / Zepbound active ingredient",
    accent: "#7c3aed",
    icon: FlaskConical,
    bullets: [
      "Starter doses (2.5–7.5 mg/week)",
      "Physician-prescribed & monitored",
      "Monthly, 3-month, or 6-month supply",
      "Shipped to your door, discreetly",
      "Dosage adjustments included",
    ],
  },
  "compounded-tirzepatide-maintenance": {
    equiv: "= Mounjaro / Zepbound active ingredient",
    accent: "#0ea5e9",
    icon: FlaskConical,
    bullets: [
      "Maintenance doses (10–15 mg/week)",
      "Physician-prescribed & monitored",
      "Monthly, 3-month, or 6-month supply",
      "Shipped to your door, discreetly",
      "Dosage adjustments included",
    ],
  },
  "oral-semaglutide": {
    equiv: "= Ozempic / Wegovy active ingredient — oral",
    accent: "#16a34a",
    icon: Pill,
    bullets: [
      "No injections required",
      "Physician-prescribed & monitored",
      "Monthly supply",
      "Shipped to your door",
      "Follow-up check-ins included",
    ],
  },
};

const WELLNESS_META: Record<string, { bullets: string[]; accent: string }> = {
  "lipotropic-super-b": {
    accent: "#f59e0b",
    bullets: ["Fat metabolism support", "Energy boost", "Physician-formulated"],
  },
  "nad-plus": {
    accent: "#8b5cf6",
    bullets: ["Cellular energy production", "Anti-aging & longevity", "Cognitive clarity"],
  },
  "sermorelin": {
    accent: "#06b6d4",
    bullets: ["Growth hormone support", "Lean muscle preservation", "Sleep improvement"],
  },
  "glutathione": {
    accent: "#10b981",
    bullets: ["Master antioxidant", "Immune support", "Skin brightening"],
  },
  "l-carnitine": {
    accent: "#f97316",
    bullets: ["Fat transport to mitochondria", "Athletic performance", "Energy metabolism"],
  },
  "lipo-c": {
    accent: "#ec4899",
    bullets: ["Enhanced fat-burning blend", "Appetite support", "Liver detox support"],
  },
  "vitamin-b12": {
    accent: "#64748b",
    bullets: ["Energy & mood support", "Nervous system health", "Essential for metabolism"],
  },
};

// ─── Supply duration pill selector ───────────────────────────────────────────
function DurationPills({
  product, selected, onSelect, locale,
}: {
  product: Product;
  selected: string;
  onSelect: (d: string) => void;
  locale: string;
}) {
  const opts = [
    { key: "1-month",  label: locale === "es" ? "1 Mes"   : "1 Month"  },
    { key: "3-month",  label: locale === "es" ? "3 Meses"  : "3 Months" },
    { key: "6-month",  label: locale === "es" ? "6 Meses"  : "6 Months" },
  ].filter(({ key }) => getVariant(product, key));

  if (opts.length <= 1) return null;

  return (
    <div className="flex gap-1.5 mt-3 flex-wrap">
      {opts.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            selected === key
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── GLP-1 program card ───────────────────────────────────────────────────────
function GlpCard({ product, locale }: { product: Product; locale: string }) {
  const t = product.translations[0];
  if (!t) return null;
  const meta = PROGRAM_META[product.slug];
  const accent = meta?.accent ?? "#ed1b1b";
  const Icon = meta?.icon ?? FlaskConical;
  const bullets = meta?.bullets ?? [];

  const durations = ["1-month", "3-month", "6-month"].filter((d) => getVariant(product, d));
  const [selected, setSelected] = useState(durations[0] ?? "1-month");

  const activeVariant = getVariant(product, selected) ?? getVariant(product, durations[0]);
  const sixMonthVariant = getVariant(product, "6-month");
  const isPopular = product.slug === "compounded-semaglutide";

  return (
    <div className={`relative flex flex-col bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
      isPopular ? "border-[#ed1b1b]" : "border-gray-100"
    }`}>
      {isPopular && (
        <div className="bg-[#ed1b1b] text-white text-xs font-bold text-center py-1.5 tracking-wide uppercase">
          {locale === "es" ? "Más popular" : "Most Popular"}
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Icon + name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15` }}>
            <Icon size={20} style={{ color: accent }} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-gray-900 text-base leading-tight">{t.name}</h3>
            {meta?.equiv && (
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{meta.equiv}</p>
            )}
          </div>
        </div>

        {/* Price */}
        {activeVariant && (
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-bold text-3xl text-gray-900">{fmt(activeVariant.price)}</span>
              <span className="text-gray-400 text-sm">{locale === "es" ? "/mes" : "/mo"}</span>
            </div>
            {sixMonthVariant && selected !== "6-month" && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                {locale === "es"
                  ? `Ahorra hasta ${fmt(activeVariant.price - sixMonthVariant.price)}/mes con 6 meses`
                  : `Save up to ${fmt(activeVariant.price - sixMonthVariant.price)}/mo with 6 months`}
              </p>
            )}
            {selected === "6-month" && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">
                {locale === "es" ? "Mejor precio" : "Best price"}
              </p>
            )}
          </div>
        )}

        {/* Duration pills */}
        <DurationPills
          product={product}
          selected={selected}
          onSelect={setSelected}
          locale={locale}
        />

        {/* Divider */}
        <div className="border-t border-gray-100 my-5" />

        {/* Bullets */}
        <ul className="space-y-2 flex-1">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={`/${locale}/quiz`}
          className="mt-6 block text-center py-3 rounded-full font-bold text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {locale === "es" ? "Comenzar →" : "Get Started →"}
        </Link>
      </div>
    </div>
  );
}

// ─── Simple product card (wellness injections, etc.) ─────────────────────────
function SimpleCard({ product, locale }: { product: Product; locale: string }) {
  const t = product.translations[0];
  if (!t) return null;
  const meta = WELLNESS_META[product.slug];
  const accent = meta?.accent ?? "#6366f1";
  const low = lowestPrice(product);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-bold text-gray-900 text-sm leading-tight">{t.name}</h3>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accent }} />
      </div>

      {t.descriptionShort && (
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{t.descriptionShort}</p>
      )}

      {meta?.bullets && (
        <ul className="space-y-1.5 mb-4 flex-1">
          {meta.bullets.map((b) => (
            <li key={b} className="flex items-center gap-1.5 text-xs text-gray-600">
              <Check size={11} className="text-green-500 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}

      {low && (
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="font-heading font-bold text-xl text-gray-900">{fmt(low)}</span>
            {product.variants.some((v) => v.supplyDuration?.includes("month")) && (
              <span className="text-gray-400 text-xs"> /{locale === "es" ? "mes" : "mo"}</span>
            )}
          </div>
          <Link
            href={`/${locale}/wellness-injections`}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-colors hover:text-white"
            style={{
              borderColor: accent,
              color: accent,
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = accent;
              (e.currentTarget as HTMLAnchorElement).style.color = "white";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = accent;
            }}
          >
            {locale === "es" ? "Ver" : "View"}
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Insurance / Branded CTA band ────────────────────────────────────────────
function InsuranceBand({ locale }: { locale: string }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-blue-600" />
          <span className="font-heading font-bold text-gray-900 text-sm">
            {locale === "es" ? "Programa de Seguro" : "Insurance Program"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {locale === "es"
            ? "Verifica si tu seguro cubre GLP-1 — gratis. Si calificas, manejamos todo."
            : "Check if your insurance covers GLP-1 — free. If you qualify, we handle everything."}
        </p>
        <Link
          href={`/${locale}/insurance-check`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {locale === "es" ? "Verificar elegibilidad" : "Check eligibility"}
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <Tag size={18} className="text-amber-600" />
          <span className="font-heading font-bold text-gray-900 text-sm">
            {locale === "es" ? "Marca con Receta (Cash Pay)" : "Branded Rx (Cash Pay)"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {locale === "es"
            ? "Wegovy, Ozempic, Zepbound y Mounjaro con receta médica. Consulta de $395."
            : "Wegovy, Ozempic, Zepbound & Mounjaro with a physician prescription. $395 consult."}
        </p>
        <Link
          href={`/${locale}/quiz`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors"
        >
          {locale === "es" ? "Solicitar receta" : "Request prescription"}
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Tab definition ───────────────────────────────────────────────────────────
type TabKey = "weight-loss" | "wellness" | "hair-skin" | "mental";

const TABS: { key: TabKey; labelEn: string; labelEs: string; icon: React.ElementType }[] = [
  { key: "weight-loss", labelEn: "Weight Loss",         labelEs: "Pérdida de Peso",      icon: FlaskConical },
  { key: "wellness",    labelEn: "Wellness Injections",  labelEs: "Inyecciones",          icon: Syringe      },
  { key: "hair-skin",   labelEn: "Hair & Skin",          labelEs: "Cabello y Piel",       icon: Sparkles     },
  { key: "mental",      labelEn: "Mental Wellness",      labelEs: "Bienestar Mental",     icon: Brain        },
];

// ─── Main export ──────────────────────────────────────────────────────────────
export function PricingContent({ products, locale }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("weight-loss");
  const isEs = locale === "es";

  // Product groups
  const glp1 = products.filter((p) =>
    ["compounded", "oral"].includes(p.category)
  );
  const wellnessInj = products.filter((p) => p.category === "wellness-injection");
  const hairSkin    = products.filter((p) => ["hair", "skin"].includes(p.category));
  const mental      = products.filter((p) => p.category === "mental-wellness");

  const tabHasContent: Record<TabKey, boolean> = {
    "weight-loss": glp1.length > 0,
    "wellness":    wellnessInj.length > 0,
    "hair-skin":   hairSkin.length > 0,
    "mental":      mental.length > 0,
  };

  const visibleTabs = TABS.filter((t) => tabHasContent[t.key] || t.key === "weight-loss");

  return (
    <section className="py-12 pb-24">
      <div className="max-w-6xl mx-auto px-5">

        {/* ── Tab bar ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-10 border-b border-gray-100">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  isActive
                    ? "border-[#ed1b1b] text-[#ed1b1b] bg-red-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {isEs ? tab.labelEs : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* ── Weight Loss tab ── */}
        {activeTab === "weight-loss" && (
          <>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">
                {isEs ? "Programas de Pérdida de Peso GLP-1" : "GLP-1 Weight Loss Programs"}
              </h2>
              <p className="text-gray-500 text-sm">
                {isEs
                  ? "Todos los planes incluyen consulta médica, seguimiento y receta. Sin cuotas de membresía."
                  : "All plans include physician consultation, follow-ups & prescription. No membership fees."}
              </p>
            </div>

            {/* Main GLP-1 cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {glp1.map((p) => (
                <GlpCard key={p.id} product={p} locale={locale} />
              ))}
            </div>

            {/* Insurance & Branded callout */}
            <InsuranceBand locale={locale} />

            {/* Included in every plan */}
            <div className="mt-10 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-heading font-bold text-gray-900 mb-4 text-base">
                {isEs ? "Incluido en todos los planes:" : "Included in every plan:"}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  isEs ? "Consulta médica inicial" : "Initial physician consult",
                  isEs ? "Receta y ajuste de dosis" : "Prescription & dose adjustments",
                  isEs ? "Seguimiento mensual" : "Monthly follow-ups",
                  isEs ? "Entrega a domicilio discreta" : "Discreet home delivery",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={15} className="text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Wellness Injections tab ── */}
        {activeTab === "wellness" && (
          <>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">
                {isEs ? "Inyecciones de Bienestar" : "Wellness Injections"}
              </h2>
              <p className="text-gray-500 text-sm">
                {isEs
                  ? "NAD+, Sermorelina, Glutatión y más — con receta médica, enviadas a tu domicilio."
                  : "NAD+, Sermorelin, Glutathione & more — physician-prescribed, shipped to your door."}
              </p>
            </div>

            {wellnessInj.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wellnessInj.map((p) => (
                  <SimpleCard key={p.id} product={p} locale={locale} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                {isEs ? "Próximamente." : "Coming soon."}
              </p>
            )}

            <div className="mt-8 text-center">
              <Link
                href={`/${locale}/wellness-injections`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white bg-[#8b5cf6] hover:opacity-90 transition-opacity"
              >
                {isEs ? "Ver catálogo completo" : "View full catalog"}
                <ChevronRight size={16} />
              </Link>
            </div>
          </>
        )}

        {/* ── Hair & Skin tab ── */}
        {activeTab === "hair-skin" && (
          <>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">
                {isEs ? "Cabello y Piel" : "Hair & Skin"}
              </h2>
              <p className="text-gray-500 text-sm">
                {isEs ? "Fórmulas de restauración capilar y cuidado de piel con receta médica."
                       : "Physician-prescribed hair restoration and skin care formulas."}
              </p>
            </div>

            {hairSkin.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hairSkin.map((p) => (
                  <SimpleCard key={p.id} product={p} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Sparkles size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-gray-500 mb-1">
                  {isEs ? "Próximamente" : "Coming Soon"}
                </p>
                <p className="text-sm">
                  {isEs
                    ? "Toma el cuestionario para unirte a la lista de espera."
                    : "Take the quiz to join the waitlist."}
                </p>
                <Link href={`/${locale}/quiz/hair`} className="mt-4 inline-block text-sm font-semibold text-[#ed1b1b] hover:underline">
                  {isEs ? "Tomar cuestionario →" : "Take quiz →"}
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── Mental Wellness tab ── */}
        {activeTab === "mental" && (
          <>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-1">
                {isEs ? "Bienestar Mental" : "Mental Wellness"}
              </h2>
              <p className="text-gray-500 text-sm">
                {isEs ? "Ansiedad, sueño y motivación — fórmulas no adictivas con receta médica."
                       : "Anxiety, sleep & motivation — non-addictive physician-prescribed formulas."}
              </p>
            </div>

            {mental.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mental.map((p) => (
                  <SimpleCard key={p.id} product={p} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Brain size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-gray-500 mb-1">
                  {isEs ? "Próximamente" : "Coming Soon"}
                </p>
                <p className="text-sm">
                  {isEs
                    ? "Toma el cuestionario para unirte a la lista de espera."
                    : "Take the quiz to join the waitlist."}
                </p>
                <Link href={`/${locale}/quiz/mental-wellness`} className="mt-4 inline-block text-sm font-semibold text-[#ed1b1b] hover:underline">
                  {isEs ? "Tomar cuestionario →" : "Take quiz →"}
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── Bottom CTA ── */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#fde7e7] to-pink-50 border border-red-100 p-8 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Star size={16} className="text-[#ed1b1b]" />
            <span className="text-sm font-bold text-[#ed1b1b] uppercase tracking-wide">
              {isEs ? "Consulta gratuita" : "Free Consultation"}
            </span>
          </div>
          <h3 className="font-heading font-bold text-2xl text-gray-900 mb-2">
            {isEs ? "¿No estás segura cuál plan es para ti?" : "Not sure which plan is right for you?"}
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            {isEs
              ? "Nuestro cuestionario de 2 minutos te conecta con el programa perfecto para tus metas."
              : "Our 2-minute quiz matches you with the perfect program for your goals."}
          </p>
          <Link
            href={`/${locale}/quiz`}
            className="inline-block px-8 py-3.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#ed1b1b" }}
          >
            {isEs ? "Tomar el cuestionario — gratis" : "Take the Quiz — Free"}
          </Link>
        </div>

      </div>
    </section>
  );
}
