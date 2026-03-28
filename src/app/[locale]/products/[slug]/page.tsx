import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getProduct(slug: string, locale: string) {
  return db.product.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await getProduct(slug, locale);
  if (!product || !product.isActive) notFound();

  const t = product.translations[0];
  if (!t) notFound();

  const isEs = locale === "es";

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="pink">{product.category.replace("_", " ").toUpperCase()}</Badge>
            <h1 className="font-heading text-heading text-4xl font-bold mt-4 mb-4">
              {t.name}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {t.descriptionShort}
            </p>
          </div>
        </Container>
      </section>

      {/* Add to Cart + Pricing */}
      <section className="py-12 border-b border-border">
        <Container narrow>
          <ProductVariantSelector
            productId={product.id}
            productName={t.name}
            productSlug={product.slug}
            variants={product.variants}
            locale={locale}
          />
        </Container>
      </section>

      {/* Description */}
      <section className="py-16">
        <Container narrow>
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="font-heading text-heading text-2xl font-bold mb-4">
              {isEs ? "Detalles del Programa" : "Program Details"}
            </h2>
            <p className="text-body leading-relaxed whitespace-pre-line">
              {t.descriptionLong}
            </p>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-body-muted text-sm mb-3">
              {isEs ? "¿Preguntas? Nuestro equipo médico está aquí para ayudarte." : "Questions? Our medical team is here to help."}
            </p>
            <Button href={`/${locale}/faq`} variant="outline" size="sm">
              {isEs ? "Ver Preguntas Frecuentes" : "View FAQs"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
