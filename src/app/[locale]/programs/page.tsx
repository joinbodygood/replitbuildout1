import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Props = {
  params: Promise<{ locale: string }>;
};

type ProgramCard = {
  title: string;
  description: string;
  price: string;
  cta: string;
  href: string;
  badge: string;
  featured?: boolean;
};

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const programs: ProgramCard[] =
    locale === "es"
      ? [
          {
            title: "GLP-1 Compuesto",
            description:
              "Semaglutida y Tirzepatida \u2014 medicamento, proveedor y soporte incluidos. La opci\u00f3n m\u00e1s asequible.",
            price: "Desde $139/mes",
            cta: "Comenzar",
            href: `/${locale}/products/compounded-semaglutide`,
            badge: "M\u00c1S POPULAR",
            featured: true,
          },
          {
            title: "Programa de Seguro",
            description:
              "Descubre si tu seguro cubre medicamentos GLP-1. Comenzamos con una verificaci\u00f3n de elegibilidad.",
            price: "Desde $25",
            cta: "Verificar Elegibilidad",
            href: `/${locale}/insurance-check`,
            badge: "SEGURO",
          },
          {
            title: "GLP-1 Oral",
            description:
              "Sin agujas \u2014 medicamento oral para bajar de peso que tomas diariamente. Mismo beneficio, sin inyecciones.",
            price: "Desde $109/mes",
            cta: "M\u00e1s Informaci\u00f3n",
            href: `/${locale}/products/oral-glp1`,
            badge: "SIN AGUJAS",
          },
          {
            title: "Receta de Marca",
            description:
              "Wegovy y Zepbound \u2014 $45 por tu receta. T\u00fa la surtes en la farmacia y pagas directamente.",
            price: "$45",
            cta: "Obtener Tu Receta",
            href: `/${locale}/products/branded-glp1-rx`,
            badge: "FDA APROBADO",
          },
        ]
      : [
          {
            title: "Compounded GLP-1",
            description:
              "Semaglutide & Tirzepatide \u2014 medication, provider, and support included. The most affordable option.",
            price: "From $139/mo",
            cta: "Get Started",
            href: `/${locale}/products/compounded-semaglutide`,
            badge: "MOST POPULAR",
            featured: true,
          },
          {
            title: "Insurance Program",
            description:
              "Find out if your insurance covers GLP-1 medications. We start with an eligibility check.",
            price: "From $25",
            cta: "Check Eligibility",
            href: `/${locale}/insurance-check`,
            badge: "INSURANCE",
          },
          {
            title: "Oral GLP-1",
            description:
              "No needles \u2014 oral weight loss medication you take daily. Same benefit, no injections.",
            price: "From $109/mo",
            cta: "Learn More",
            href: `/${locale}/products/oral-glp1`,
            badge: "NO NEEDLES",
          },
          {
            title: "Branded Rx",
            description:
              "Wegovy & Zepbound \u2014 $45 for your prescription. Fill at any pharmacy and pay them directly.",
            price: "$45",
            cta: "Get Your Rx",
            href: `/${locale}/products/branded-glp1-rx`,
            badge: "FDA APPROVED",
          },
        ];

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {locale === "es"
              ? "Programas de Manejo de Peso"
              : "Weight Management Programs"}
          </h1>
          <p className="text-body-muted text-lg text-center max-w-2xl mx-auto">
            {locale === "es"
              ? "Cuatro caminos hacia tu meta de peso. Precios transparentes. Sin cuotas ocultas."
              : "Four paths to your weight goal. Transparent pricing. No hidden fees."}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((program) => (
              <Card
                key={program.title}
                featured={program.featured}
                className="flex flex-col"
              >
                <Badge variant={program.featured ? "red" : "pink"}>
                  {program.badge}
                </Badge>
                <h2 className="font-heading text-heading text-xl font-bold mt-4 mb-2">
                  {program.title}
                </h2>
                <p className="text-body-muted text-sm mb-4 flex-grow">
                  {program.description}
                </p>
                <p className="font-heading text-heading text-lg font-bold mb-4">
                  {program.price}
                </p>
                <Button href={program.href} size="sm" variant={program.featured ? "primary" : "outline"}>
                  {program.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-body-muted mb-4">
              {locale === "es"
                ? "\u00bfNo est\u00e1s segura cu\u00e1l elegir?"
                : "Not sure which to choose?"}
            </p>
            <Button href={`/${locale}/quiz`} variant="secondary" size="lg">
              {locale === "es"
                ? "\u00bfCu\u00e1l Opci\u00f3n es la Correcta Para M\u00ed?"
                : "Which Option Is Right For Me?"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
