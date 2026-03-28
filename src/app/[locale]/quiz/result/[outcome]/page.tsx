import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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
  const products = await db.product.findMany({
    where: { category: "compounded", isActive: true },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACI\u00D3N" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "GLP-1 Compuesto es Tu Mejor Opci\u00F3n"
                : "Compounded GLP-1 Is Your Best Match"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Basado en tus respuestas, recomendamos medicamentos GLP-1 compuestos \u2014 los mismos ingredientes activos a una fracci\u00F3n del costo."
                : "Based on your answers, we recommend compounded GLP-1 medications \u2014 the same active ingredients at a fraction of the cost."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const t = product.translations[0];
              if (!t) return null;

              return (
                <Card key={product.id} featured={product.isFeatured} className="flex flex-col">
                  {product.isFeatured && <Badge variant="red">{isEs ? "RECOMENDADO" : "RECOMMENDED"}</Badge>}
                  <h2 className="font-heading text-heading text-xl font-bold mt-2 mb-2">
                    {t.name}
                  </h2>
                  <p className="text-body-muted text-sm mb-4 flex-grow">
                    {t.descriptionShort}
                  </p>
                  <div className="space-y-1 mb-4">
                    {product.variants.map((v) => (
                      <div key={v.id} className="flex justify-between text-sm">
                        <span className="text-body-muted capitalize">
                          {v.supplyDuration?.replace("-", " ")}
                        </span>
                        <span className="font-heading font-bold text-heading">
                          {formatPrice(v.price)}
                          {v.supplyDuration !== "one-time" && (
                            <span className="text-body-muted font-normal">/{isEs ? "mes" : "mo"}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button href={`/${locale}/products/${product.slug}`} size="sm" variant={product.isFeatured ? "primary" : "outline"}>
                    {isEs ? "Ver Detalles" : "View Details"}
                  </Button>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-body-muted mb-3">
              {isEs ? "\u00BFQuieres explorar otras opciones?" : "Want to explore other options?"}
            </p>
            <Button href={`/${locale}/programs`} variant="secondary" size="md">
              {isEs ? "Ver Todos los Programas" : "See All Programs"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

async function InsuranceResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACI\u00D3N" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "Tu Seguro Puede Cubrir Tus Medicamentos"
                : "Your Insurance May Cover Your Medications"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Basado en tu informaci\u00F3n de seguro, hay una alta probabilidad de cobertura. Te ayudamos con todo el proceso."
                : "Based on your insurance information, there\u2019s a high probability of coverage. We\u2019ll handle the entire process for you."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <h2 className="font-heading text-heading text-2xl font-bold mb-6 text-center">
            {isEs ? "C\u00F3mo Funciona Nuestro Programa de Seguro" : "How Our Insurance Program Works"}
          </h2>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: isEs ? "Verificaci\u00F3n de Elegibilidad \u2014 $25" : "Eligibility Check \u2014 $25",
                desc: isEs
                  ? "Verificamos si tu seguro cubre medicamentos GLP-1."
                  : "We verify whether your insurance covers GLP-1 medications.",
              },
              {
                step: "2",
                title: isEs ? "Autorizaci\u00F3n Previa \u2014 $50" : "Prior Authorization \u2014 $50",
                desc: isEs
                  ? "Manejamos todo el papeleo de autorizaci\u00F3n previa con tu aseguradora."
                  : "We handle all the prior authorization paperwork with your insurer.",
              },
              {
                step: "3",
                title: isEs ? "Aprobaci\u00F3n \u2014 $85" : "Approval \u2014 $85",
                desc: isEs
                  ? "Proceso completo de aprobaci\u00F3n para obtener tu medicamento cubierto."
                  : "Full approval process to get your medication covered.",
              },
              {
                step: "4",
                title: isEs ? "Manejo Continuo \u2014 $75/mes" : "Ongoing Management \u2014 $75/mo",
                desc: isEs
                  ? "Manejo mensual de tu receta cubierta por seguro."
                  : "Monthly management of your insurance-covered prescription.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 rounded-card border border-border">
                <div className="flex-shrink-0 w-10 h-10 bg-brand-red text-white rounded-full flex items-center justify-center font-heading font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-heading text-heading font-semibold">{item.title}</h3>
                  <p className="text-body-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href={`/${locale}/products/insurance-eligibility-check`} size="lg">
              {isEs ? "Comenzar Verificaci\u00F3n \u2014 $25" : "Start Eligibility Check \u2014 $25"}
            </Button>
            <p className="text-body-muted text-sm mt-4">
              {isEs
                ? "\u00BFPrefieres autofinanciado? "
                : "Prefer self-pay? "}
              <a href={`/${locale}/programs`} className="text-brand-red hover:underline">
                {isEs ? "Ver opciones de autofinanciamiento" : "See self-pay options"}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

async function OralResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  const product = await db.product.findUnique({
    where: { slug: "oral-glp1" },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACI\u00D3N" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "GLP-1 Oral \u2014 Sin Agujas"
                : "Oral GLP-1 \u2014 No Needles Required"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Una pastilla diaria con los mismos beneficios de p\u00E9rdida de peso. Sin inyecciones."
                : "A daily pill with the same weight loss benefits. No injections needed."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          {product && product.translations[0] && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {product.variants.map((v) => (
                  <div
                    key={v.id}
                    className={`rounded-card p-5 text-center ${
                      v.supplyDuration === "6-month"
                        ? "border-2 border-brand-red shadow-card-hover"
                        : "border border-border shadow-card"
                    }`}
                  >
                    {v.supplyDuration === "6-month" && (
                      <Badge variant="red">{isEs ? "MEJOR VALOR" : "BEST VALUE"}</Badge>
                    )}
                    <p className="text-body-muted text-sm mt-2 capitalize">
                      {v.supplyDuration?.replace("-", " ")}
                    </p>
                    <p className="font-heading text-heading text-2xl font-bold mt-1">
                      {formatPrice(v.price)}
                      {v.supplyDuration !== "one-time" && (
                        <span className="text-body-muted text-sm font-normal">/{isEs ? "mes" : "mo"}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              <div className="prose mb-8">
                <p className="text-body leading-relaxed">
                  {product.translations[0].descriptionLong}
                </p>
              </div>
            </>
          )}

          <div className="bg-surface-dim rounded-card p-6 mb-8">
            <p className="font-heading text-heading font-semibold mb-2">
              {isEs ? "\u00BFSab\u00EDas?" : "Did you know?"}
            </p>
            <p className="text-body text-sm">
              {isEs
                ? "Wegovy ahora est\u00E1 disponible en pastilla \u2014 una opci\u00F3n oral de marca aprobada por la FDA. Obten tu receta por solo $45."
                : "Wegovy is now available as a pill \u2014 an FDA-approved branded oral option. Get your prescription for just $45."}
            </p>
            <Button href={`/${locale}/products/branded-glp1-rx`} variant="outline" size="sm" className="mt-3">
              {isEs ? "M\u00E1s Sobre Wegovy Pastilla" : "Learn About Wegovy Pill"}
            </Button>
          </div>

          <div className="text-center">
            <Button href={`/${locale}/products/oral-glp1`} size="lg">
              {isEs ? "Comenzar con GLP-1 Oral" : "Get Started with Oral GLP-1"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

async function BrandedResult({ locale, isEs }: { locale: string; isEs: boolean }) {
  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">{isEs ? "TU RECOMENDACI\u00D3N" : "YOUR RECOMMENDATION"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "Receta de GLP-1 de Marca \u2014 $45"
                : "Branded GLP-1 Prescription \u2014 $45"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Obt\u00E9n una receta leg\u00EDtima de un proveedor certificado. Sin suscripci\u00F3n. Sin membres\u00EDa."
                : "Get a legitimate prescription from a board-certified provider. No subscription. No membership."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          <h2 className="font-heading text-heading text-2xl font-bold mb-6 text-center">
            {isEs ? "Compara Tus Opciones de Medicamento" : "Compare Your Medication Options"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              {
                name: isEs ? "Wegovy Pastilla" : "Wegovy Pill",
                type: isEs ? "Oral \u2014 sin agujas" : "Oral \u2014 no needles",
                price: "~$149-299/mo",
                where: isEs ? "NovoCare / farmacia" : "NovoCare / pharmacy",
              },
              {
                name: isEs ? "Wegovy Inyecci\u00F3n" : "Wegovy Injection",
                type: isEs ? "Pluma semanal" : "Weekly pen",
                price: "~$349/mo",
                where: isEs ? "NovoCare / farmacia" : "NovoCare / pharmacy",
              },
              {
                name: "Zepbound KwikPen",
                type: isEs ? "Pluma mensual" : "Monthly pen",
                price: "~$299-449/mo",
                where: "LillyDirect",
              },
              {
                name: "Zepbound Vial",
                type: isEs ? "Vial con jeringa" : "Vial with syringe",
                price: "~$299-449/mo",
                where: "LillyDirect",
              },
            ].map((med) => (
              <div key={med.name} className="rounded-card border border-border p-5">
                <h3 className="font-heading text-heading font-bold mb-1">{med.name}</h3>
                <p className="text-body-muted text-sm mb-2">{med.type}</p>
                <p className="font-heading text-heading text-lg font-bold">{med.price}</p>
                <p className="text-body-muted text-xs mt-1">
                  {isEs ? "D\u00F3nde surtir:" : "Where to fill:"} {med.where}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-surface-dim rounded-card p-6 mb-8 text-center">
            <p className="font-heading text-heading text-3xl font-bold mb-1">$45</p>
            <p className="text-body-muted">
              {isEs
                ? "Pago \u00FAnico por tu receta. Medicamento se paga por separado en la farmacia."
                : "One-time payment for your prescription. Medication paid separately at the pharmacy."}
            </p>
          </div>

          <div className="text-center">
            <Button href={`/${locale}/products/branded-glp1-rx`} size="lg">
              {isEs ? "Obtener Mi Receta \u2014 $45" : "Get My Prescription \u2014 $45"}
            </Button>
            <p className="text-body-muted text-sm mt-4">
              {isEs ? "\u00BFTienes seguro? " : "Have insurance? "}
              <a href={`/${locale}/insurance-check`} className="text-brand-red hover:underline">
                {isEs ? "Verifica tu cobertura gratis" : "Check your coverage for free"}
              </a>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
