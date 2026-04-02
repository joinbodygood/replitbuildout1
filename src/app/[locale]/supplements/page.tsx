import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { SupplementCategoryTabs } from "@/components/supplements/SupplementCategoryTabs";
import { Truck, ShieldCheck, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export const CATEGORY_META: Record<string, { label: { en: string; es: string }; color: string }> = {
  "bundle":             { label: { en: "Bundles",                  es: "Paquetes" },                 color: "bg-lime-100 text-lime-800" },
  "stress-wellness":    { label: { en: "Stress & Wellness",       es: "Estrés y Bienestar" },      color: "bg-violet-100 text-violet-800" },
  "metabolism-support": { label: { en: "Metabolism Support",       es: "Apoyo Metabólico" },         color: "bg-orange-100 text-orange-800" },
  "daily-essentials":   { label: { en: "Daily Essentials",         es: "Esenciales Diarios" },       color: "bg-yellow-100 text-yellow-800" },
  "performance":        { label: { en: "Performance",              es: "Rendimiento" },              color: "bg-blue-100 text-blue-800" },
  "digestive-support":  { label: { en: "Digestive Support",        es: "Apoyo Digestivo" },          color: "bg-green-100 text-green-800" },
  "beauty":             { label: { en: "Beauty",                   es: "Belleza" },                  color: "bg-pink-100 text-pink-800" },
  "hydration":          { label: { en: "Hydration",                es: "Hidratación" },              color: "bg-cyan-100 text-cyan-800" },
  "anti-aging":         { label: { en: "Anti-Aging",               es: "Anti-Envejecimiento" },      color: "bg-purple-100 text-purple-800" },
  "protein":            { label: { en: "Protein & Shakes",         es: "Proteína y Batidos" },       color: "bg-red-100 text-red-800" },
  "sleep":              { label: { en: "Sleep",                    es: "Sueño" },                    color: "bg-indigo-100 text-indigo-800" },
  "womens-health":      { label: { en: "Women's Health",           es: "Salud Femenina" },           color: "bg-rose-100 text-rose-800" },
  "hair-care":          { label: { en: "Hair Care",                es: "Cuidado del Cabello" },      color: "bg-amber-100 text-amber-800" },
  "skincare":           { label: { en: "Skincare",                 es: "Cuidado de la Piel" },       color: "bg-teal-100 text-teal-800" },
  // legacy categories from placeholder seed (kept for backward-compat)
  "vitamins":           { label: { en: "Vitamins",                 es: "Vitaminas" },                color: "bg-yellow-100 text-yellow-800" },
  "probiotics":         { label: { en: "Probiotics",               es: "Probióticos" },              color: "bg-green-100 text-green-800" },
  "omega3":             { label: { en: "Omega-3",                  es: "Omega-3" },                  color: "bg-blue-100 text-blue-800" },
  "minerals":           { label: { en: "Minerals",                 es: "Minerales" },                color: "bg-orange-100 text-orange-800" },
  "wellness":           { label: { en: "Adaptogens & Wellness",    es: "Adaptógenos y Bienestar" },  color: "bg-teal-100 text-teal-800" },
};

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default async function SupplementsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category: categoryParam } = await searchParams;
  setRequestLocale(locale);

  const isEs = locale === "es";

  const products = await db.product.findMany({
    where: {
      productType: { in: ["supplement", "bundle"] },
      isActive: true,
      ...(categoryParam ? { category: categoryParam } : {}),
    },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { sortOrder: "asc" },
  });

  const allProducts = await db.product.findMany({
    where: { productType: { in: ["supplement", "bundle"] }, isActive: true },
    select: { category: true },
  });

  const categoryCounts = allProducts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-brand-pink-soft via-white to-brand-pink-soft">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="pink" className="mb-4">
              {isEs ? "Exclusivo" : "New"}
            </Badge>
            <h1 className="font-heading text-heading text-4xl sm:text-5xl font-bold mb-4">
              {isEs ? "Vitaminas y Suplementos" : "Vitamins & Supplements"}
            </h1>
            <p className="text-body-muted text-lg mb-8">
              {isEs
                ? "Formulados para apoyar tu programa de salud. Seleccionados por el Dr. Moleon para complementar tus tratamientos de GLP-1, pérdida de cabello y bienestar."
                : "Formulated to support your health program. Curated by Dr. Moleon to complement your GLP-1, hair loss, and wellness treatments."}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-body-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>{isEs ? "Terceros verificados" : "Third-party tested"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-red" />
                <span>{isEs ? "Envío rápido" : "Fast shipping"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>{isEs ? "Sin rellenos artificiales" : "No artificial fillers"}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Sticky Category Filter */}
      <section className="sticky top-0 z-30 bg-white border-b border-border shadow-sm py-3">
        <Container>
          <SupplementCategoryTabs
            categories={CATEGORY_META}
            categoryCounts={categoryCounts}
            activeCategory={categoryParam ?? "all"}
            locale={locale}
            isEs={isEs}
          />
        </Container>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <Container>
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body-muted text-lg">
                {isEs ? "No hay productos en esta categoría." : "No products in this category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const t = product.translations[0];
                if (!t) return null;
                const variant = product.variants[0];
                const catMeta = CATEGORY_META[product.category];
                const imageUrl = product.images[0]?.url ?? null;

                const isBundle = product.productType === "bundle";
                const savingsPct = variant?.compareAtPrice
                  ? Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100)
                  : null;

                return (
                  <Link
                    key={product.id}
                    href={`/${locale}/supplements/${product.slug}`}
                    className="group rounded-card border border-border bg-white hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-brand-pink-soft to-white flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={t.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                          <Leaf className="w-16 h-16 text-brand-red" />
                        </div>
                      )}
                      {isBundle && (
                        <div className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full">
                          {isEs ? "Paquete" : "Bundle"}
                        </div>
                      )}
                      {!isBundle && variant?.compareAtPrice && (
                        <div className="absolute top-3 left-3 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded-full">
                          {isEs ? "Oferta" : "Sale"}
                        </div>
                      )}
                      {isBundle && savingsPct !== null && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {isEs ? `Ahorra ${savingsPct}%` : `Save ${savingsPct}%`}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-grow">
                      {catMeta && (
                        <span className={`inline-flex w-fit text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${catMeta.color}`}>
                          {isEs ? catMeta.label.es : catMeta.label.en}
                        </span>
                      )}
                      <h3 className="font-heading text-heading font-semibold text-base mb-1 group-hover:text-brand-red transition-colors line-clamp-2">
                        {t.name}
                      </h3>
                      <p className="text-body-muted text-sm line-clamp-2 flex-grow mb-3">
                        {t.descriptionShort}
                      </p>
                      <div className="flex items-end justify-between mt-auto">
                        <div>
                          {variant ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-heading text-heading font-bold text-lg">
                                  {fmt(variant.price)}
                                </span>
                                {variant.compareAtPrice && (
                                  <span className="text-body-muted text-sm line-through">
                                    {fmt(variant.compareAtPrice)}
                                  </span>
                                )}
                              </div>
                              {isBundle && variant.compareAtPrice && (
                                <span className="text-green-700 text-xs font-medium">
                                  {isEs
                                    ? `Ahorras ${fmt(variant.compareAtPrice - variant.price)}`
                                    : `You save ${fmt(variant.compareAtPrice - variant.price)}`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-body-muted text-sm">{isEs ? "Ver opciones" : "See options"}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-brand-red group-hover:underline shrink-0">
                          {isEs ? "Ver más" : "View"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* Trust Banner */}
      <section className="py-12 bg-surface-dim border-t border-border">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-heading text-heading font-bold text-lg mb-1">
                {isEs ? "Seleccionados por Médicos" : "Physician-Curated"}
              </p>
              <p className="text-body-muted text-sm">
                {isEs
                  ? "Cada producto es revisado por el Dr. Moleon para asegurar calidad y compatibilidad con tus tratamientos."
                  : "Every product reviewed by Dr. Moleon for quality and compatibility with your treatments."}
              </p>
            </div>
            <div>
              <p className="font-heading text-heading font-bold text-lg mb-1">
                {isEs ? "Se Envía por Separado" : "Ships Separately"}
              </p>
              <p className="text-body-muted text-sm">
                {isEs
                  ? "Los suplementos se envían desde nuestro almacén, independientemente de tus medicamentos Rx."
                  : "Supplements ship from our warehouse, independently from your Rx medications."}
              </p>
            </div>
            <div>
              <p className="font-heading text-heading font-bold text-lg mb-1">
                {isEs ? "Satisfacción Garantizada" : "Satisfaction Guaranteed"}
              </p>
              <p className="text-body-muted text-sm">
                {isEs
                  ? "No estás satisfecho? Contáctanos y lo solucionamos."
                  : "Not satisfied? Contact us and we'll make it right."}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
