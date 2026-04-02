import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SupplementAddToCart } from "@/components/supplements/SupplementAddToCart";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Truck, Leaf, CheckCircle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const CATEGORY_LABELS: Record<string, { en: string; es: string }> = {
  vitamins:   { en: "Vitamins & Minerals", es: "Vitaminas y Minerales" },
  probiotics: { en: "Probiotics",          es: "Probióticos" },
  omega3:     { en: "Omega-3",             es: "Omega-3" },
  minerals:   { en: "Minerals",            es: "Minerales" },
  protein:    { en: "Protein & Collagen",  es: "Proteína y Colágeno" },
  wellness:   { en: "Adaptogens & Wellness", es: "Adaptógenos y Bienestar" },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default async function SupplementProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await db.product.findUnique({
    where: { slug, productType: "supplement" },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || !product.isActive) notFound();

  const t = product.translations[0];
  if (!t) notFound();

  const isEs = locale === "es";
  const variant = product.variants[0];
  const imageUrl = product.images[0]?.url ?? null;
  const catLabel = CATEGORY_LABELS[product.category];

  const longDescParagraphs = t.descriptionLong.split("\n").filter(Boolean);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-white">
        <Container>
          <div className="py-3 flex items-center gap-2 text-sm text-body-muted">
            <Link href={`/${locale}/supplements`} className="hover:text-heading flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              {isEs ? "Suplementos" : "Supplements"}
            </Link>
            <span>/</span>
            <span className="text-heading font-medium truncate">{t.name}</span>
          </div>
        </Container>
      </div>

      {/* Product Hero */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            <div className="aspect-square rounded-card overflow-hidden bg-gradient-to-br from-brand-pink-soft to-white border border-border flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={t.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                  <Leaf className="w-24 h-24 text-brand-red" />
                  <p className="text-sm text-body-muted">{isEs ? "Imagen próximamente" : "Image coming soon"}</p>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {catLabel && (
                <Badge variant="pink">
                  {isEs ? catLabel.es : catLabel.en}
                </Badge>
              )}

              <h1 className="font-heading text-heading text-3xl sm:text-4xl font-bold">
                {t.name}
              </h1>

              <p className="text-body-muted text-lg leading-relaxed">
                {t.descriptionShort}
              </p>

              {/* Pricing — shows subscribe & save as primary */}
              {variant && (() => {
                const subscribePrice = Math.round(variant.price * 0.90);
                const savings = variant.price - subscribePrice;
                return (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-heading text-heading text-3xl font-bold">
                        {fmt(subscribePrice)}
                        <span className="text-base font-normal text-body-muted">/mo</span>
                      </span>
                      <span className="text-body-muted text-lg line-through">{fmt(variant.price)}</span>
                      <span className="bg-brand-red text-white text-sm font-bold px-2 py-0.5 rounded-full">
                        {isEs ? "Ahorra 10%" : "Save 10%"}
                      </span>
                    </div>
                    <p className="text-body-muted text-sm">
                      {isEs
                        ? `Suscripción mensual · o ${fmt(variant.price)} de pago único`
                        : `Monthly subscription · or ${fmt(variant.price)} one-time`}
                    </p>
                    {variant.label && (
                      <p className="text-body-muted text-xs">{variant.label}</p>
                    )}
                    {variant.compareAtPrice && (
                      <p className="text-xs text-success font-medium">
                        {isEs
                          ? `Ahorra ${fmt(savings)} al mes con la suscripción`
                          : `Save ${fmt(savings)}/mo with Subscribe & Save`}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Ships separately notice */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-card text-sm text-blue-800">
                <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  {isEs
                    ? "Este suplemento se envía por separado de los medicamentos Rx y puede llegar en un paquete diferente."
                    : "This supplement ships separately from Rx medications and may arrive in a different package."}
                </p>
              </div>

              {/* Add to Cart */}
              {variant && (
                <SupplementAddToCart
                  productId={product.id}
                  variantId={variant.id}
                  name={t.name}
                  variantLabel={variant.label ?? ""}
                  price={variant.price}
                  slug={product.slug}
                  isEs={isEs}
                />
              )}

              {/* Trust Signals */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { icon: ShieldCheck, text: isEs ? "Verificado por terceros" : "Third-party tested", color: "text-green-600" },
                  { icon: Leaf, text: isEs ? "Sin rellenos artificiales" : "No artificial fillers", color: "text-teal-600" },
                  { icon: Truck, text: isEs ? "Envío rápido" : "Fast shipping", color: "text-brand-red" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-body-muted">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Full Description */}
      <section className="py-12 border-t border-border bg-surface-dim">
        <Container narrow>
          <h2 className="font-heading text-heading text-2xl font-bold mb-6">
            {isEs ? "Descripción Completa" : "Full Description"}
          </h2>
          <div className="space-y-4">
            {longDescParagraphs.map((para, i) => (
              <p key={i} className="text-body-muted leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* Why Dr. Moleon recommends it */}
          <div className="mt-10 p-6 bg-white rounded-card border border-border">
            <p className="font-heading text-heading font-semibold mb-2">
              {isEs ? "Por qué el Dr. Moleon lo recomienda" : "Why Dr. Moleon recommends this"}
            </p>
            <ul className="space-y-2">
              {[
                isEs ? "Formulación de grado farmacéutico" : "Pharmaceutical-grade formulation",
                isEs ? "Probado por laboratorio independiente" : "Independently lab-tested",
                isEs ? "Complementa tu tratamiento médico" : "Complements your medical treatment",
                isEs ? "Sin rellenos ni alérgenos artificiales" : "Free of artificial fillers and allergens",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-body-muted">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Back CTA */}
      <section className="py-8 border-t border-border">
        <Container>
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/supplements`}
              className="flex items-center gap-2 text-sm font-medium text-body-muted hover:text-heading transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isEs ? "Ver todos los suplementos" : "Browse all supplements"}
            </Link>
            <Link
              href={`/${locale}/cart`}
              className="text-sm font-medium text-brand-red hover:underline"
            >
              {isEs ? "Ver carrito" : "View cart"}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
