import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductVariantSelector } from "@/components/product/ProductVariantSelector";
import { GoodRxPriceCheck } from "@/components/product/GoodRxPriceCheck";

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

  // Build Product JSON-LD. Server-rendered so Google sees it in initial HTML.
  const canonicalUrl = `https://joinbodygood.com/${locale}/products/${product.slug}`;
  const images = product.images.map((img) => img.url).filter(Boolean);
  const offers = product.variants.map((variant) => ({
    "@type": "Offer",
    sku: variant.sku,
    name: variant.label || t.name,
    price: (variant.price / 100).toFixed(2),
    priceCurrency: "USD",
    availability: variant.isAvailable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: canonicalUrl,
  }));

  // Only attach AggregateRating if the product actually has approved reviews.
  const approvedReviews = await db.review.findMany({
    where: { productSlug: product.slug, isApproved: true },
    select: { rating: true },
  });
  let aggregateRating: Record<string, unknown> | undefined;
  if (approvedReviews.length > 0) {
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (sum / approvedReviews.length).toFixed(1),
      reviewCount: approvedReviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.name,
    description: t.descriptionShort,
    brand: { "@type": "Brand", name: "Body Good Studio" },
    category: product.category.replace(/_/g, " "),
  };
  if (product.sku) productJsonLd.sku = product.sku;
  if (images.length > 0) productJsonLd.image = images;
  if (offers.length === 1) {
    productJsonLd.offers = offers[0];
  } else if (offers.length > 1) {
    productJsonLd.offers = offers;
  }
  if (aggregateRating) productJsonLd.aggregateRating = aggregateRating;
  // Sanitize the JSON-LD payload — server-built objects only, but escape any stray
  // </script> sequences defensively per Google's structured-data guidance (XSS-safe).
  const productJsonLdHtml = JSON.stringify(productJsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: productJsonLdHtml }}
      />
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
          {(product.fulfillment === "pharmacy_rx" || product.fulfillment === "dual_path") && (
            <GoodRxPriceCheck
              productSlug={product.slug}
              fccMedicationName={product.fccMedicationName}
              locale={locale}
            />
          )}
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
