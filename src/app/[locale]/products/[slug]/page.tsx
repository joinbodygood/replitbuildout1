import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  // Group variants by supply duration for the pricing table
  const subscriptionVariants = product.variants.filter(
    (v) => v.supplyDuration !== "one-time"
  );
  const oneTimeVariants = product.variants.filter(
    (v) => v.supplyDuration === "one-time"
  );

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

      {/* Pricing */}
      <section className="py-16">
        <Container narrow>
          {subscriptionVariants.length > 0 && (
            <div className="mb-12">
              <h2 className="font-heading text-heading text-2xl font-bold mb-6 text-center">
                {locale === "es" ? "Elige Tu Plan" : "Choose Your Plan"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {subscriptionVariants.map((v) => {
                  const savings = v.compareAtPrice
                    ? (v.compareAtPrice - v.price) *
                      (v.supplyDuration === "6-month" ? 6 : v.supplyDuration === "3-month" ? 3 : 1)
                    : null;
                  const isBestValue = v.supplyDuration === "6-month";

                  return (
                    <div
                      key={v.id}
                      className={`relative rounded-card p-6 text-center transition-all hover:-translate-y-1 ${
                        isBestValue
                          ? "border-2 border-brand-red shadow-card-hover"
                          : "border border-border shadow-card"
                      }`}
                    >
                      {isBestValue && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge variant="red">
                            {locale === "es" ? "MEJOR VALOR" : "BEST VALUE"}
                          </Badge>
                        </div>
                      )}
                      <p className="text-body-muted text-sm font-medium mb-2 capitalize">
                        {v.supplyDuration?.replace("-", " ")}
                      </p>
                      <p className="font-heading text-heading text-3xl font-bold">
                        {formatPrice(v.price)}
                        <span className="text-body-muted text-base font-normal">
                          /{locale === "es" ? "mes" : "mo"}
                        </span>
                      </p>
                      {savings && savings > 0 && (
                        <p className="text-success text-sm font-semibold mt-2">
                          {locale === "es" ? "Ahorras" : "Save"} {formatPrice(savings)}
                        </p>
                      )}
                      {v.doseLevel && (
                        <p className="text-body-muted text-xs mt-1">{v.doseLevel}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {oneTimeVariants.length > 0 && subscriptionVariants.length === 0 && (
            <div className="text-center mb-12">
              <p className="font-heading text-heading text-4xl font-bold">
                {formatPrice(oneTimeVariants[0].price)}
              </p>
              <p className="text-body-muted mt-2">
                {locale === "es" ? "Pago único" : "One-time payment"}
              </p>
            </div>
          )}

          {/* Description */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="font-heading text-heading text-2xl font-bold mb-4">
              {locale === "es" ? "Detalles del Programa" : "Program Details"}
            </h2>
            <p className="text-body leading-relaxed whitespace-pre-line">
              {t.descriptionLong}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button href={`/${locale}/quiz`} size="lg">
              {locale === "es" ? "Comenzar" : "Get Started"}
            </Button>
            <p className="text-body-muted text-sm mt-3">
              {locale === "es"
                ? "Completa un cuestionario rápido para ver si calificas"
                : "Complete a quick quiz to see if you qualify"}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
