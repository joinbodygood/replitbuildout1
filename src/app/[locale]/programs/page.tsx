import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Scale,
  Sparkles,
  Sun,
  Heart,
  Brain,
  Zap,
  ArrowRight,
} from "lucide-react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isEs = locale === "es";

  const categories = [
    {
      id: "weight-loss",
      icon: <Scale size={28} className="text-brand-red" />,
      badge: isEs ? "MÁS POPULAR" : "MOST POPULAR",
      featured: true,
      title: isEs ? "Manejo de Peso (GLP-1)" : "Weight Loss (GLP-1)",
      tagline: isEs
        ? "Semaglutida · Tirzepatida · Oral · De Marca"
        : "Semaglutide · Tirzepatide · Oral · Branded",
      included: isEs
        ? [
            "Compuesto — el mismo ingrediente, precio más bajo",
            "Oral — sin agujas, pastilla diaria",
            "De marca (Wegovy/Zepbound) — $45 por tu receta",
            "Seguro — verificamos tu cobertura",
          ]
        : [
            "Compounded — same active ingredient, fraction of the cost",
            "Oral — no needles, one pill daily",
            "Branded (Wegovy/Zepbound) — $45 for your prescription",
            "Insurance — we check your coverage for you",
          ],
      price: isEs ? "Desde $45" : "From $45",
      cta: isEs ? "Encontrar Mi Programa" : "Find My Program",
      href: `/${locale}/quiz`,
    },
    {
      id: "hair",
      icon: <Sparkles size={28} className="text-brand-red" />,
      badge: isEs ? "MUJERES Y HOMBRES" : "WOMEN & MEN",
      title: isEs ? "Restauración Capilar" : "Hair Restoration",
      tagline: isEs
        ? "Minoxidil · Finasteride · Dutasteride · Péptidos"
        : "Minoxidil · Finasteride · Dutasteride · Peptides",
      included: isEs
        ? [
            "Minoxidil oral — tratamiento sistémico probado",
            "Mezclas tópicas con 4–6 activos en un spray",
            "Dutasteride para pérdida avanzada de cabello",
            "Fórmulas para mujeres posparto y menopáusicas",
          ]
        : [
            "Oral minoxidil — proven systemic treatment",
            "Topical blends with 4–6 actives in one spray",
            "Dutasteride for advanced hair loss",
            "Postpartum and menopausal formulas for women",
          ],
      price: isEs ? "Desde $35/mes" : "From $35/mo",
      cta: isEs ? "Encontrar Mi Tratamiento" : "Find My Treatment",
      href: `/${locale}/quiz/hair`,
    },
    {
      id: "skin",
      icon: <Sun size={28} className="text-brand-red" />,
      badge: isEs ? "GRADO MÉDICO" : "MEDICAL-GRADE",
      title: isEs ? "Cuidado de Piel & Glow" : "Skincare & Glow",
      tagline: isEs
        ? "Anti-edad · Manchas oscuras · Acné · Rosácea"
        : "Anti-aging · Dark spots · Acne · Rosacea",
      included: isEs
        ? [
            "Crema Glow — tretinoína + ácido azelaico + niacinamida",
            "Crema Bright — hidroquinona 8% para melasma",
            "Combo piel limpia — acné hormonal con espironolactona",
            "Crema Calm — fórmula suave para rosácea",
          ]
        : [
            "Glow Cream — tretinoin + azelaic acid + niacinamide",
            "Bright Cream — 8% hydroquinone for melasma & dark spots",
            "Clear Skin Combo — hormonal acne with spironolactone",
            "Rosacea Calm — gentle anti-inflammatory formula",
          ],
      price: isEs ? "Desde $55/mes" : "From $55/mo",
      cta: isEs ? "Encontrar Mi Fórmula" : "Find My Formula",
      href: `/${locale}/quiz/skin`,
    },
    {
      id: "feminine-health",
      icon: <Heart size={28} className="text-brand-red" />,
      badge: isEs ? "SALUD ÍNTIMA" : "INTIMATE HEALTH",
      title: isEs ? "Salud Femenina" : "Feminine Health",
      tagline: isEs
        ? "Infecciones · Sequedad · Bienestar Íntimo · Prevención"
        : "Infections · Dryness · Intimate Wellness · Prevention",
      included: isEs
        ? [
            "ITU, infección por hongos, VB — receta el mismo día",
            "Tratamiento de sequedad vaginal con estriol o estradiol",
            "Crema de bienestar íntimo — sildenafil tópico",
            "Paquete de prevención — probióticos + D-manosa + ácido bórico",
          ]
        : [
            "UTI, yeast infection, BV — same-day Rx",
            "Vaginal dryness treatment with estriol or estradiol",
            "Intimate wellness cream — topical sildenafil",
            "Prevention bundle — probiotics + D-Mannose + boric acid",
          ],
      price: isEs ? "Desde $29/mes" : "From $29/mo",
      cta: isEs ? "Encontrar Mi Tratamiento" : "Find My Treatment",
      href: `/${locale}/quiz/feminine-health`,
    },
    {
      id: "mental-wellness",
      icon: <Brain size={28} className="text-brand-red" />,
      badge: isEs ? "SIN SUSTANCIAS CONTROLADAS" : "NO CONTROLLED SUBSTANCES",
      title: isEs ? "Bienestar Mental" : "Mental Wellness",
      tagline: isEs
        ? "Ansiedad · Sueño · Estado de Ánimo · Motivación"
        : "Anxiety · Sleep · Mood · Motivation",
      included: isEs
        ? [
            "Calm Rx — buspirona para ansiedad generalizada",
            "Stage Ready — propranolol para ansiedad de actuación",
            "Sleep Rx — trazodona o hidroxizina, no adictivos",
            "Lift Rx — ISRS para depresión y bajo estado de ánimo",
          ]
        : [
            "Calm Rx — buspirone for generalized anxiety",
            "Stage Ready — propranolol for performance anxiety",
            "Sleep Rx — trazodone or hydroxyzine, non-habit-forming",
            "Lift Rx — SSRI for depression and low mood",
          ],
      price: isEs ? "Desde $49" : "From $49",
      cta: isEs ? "Encontrar Mi Tratamiento" : "Find My Treatment",
      href: `/${locale}/quiz/mental-wellness`,
    },
    {
      id: "anti-aging",
      icon: <Zap size={28} className="text-brand-red" />,
      badge: isEs ? "PRÓXIMAMENTE" : "COMING SOON",
      title: isEs ? "Anti-Edad & Bienestar" : "Anti-Aging & Wellness",
      tagline: isEs
        ? "NAD+ · Terapia Hormonal · Péptidos · DHEA"
        : "NAD+ · Hormone Therapy · Peptides · DHEA",
      included: isEs
        ? [
            "NAD+ troches o spray nasal — energía celular",
            "Bi-est + progesterona — terapia hormonal bioidéntica",
            "Testosterona en crema (dosis baja) para mujeres",
            "Spray nasal Selank — anti-ansiedad peptídico",
          ]
        : [
            "NAD+ troches or nasal spray — cellular energy",
            "Bi-est + progesterone — bioidentical hormone therapy",
            "Testosterone cream (low-dose) for women",
            "Selank nasal spray — peptide-based anxiety relief",
          ],
      price: isEs ? "Desde $49/mes" : "From $49/mo",
      cta: isEs ? "Notifícarme" : "Notify Me",
      href: `/${locale}/quiz`,
      comingSoon: true,
    },
  ];

  const weightLossPlans = isEs
    ? [
        {
          title: "GLP-1 Compuesto",
          desc: "Semaglutida y Tirzepatida — el mismo ingrediente activo a una fracción del costo.",
          price: "Desde $139/mes",
          cta: "Comenzar",
          href: `/${locale}/products/compounded-semaglutide`,
          badge: "MÁS POPULAR",
          featured: true,
        },
        {
          title: "Programa de Seguro",
          desc: "Verificamos si tu seguro cubre GLP-1 y manejamos toda la autorización.",
          price: "Desde $25",
          cta: "Verificar Elegibilidad",
          href: `/${locale}/insurance-check`,
          badge: "USA TU SEGURO",
        },
        {
          title: "GLP-1 Oral",
          desc: "Sin agujas — pastilla diaria con los mismos beneficios de pérdida de peso.",
          price: "Desde $109/mes",
          cta: "Más Información",
          href: `/${locale}/products/oral-glp1`,
          badge: "SIN AGUJAS",
        },
        {
          title: "Receta de Marca",
          desc: "Wegovy y Zepbound — $45 por tu receta. Surtir en tu farmacia.",
          price: "$45",
          cta: "Obtener Receta",
          href: `/${locale}/products/branded-glp1-rx`,
          badge: "FDA APROBADO",
        },
      ]
    : [
        {
          title: "Compounded GLP-1",
          desc: "Semaglutide & Tirzepatide — same active ingredient, fraction of the cost.",
          price: "From $139/mo",
          cta: "Get Started",
          href: `/${locale}/products/compounded-semaglutide`,
          badge: "MOST POPULAR",
          featured: true,
        },
        {
          title: "Insurance Program",
          desc: "We check if your insurance covers GLP-1 and handle all the prior auth paperwork.",
          price: "From $25",
          cta: "Check Eligibility",
          href: `/${locale}/insurance-check`,
          badge: "USE YOUR INSURANCE",
        },
        {
          title: "Oral GLP-1",
          desc: "No needles — daily pill with the same weight loss benefits.",
          price: "From $109/mo",
          cta: "Learn More",
          href: `/${locale}/products/oral-glp1`,
          badge: "NO NEEDLES",
        },
        {
          title: "Branded Rx",
          desc: "Wegovy & Zepbound — $45 for your prescription. Fill at any pharmacy.",
          price: "$45",
          cta: "Get Your Rx",
          href: `/${locale}/products/branded-glp1-rx`,
          badge: "FDA APPROVED",
        },
      ];

  return (
    <>
      <section className="py-14 bg-brand-pink-soft">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-heading text-heading text-4xl md:text-5xl font-bold mb-4">
              {isEs ? "Todos Nuestros Programas" : "All Programs"}
            </h1>
            <p className="text-body-muted text-lg">
              {isEs
                ? "Un médico real. Múltiples áreas de cuidado. Elige lo que tu cuerpo necesita hoy — todo con opciones de envío a domicilio o receta a tu farmacia."
                : "One real doctor. Multiple areas of care. Choose what your body needs today — every program offers Ship-to-Door or Pharmacy Rx options."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-2xl border-2 flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover ${
                  cat.featured
                    ? "border-brand-red"
                    : cat.comingSoon
                    ? "border-gray-200 opacity-75"
                    : "border-border"
                }`}
              >
                <div
                  className={`px-6 pt-6 pb-4 ${
                    cat.featured ? "bg-brand-red/5" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-brand-pink-soft rounded-lg">
                      {cat.icon}
                    </div>
                    <Badge variant={cat.featured ? "red" : "pink"}>
                      {cat.badge}
                    </Badge>
                  </div>
                  <h2 className="font-heading text-heading text-xl font-bold mb-1">
                    {cat.title}
                  </h2>
                  <p className="text-body-muted text-sm">{cat.tagline}</p>
                </div>

                <div className="px-6 py-4 flex-grow bg-white">
                  <ul className="space-y-2">
                    {cat.included.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-body">
                        <span className="text-brand-red mt-0.5 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-6 py-5 bg-white border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-body-muted text-xs uppercase tracking-wide">
                      {isEs ? "Desde" : "Starting at"}
                    </p>
                    <p className="font-heading text-heading text-lg font-bold">
                      {cat.price}
                    </p>
                  </div>
                  <Button
                    href={cat.comingSoon ? undefined : cat.href}
                    size="sm"
                    variant={cat.featured ? "primary" : "outline"}
                    className="flex items-center gap-1"
                    disabled={cat.comingSoon}
                  >
                    {cat.cta}
                    {!cat.comingSoon && <ArrowRight size={14} />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 bg-surface-dim">
        <Container>
          <div className="text-center mb-8">
            <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2">
              {isEs ? "Opciones de Manejo de Peso" : "Weight Loss Program Options"}
            </h2>
            <p className="text-body-muted">
              {isEs
                ? "Cuatro caminos hacia tu meta de peso. Precios transparentes. Sin cuotas ocultas."
                : "Four paths to your weight goal. Transparent pricing. No hidden fees."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {weightLossPlans.map((plan) => (
              <Card
                key={plan.title}
                featured={"featured" in plan ? plan.featured : false}
                className="flex flex-col"
              >
                <Badge variant={"featured" in plan && plan.featured ? "red" : "pink"}>
                  {plan.badge}
                </Badge>
                <h3 className="font-heading text-heading text-lg font-bold mt-4 mb-2">
                  {plan.title}
                </h3>
                <p className="text-body-muted text-sm mb-4 flex-grow">{plan.desc}</p>
                <p className="font-heading text-heading font-bold mb-4">{plan.price}</p>
                <Button
                  href={plan.href}
                  size="sm"
                  variant={"featured" in plan && plan.featured ? "primary" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-body-muted mb-3">
              {isEs
                ? "¿No estás segura cuál elegir?"
                : "Not sure which weight loss program is right for you?"}
            </p>
            <Button href={`/${locale}/quiz`} variant="secondary" size="md">
              {isEs
                ? "Tomar el Quiz de Pérdida de Peso"
                : "Take the Weight Loss Quiz"}
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="bg-brand-red rounded-2xl p-8 text-white text-center">
            <h2 className="font-heading text-3xl font-bold mb-3">
              {isEs
                ? "Tu tratamiento. Tu manera."
                : "Your treatment. Your way."}
            </h2>
            <p className="text-white/80 text-base max-w-xl mx-auto mb-6">
              {isEs
                ? "Cada programa ofrece dos opciones: envío compuesto a tu puerta, o receta a tu farmacia local para usar tu seguro. Un médico real en cualquiera de los dos caminos."
                : "Every program offers two options: compounded formula shipped to your door, or a prescription sent to your local pharmacy so you can use your insurance. A real doctor either way."}
            </p>
            <Button href={`/${locale}/quiz`} variant="secondary" size="lg">
              {isEs ? "Comenzar Mi Evaluación Gratis" : "Start My Free Assessment"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
