import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MedicationChoiceCard } from "@/components/quiz/MedicationChoiceCard";
import type { MedVariant } from "@/components/quiz/MedicationChoiceCard";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Check, X, Building2, AlertCircle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const VALID_OUTCOMES = ["compounded", "insurance", "oral", "branded"];

export default async function ResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  if (!VALID_OUTCOMES.includes(outcome)) notFound();

  if (outcome === "compounded") return <CompoundedResult locale={locale} isEs={locale === "es"} />;
  if (outcome === "insurance") return <InsuranceResult locale={locale} isEs={locale === "es"} />;
  if (outcome === "oral") return <OralResult locale={locale} isEs={locale === "es"} />;
  if (outcome === "branded") return <BrandedResult locale={locale} isEs={locale === "es"} />;

  notFound();
}

async function CompoundedResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  const [sem, trzS, trzM] = await Promise.all([
    db.product.findUnique({
      where: { slug: "compounded-semaglutide" },
      include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    }),
    db.product.findUnique({
      where: { slug: "compounded-tirzepatide-starter" },
      include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    }),
    db.product.findUnique({
      where: { slug: "compounded-tirzepatide-maintenance" },
      include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const durationLabel = (d: string | null) => {
    if (d === "1-month") return "1 Month";
    if (d === "3-month") return "3 Months";
    if (d === "6-month") return "6 Months";
    return d ?? "";
  };

  const toVariants = (product: typeof sem, bestDuration = "6-month"): MedVariant[] =>
    (product?.variants ?? []).map((v) => ({
      id: v.id,
      sku: v.sku,
      label: durationLabel(v.supplyDuration),
      priceDisplay: `${fmt(v.price)}${v.supplyDuration !== "one-time" ? (isEs ? "/mes" : "/mo") : ""}`,
      price: v.price,
      badge: v.supplyDuration === bestDuration ? (isEs ? "Mejor Valor" : "Best Value") : undefined,
    }));

  return (
    <>
      <section className="py-12 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACIÓN" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-3">
              {isEs ? "GLP-1 Compuesto — Tu Mejor Opción" : "Compounded GLP-1 — Your Best Match"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Mismo ingrediente activo que Ozempic/Wegovy/Mounjaro — a una fracción del costo."
                : "Same active ingredient as Ozempic / Wegovy / Mounjaro — at a fraction of the cost."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="text-center mb-8">
            <h2 className="font-heading text-heading text-2xl font-bold mb-1">
              {isEs ? "¿Cuál medicamento es para ti?" : "Which medication is right for you?"}
            </h2>
            <p className="text-body-muted text-sm max-w-lg mx-auto">
              {isEs
                ? "Elige el medicamento y tu plan. Puedes cambiar en cualquier momento con tu proveedor."
                : "Choose your medication and plan length. Your provider can adjust anytime."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {sem && (
              <MedicationChoiceCard
                productId={sem.id}
                productName={isEs ? "Semaglutida" : "Semaglutide"}
                tagline={isEs ? "Mismo principio activo que Ozempic y Wegovy" : "Same active ingredient as Ozempic & Wegovy"}
                badge={isEs ? "Más Popular" : "Most Popular"}
                badgeStyle="red"
                bullets={[
                  isEs ? "Inyección semanal subcutánea (aguja pequeña)" : "Once-weekly subcutaneous injection (small needle)",
                  isEs ? "15% pérdida de peso promedio en ensayos clínicos" : "~15% avg. weight loss in clinical trials",
                  isEs ? "Opción más económica — desde $139/mes" : "Most affordable option — from $139/mo",
                  isEs ? "Compuesto médico — los mismos resultados, menos costo" : "Medical-grade compound — same results, lower cost",
                ]}
                tradeoffs={[
                  isEs ? "No es ideal si prefieres evitar inyecciones" : "Not ideal if you're needle-averse",
                  isEs ? "Resultados más lentos que tirzepatida en promedio" : "Slightly slower results vs. tirzepatide on average",
                ]}
                variants={toVariants(sem)}
                slug="compounded-semaglutide"
                locale={locale}
              />
            )}

            {trzS && (
              <MedicationChoiceCard
                productId={trzS.id}
                productName={isEs ? "Tirzepatida" : "Tirzepatide"}
                tagline={isEs ? "Mismo principio activo que Mounjaro y Zepbound" : "Same active ingredient as Mounjaro & Zepbound"}
                badge={isEs ? "Mejores Resultados" : "Best Results"}
                badgeStyle="dark"
                bullets={[
                  isEs ? "Doble acción: receptores GIP + GLP-1" : "Dual-action: activates GIP + GLP-1 receptors",
                  isEs ? "Hasta 22.5% pérdida de peso en ensayos clínicos" : "Up to 22.5% weight loss in clinical trials",
                  isEs ? "Inyección semanal — mismo proceso que semaglutida" : "Once-weekly injection — same process as semaglutide",
                  isEs ? "Aprobado para obesidad y diabetes tipo 2" : "FDA-approved for both obesity and type 2 diabetes",
                ]}
                tradeoffs={[
                  isEs ? "Mayor costo que semaglutida" : "Higher cost than semaglutide",
                  isEs ? "Puede requerir ajuste de dosis más gradual al inicio" : "May require more gradual dose escalation at first",
                ]}
                variants={toVariants(trzS)}
                slug="compounded-tirzepatide-starter"
                locale={locale}
              />
            )}
          </div>

          {trzM && (
            <div className="rounded-card border border-border bg-surface-dim p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-grow">
                <p className="font-heading text-heading font-semibold mb-0.5">
                  {isEs ? "¿Ya estás en dosis de 9mg+?" : "Already on 9mg+ of tirzepatide?"}
                </p>
                <p className="text-body-muted text-sm">
                  {isEs
                    ? "Tirzepatida Mantenimiento está diseñada para dosis altas (11.25mg+). Tu proveedor te guiará."
                    : "Tirzepatide Maintenance is designed for higher doses (11.25mg+). Your provider will guide the transition."}
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <p className="font-heading font-bold text-heading text-lg">
                  {isEs ? "Desde " : "From "}{fmt(trzM.variants[2]?.price ?? trzM.variants[0]?.price ?? 31900)}/mo
                </p>
                <Button
                  href={`/${locale}/products/compounded-tirzepatide-maintenance`}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  {isEs ? "Ver Detalles" : "View Details"}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>

      <PharmacySection locale={locale} isEs={isEs} />

      <TrustFooter locale={locale} isEs={isEs} />
    </>
  );
}

async function InsuranceResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  const products = await db.product.findMany({
    where: { category: "insurance", isActive: true },
    include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const steps = [
    {
      slug: "insurance-eligibility-check",
      step: "1",
      title: isEs ? "Verificación de Elegibilidad" : "Eligibility Check",
      desc: isEs
        ? "Verificamos si tu seguro cubre medicamentos GLP-1. Resultados en 24 hrs."
        : "We verify whether your plan covers GLP-1 medications. Results within 24 hours.",
      bullets: [
        isEs ? "Revisamos tu seguro en tu nombre" : "We check your insurance on your behalf",
        isEs ? "Sin formularios complicados" : "No complicated paperwork from you",
        isEs ? "Si no hay cobertura, te lo decimos antes de pagar más" : "If no coverage, you know before spending more",
      ],
      notFor: [
        isEs ? "No es el medicamento — solo verifica cobertura" : "This does not include the medication",
      ],
    },
    {
      slug: "insurance-prior-auth",
      step: "2",
      title: isEs ? "Autorización Previa" : "Prior Authorization",
      desc: isEs
        ? "Manejamos todo el papeleo con tu aseguradora para aprobar el medicamento."
        : "We handle all the prior authorization paperwork with your insurer.",
      bullets: [
        isEs ? "Carta médica de necesidad de tu proveedor" : "Medical necessity letter from your provider",
        isEs ? "Coordinamos con tu aseguradora directamente" : "We coordinate with your insurer directly",
        isEs ? "Seguimiento hasta la decisión" : "Follow-up until a decision is reached",
      ],
      notFor: [
        isEs ? "Requiere verificación de elegibilidad primero" : "Requires eligibility check first",
      ],
    },
    {
      slug: "insurance-approval",
      step: "3",
      title: isEs ? "Aprobación Completa" : "Full Approval",
      desc: isEs
        ? "Proceso completo de aprobación para obtener tu medicamento cubierto."
        : "Full approval process — everything handled until your medication is covered.",
      bullets: [
        isEs ? "Apelaciones incluidas si se niega en primera instancia" : "Appeals included if initially denied",
        isEs ? "Experiencia con todas las aseguradoras principales" : "Experience with all major insurers",
        isEs ? "Tasa de aprobación de >85% con documentación correcta" : ">85% approval rate with proper documentation",
      ],
      notFor: [
        isEs ? "La aseguradora puede denegar — no garantizamos cobertura" : "Insurer may deny — we cannot guarantee coverage",
      ],
    },
  ];

  return (
    <>
      <section className="py-12 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACIÓN" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-3">
              {isEs ? "Tu Seguro Puede Cubrir Tu Medicamento" : "Your Insurance May Cover Your Medication"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Empezamos con una verificación simple — y manejamos todo el proceso por ti."
                : "Start with a simple check — we handle the entire process for you."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container narrow>
          <h2 className="font-heading text-heading text-2xl font-bold mb-2 text-center">
            {isEs ? "Elige dónde comenzar:" : "Choose where to start:"}
          </h2>
          <p className="text-body-muted text-sm text-center mb-8">
            {isEs
              ? "La mayoría comienza con la verificación. Puedes agregar pasos después."
              : "Most patients start with the check. You can add steps after."}
          </p>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const product = products.find((p) => p.slug === step.slug);
              const variant = product?.variants[0];
              return (
                <div
                  key={step.slug}
                  className={`rounded-2xl border-2 p-6 ${idx === 0 ? "border-brand-red shadow-card-hover" : "border-border"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm ${idx === 0 ? "bg-brand-red text-white" : "bg-surface-dim text-heading"}`}>
                      {step.step}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h3 className="font-heading text-heading font-bold text-lg">{step.title}</h3>
                        {variant && (
                          <span className="font-heading font-bold text-brand-red text-xl">
                            {fmt(variant.price)}{variant.supplyDuration === "1-month" ? (isEs ? "/mes" : "/mo") : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-body-muted text-sm mb-3">{step.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-3">
                        {step.bullets.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Check size={14} className="text-brand-red flex-shrink-0 mt-0.5" />
                            <span className="text-body">{b}</span>
                          </div>
                        ))}
                        {step.notFor.map((n, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <X size={14} className="text-body-muted flex-shrink-0 mt-0.5" />
                            <span className="text-body-muted">{n}</span>
                          </div>
                        ))}
                      </div>
                      {product && variant && (
                        <div className="max-w-xs">
                          <AddToCartButton
                            productId={product.id}
                            variantId={variant.id}
                            name={step.title}
                            variantLabel={isEs ? "Pago único" : "One-time"}
                            price={variant.price}
                            slug={product.slug}
                            redirectToUpsell
                            label={
                              isEs
                                ? `Agregar — $${fmt(variant.price)}`
                                : `Add to Cart — ${fmt(variant.price)}`
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-body-muted text-sm mb-2">
              {isEs ? "¿Prefieres pago directo sin seguro?" : "Prefer self-pay without insurance?"}
            </p>
            <Button href={`/${locale}/quiz/result/compounded`} variant="secondary" size="md">
              {isEs ? "Ver Opciones de Pago Directo" : "See Self-Pay Options"}
            </Button>
          </div>
        </Container>
      </section>

      <TrustFooter locale={locale} isEs={isEs} />
    </>
  );
}

async function OralResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  const product = await db.product.findUnique({
    where: { slug: "oral-glp1" },
    include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
  });

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const variantLabel = (d: string | null) => {
    if (d === "one-time") return isEs ? "Pago Único" : "One-Time";
    if (d === "1-month") return isEs ? "1 Mes" : "1 Month";
    if (d === "3-month") return isEs ? "3 Meses" : "3 Months";
    if (d === "6-month") return isEs ? "6 Meses" : "6 Months";
    return d ?? "";
  };

  return (
    <>
      <section className="py-12 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACIÓN" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-3">
              {isEs ? "GLP-1 Oral — Sin Agujas" : "Oral GLP-1 — Zero Needles"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Una pastilla diaria con los mismos beneficios de pérdida de peso. Sin inyecciones, sin plumas, sin agujas."
                : "A daily pill with the same weight loss benefits. No injections, no pens, no needles."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container narrow>
          <div className="rounded-2xl border-2 border-brand-red bg-white shadow-card-hover overflow-hidden">
            <div className="bg-brand-red px-6 py-3">
              <span className="text-white font-heading font-bold text-sm uppercase tracking-wide">
                {isEs ? "Tu Opción Recomendada" : "Your Recommended Option"}
              </span>
            </div>

            <div className="p-6">
              <h2 className="font-heading text-heading text-2xl font-bold mb-1">
                {isEs ? "GLP-1 Oral Compuesto" : "Compounded Oral GLP-1"}
              </h2>
              <p className="text-body-muted text-sm mb-5">
                {isEs
                  ? "Agonista de GLP-1 en forma de cápsula — tomado una vez al día"
                  : "Oral GLP-1 agonist in capsule form — taken once daily"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-body-muted mb-2">
                    {isEs ? "Lo que incluye:" : "What you get:"}
                  </p>
                  {[
                    isEs ? "Una pastilla diaria — sin agujas" : "One pill daily — zero needles",
                    isEs ? "Mismo principio activo GLP-1, forma oral" : "Same GLP-1 active ingredient, oral form",
                    isEs ? "Consulta con proveedor y plan de tratamiento" : "Provider consultation + treatment plan included",
                    isEs ? "Envío discreto a tu domicilio, gratis" : "Discreet free shipping to your door",
                    isEs ? "Check-in mensual con tu proveedor" : "Monthly check-in with your provider",
                  ].map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-brand-red flex-shrink-0 mt-0.5" />
                      <span className="text-body">{b}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-body-muted mb-2">
                    {isEs ? "A tener en cuenta:" : "Good to know:"}
                  </p>
                  {[
                    isEs ? "La absorción oral es menor que la inyectable (~85%)" : "Oral absorption is lower than injectable (~85%)",
                    isEs ? "Puede tomar más tiempo para resultados máximos" : "May take slightly longer to reach full effect",
                    isEs ? "No disponible en farmacias locales (fórmula compuesta)" : "Not available at retail pharmacies (compounded)",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <X size={14} className="text-body-muted flex-shrink-0 mt-0.5" />
                      <span className="text-body-muted">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product && product.variants.length > 0 && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wider text-body-muted mb-3">
                    {isEs ? "Elige tu plan:" : "Choose your plan:"}
                  </p>
                  {product && (
                    <OralPlanSelector product={product} isEs={isEs} locale={locale} variantLabelFn={variantLabel} fmt={fmt} />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-card border border-border bg-surface-dim p-5">
            <p className="font-heading text-heading font-semibold text-sm mb-1">
              {isEs ? "¿Sabías? Wegovy ahora está disponible en pastilla" : "Did you know? Wegovy is now available as a pill"}
            </p>
            <p className="text-body-muted text-sm">
              {isEs
                ? "Una opción oral de marca aprobada por la FDA. Obtén tu receta por solo $45."
                : "An FDA-approved branded oral option. Get your prescription for just $45."}
            </p>
            <Button href={`/${locale}/quiz/result/branded`} variant="outline" size="sm" className="mt-3">
              {isEs ? "Ver Wegovy Oral" : "Learn About Wegovy Pill"}
            </Button>
          </div>
        </Container>
      </section>

      <TrustFooter locale={locale} isEs={isEs} />
    </>
  );
}

function OralPlanSelector({
  product,
  isEs,
  locale,
  variantLabelFn,
  fmt,
}: {
  product: Awaited<ReturnType<typeof db.product.findUnique>> & { variants: { id: string; supplyDuration: string | null; price: number; sku: string }[] };
  isEs: boolean;
  locale: string;
  variantLabelFn: (d: string | null) => string;
  fmt: (c: number) => string;
}) {
  if (!product) return null;

  const variants: MedVariant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    label: variantLabelFn(v.supplyDuration),
    priceDisplay: `${fmt(v.price)}${v.supplyDuration !== "one-time" ? (isEs ? "/mes" : "/mo") : ""}`,
    price: v.price,
    badge: v.supplyDuration === "6-month" ? (isEs ? "Mejor Valor" : "Best Value") : undefined,
  }));

  return (
    <MedicationChoiceCardInline
      productId={product.id}
      productName={isEs ? "GLP-1 Oral Compuesto" : "Compounded Oral GLP-1"}
      variants={variants}
      slug="oral-glp1"
      locale={locale}
    />
  );
}

import { MedicationChoiceCardInline } from "@/components/quiz/MedicationChoiceCardInline";

async function BrandedResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  const [rxProduct, mgmtProduct] = await Promise.all([
    db.product.findUnique({
      where: { slug: "branded-glp1-rx" },
      include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    }),
    db.product.findUnique({
      where: { slug: "branded-rx-management" },
      include: { variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(0)}`;
  const mgmtVariantLabel = (d: string | null) => {
    if (d === "1-month") return isEs ? "1 Mes" : "1 Month";
    if (d === "3-month") return isEs ? "3 Meses" : "3 Months";
    if (d === "6-month") return isEs ? "6 Meses" : "6 Months";
    return d ?? "";
  };

  const rxVariant = rxProduct?.variants[0];
  const mgmtVariants: MedVariant[] = (mgmtProduct?.variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    label: mgmtVariantLabel(v.supplyDuration),
    priceDisplay: `${fmt(v.price)}${v.supplyDuration !== "one-time" ? (isEs ? "/mes" : "/mo") : ""}`,
    price: v.price,
    badge: v.supplyDuration === "6-month" ? (isEs ? "Mejor Valor" : "Best Value") : undefined,
  }));

  const meds = [
    {
      name: isEs ? "Wegovy (Pastilla)" : "Wegovy (Pill)",
      type: isEs ? "Oral — sin agujas" : "Oral — no needles",
      price: "~$149–299/mo",
      where: "NovoCare / pharmacy",
      bullets: [isEs ? "Sin agujas — cápsula oral" : "No needles — oral capsule"],
    },
    {
      name: isEs ? "Wegovy (Inyección)" : "Wegovy (Injection)",
      type: isEs ? "Pluma semanal" : "Weekly pen",
      price: "~$349/mo",
      where: "NovoCare / pharmacy",
      bullets: [isEs ? "Pluma semanal desechable" : "Disposable weekly pen"],
    },
    {
      name: "Zepbound KwikPen",
      type: isEs ? "Pluma mensual" : "Monthly pen",
      price: "~$299–449/mo",
      where: "LillyDirect",
      bullets: [isEs ? "Doble acción GIP + GLP-1" : "Dual-action GIP + GLP-1"],
    },
    {
      name: "Zepbound Vial",
      type: isEs ? "Vial con jeringa" : "Vial with syringe",
      price: "~$299–449/mo",
      where: "LillyDirect",
      bullets: [isEs ? "Opción más económica de Zepbound" : "Most affordable Zepbound option"],
    },
  ];

  return (
    <>
      <section className="py-12 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACIÓN" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-3">
              {isEs ? "Receta de Marca — Wegovy o Zepbound" : "Branded Rx — Wegovy or Zepbound"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Nosotros escribimos la receta. Tú eliges dónde surtirla."
                : "We write the prescription. You choose where to fill it."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container narrow>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {rxProduct && rxVariant && (
              <div className="rounded-2xl border-2 border-brand-red bg-white shadow-card-hover overflow-hidden flex flex-col">
                <div className="bg-brand-red px-5 py-2.5">
                  <span className="text-white font-heading font-bold text-sm uppercase tracking-wide">
                    {isEs ? "Paso 1 — Obtén Tu Receta" : "Step 1 — Get Your Prescription"}
                  </span>
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-heading text-heading text-xl font-bold">
                      {isEs ? "Receta de GLP-1 de Marca" : "Branded GLP-1 Prescription"}
                    </h3>
                    <span className="font-heading font-bold text-brand-red text-2xl">$45</span>
                  </div>
                  <p className="text-body-muted text-sm mb-4">
                    {isEs ? "Pago único — sin suscripción" : "One-time payment — no subscription"}
                  </p>
                  <div className="space-y-1.5 mb-5">
                    {[
                      isEs ? "Proveedor certificado revisa y aprueba tu solicitud" : "Board-certified provider reviews & approves",
                      isEs ? "Receta válida para Wegovy, Zepbound u otra de marca" : "Rx valid for Wegovy, Zepbound, or other branded med",
                      isEs ? "Enviada electrónicamente a la farmacia de tu elección" : "Sent electronically to your pharmacy of choice",
                      isEs ? "Aprobación típicamente en 24 hrs" : "Typically approved within 24 hours",
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check size={14} className="text-brand-red flex-shrink-0 mt-0.5" />
                        <span className="text-body">{b}</span>
                      </div>
                    ))}
                    {[
                      isEs ? "El medicamento se paga por separado en la farmacia" : "Medication paid separately at the pharmacy",
                      isEs ? "No incluye manejo mensual ni check-ins" : "Does not include ongoing management or check-ins",
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <X size={14} className="text-body-muted flex-shrink-0 mt-0.5" />
                        <span className="text-body-muted">{t}</span>
                      </div>
                    ))}
                  </div>
                  <AddToCartButton
                    productId={rxProduct.id}
                    variantId={rxVariant.id}
                    name={isEs ? "Receta GLP-1 de Marca" : "Branded GLP-1 Prescription"}
                    variantLabel={isEs ? "Pago único" : "One-time"}
                    price={rxVariant.price}
                    slug={rxProduct.slug}
                    redirectToUpsell
                    label={isEs ? "Obtener Mi Receta — $45" : "Get My Prescription — $45"}
                  />
                </div>
              </div>
            )}

            {mgmtProduct && mgmtVariants.length > 0 && (
              <div className="rounded-2xl border-2 border-border bg-white overflow-hidden flex flex-col">
                <div className="bg-gray-800 px-5 py-2.5">
                  <span className="text-white font-heading font-bold text-sm uppercase tracking-wide">
                    {isEs ? "Paso 2 (Opcional) — Manejo Continuo" : "Step 2 (Optional) — Ongoing Management"}
                  </span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-heading text-heading text-xl font-bold mb-1">
                    {isEs ? "Plan de Manejo Mensual" : "Monthly Management Plan"}
                  </h3>
                  <p className="text-body-muted text-sm mb-4">
                    {isEs ? "Para pacientes que quieren seguimiento médico continuo" : "For patients who want ongoing medical supervision"}
                  </p>
                  <div className="space-y-1.5 mb-4 flex-grow">
                    {[
                      isEs ? "Check-ins mensuales con tu proveedor" : "Monthly check-ins with your provider",
                      isEs ? "Ajustes de dosis según tu progreso" : "Dose adjustments as you progress",
                      isEs ? "Mensajería directa con tu equipo de atención" : "Direct messaging with your care team",
                      isEs ? "Gestión de refill y autorización previa" : "Refill management + prior authorization support",
                    ].map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-body">{b}</span>
                      </div>
                    ))}
                  </div>
                  <MedicationChoiceCardInline
                    productId={mgmtProduct.id}
                    productName={isEs ? "Plan de Manejo" : "Management Plan"}
                    variants={mgmtVariants}
                    slug="branded-rx-management"
                    locale={locale}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-card border border-border p-5">
            <h3 className="font-heading text-heading font-semibold mb-3">
              {isEs ? "¿Qué medicamento elige tu proveedor?" : "Which medication will your provider prescribe?"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {meds.map((med) => (
                <div key={med.name} className="rounded-card border border-border p-4 text-center">
                  <p className="font-heading text-heading font-bold text-sm mb-0.5">{med.name}</p>
                  <p className="text-body-muted text-xs mb-1">{med.type}</p>
                  <p className="font-heading text-heading font-semibold text-sm">{med.price}</p>
                  <p className="text-body-muted text-xs mt-0.5">{med.where}</p>
                </div>
              ))}
            </div>
            <p className="text-body-muted text-xs mt-3 text-center">
              {isEs
                ? "Tu proveedor prescribirá la opción más apropiada para ti según tu historial y preferencias."
                : "Your provider prescribes the most appropriate option for your history and preferences."}
            </p>
          </div>

          <div className="text-center mt-8">
            <p className="text-body-muted text-sm">
              {isEs ? "¿Tienes seguro? " : "Have insurance? "}
              <a href={`/${locale}/insurance-check`} className="text-brand-red hover:underline">
                {isEs ? "Verifica si cubre tu medicamento" : "Check if it covers your medication"}
              </a>
            </p>
          </div>
        </Container>
      </section>

      <TrustFooter locale={locale} isEs={isEs} />
    </>
  );
}

function PharmacySection({ locale, isEs }: { locale: string; isEs: boolean }) {
  return (
    <section className="py-10 bg-surface-dim">
      <Container narrow>
        <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4 flex items-center gap-3">
            <Building2 size={20} />
            <div>
              <p className="font-heading font-bold text-sm uppercase tracking-wide">
                {isEs ? "Enviar Receta a Mi Farmacia" : "Send Rx to My Pharmacy"}
              </p>
              <p className="text-xs opacity-80">
                {isEs ? "Usa tu seguro, recoge localmente" : "Use your insurance, pick up locally"}
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3 className="font-heading text-heading text-xl font-bold">
                {isEs ? "Programa de Farmacia con Seguro" : "Insurance Pharmacy Program"}
              </h3>
              <span className="font-heading font-bold text-heading text-2xl flex-shrink-0">$25</span>
            </div>
            <p className="text-body-muted text-sm mb-4">
              {isEs ? "Verificación de elegibilidad de seguro — pago único" : "Insurance eligibility check — one-time fee"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-5">
              {[
                isEs ? "Verificamos tu cobertura de seguro para GLP-1" : "We check your insurance coverage for GLP-1",
                isEs ? "Si cubierto — medicamento a $0–$25/mes" : "If covered — medication at $0–25/mo",
                isEs ? "Manejamos la autorización previa por ti" : "We handle prior authorization for you",
                isEs ? "Proveedor escribe la receta y la envía a tu farmacia" : "Provider writes Rx and sends to your pharmacy",
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="text-body">{b}</span>
                </div>
              ))}
              {[
                isEs ? "No garantizamos aprobación del seguro" : "Insurance approval not guaranteed",
                isEs ? "Puede requerir autorización previa (manejada por nosotros)" : "May require prior auth (we handle this)",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <X size={14} className="text-body-muted flex-shrink-0 mt-0.5" />
                  <span className="text-body-muted">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 text-xs text-body-muted bg-surface-dim rounded-lg p-3 mb-5">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                {isEs
                  ? "Con un buen seguro, muchos pacientes pagan $0–25/mes por Wegovy o Zepbound. Nosotros manejamos el papeleo."
                  : "With good insurance, many patients pay $0–25/mo for Wegovy or Zepbound. We handle all the paperwork."}
              </span>
            </div>
            <Button href={`/${locale}/quiz/result/insurance`} size="lg" variant="outline" className="w-full sm:w-auto">
              {isEs ? "Ver Detalles del Programa de Seguro" : "See Full Insurance Program Details"}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function TrustFooter({ locale, isEs }: { locale: string; isEs: boolean }) {
  return (
    <section className="py-10">
      <Container narrow>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: "🩺",
              title: isEs ? "Revisión del Proveedor" : "Provider Review",
              desc: isEs
                ? "Proveedor licenciado aprueba tu tratamiento — típicamente en 24 horas."
                : "Licensed provider approves your treatment — typically within 24 hours.",
            },
            {
              icon: "📦",
              title: isEs ? "Tratamiento Comienza" : "Treatment Begins",
              desc: isEs
                ? "Envío directo a tu puerta o receta enviada a tu farmacia."
                : "Shipped directly to your door, or Rx sent electronically to your pharmacy.",
            },
            {
              icon: "💬",
              title: isEs ? "Apoyo Continuo" : "Ongoing Support",
              desc: isEs
                ? "Check-ins mensuales, ajustes de dosis, y mensajería directa incluidos."
                : "Monthly check-ins, dose adjustments, and direct messaging all included.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-surface-dim rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-heading text-heading font-semibold mb-1">{item.title}</h3>
              <p className="text-body-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-body-muted text-sm mb-3">
            {isEs ? "¿Quieres explorar otras opciones?" : "Want to explore other options?"}
          </p>
          <Button href={`/${locale}/programs`} variant="secondary" size="md">
            {isEs ? "Ver Todos los Programas" : "See All Programs"}
          </Button>
        </div>
      </Container>
    </section>
  );
}
