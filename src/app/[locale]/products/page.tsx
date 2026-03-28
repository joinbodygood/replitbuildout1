import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { price: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {locale === "es" ? "Todos los Programas" : "All Programs"}
          </h1>
          <p className="text-body-muted text-lg text-center max-w-2xl mx-auto">
            {locale === "es"
              ? "Precios transparentes y todo incluido. Sin cargos ocultos."
              : "Transparent, all-inclusive pricing. No hidden fees."}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const t = product.translations[0];
              if (!t) return null;
              const lowestPrice = product.variants[0]?.price;

              return (
                <Link key={product.id} href={`/${locale}/products/${product.slug}`}>
                  <Card className="h-full cursor-pointer">
                    <Badge variant="pink">
                      {product.category.replace("_", " ").toUpperCase()}
                    </Badge>
                    <h2 className="font-heading text-heading text-xl font-bold mt-3 mb-2">
                      {t.name}
                    </h2>
                    <p className="text-body-muted text-sm mb-4 line-clamp-2">
                      {t.descriptionShort}
                    </p>
                    {lowestPrice && (
                      <p className="font-heading text-heading text-lg font-bold">
                        {locale === "es" ? "Desde" : "From"}{" "}
                        {formatPrice(lowestPrice)}
                        {product.variants[0]?.supplyDuration !== "one-time" && (
                          <span className="text-body-muted text-sm font-normal">
                            /{locale === "es" ? "mes" : "mo"}
                          </span>
                        )}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
