import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  // Group by category for display
  const compounded = products.filter((p) => p.category === "compounded");
  const oral = products.filter((p) => p.category === "oral");
  const brandedRx = products.filter((p) => p.category === "branded_rx");
  const brandedMgmt = products.filter((p) => p.category === "branded_mgmt");
  const insurance = products.filter((p) => p.category === "insurance");

  type ProductGroup = {
    title: string;
    products: typeof products;
  };

  const groups: ProductGroup[] = [
    { title: locale === "es" ? "GLP-1 Compuestos (Autofinanciado)" : "Compounded GLP-1 (Self-Pay)", products: compounded },
    { title: locale === "es" ? "GLP-1 Oral (Sin Agujas)" : "Oral GLP-1 (No Needles)", products: oral },
    { title: locale === "es" ? "Receta GLP-1 de Marca" : "Branded GLP-1 Prescription", products: brandedRx },
    { title: locale === "es" ? "Manejo de Rx de Marca" : "Branded Rx Management", products: brandedMgmt },
    { title: locale === "es" ? "Programa de Seguro" : "Insurance Program", products: insurance },
  ];

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container>
          <h1 className="font-heading text-heading text-4xl font-bold text-center mb-4">
            {locale === "es" ? "Precios Transparentes" : "Transparent Pricing"}
          </h1>
          <p className="text-body-muted text-lg text-center max-w-2xl mx-auto">
            {locale === "es"
              ? "Lo que ves es lo que pagas. Sin cuotas de membres\u00eda. Sin cargos sorpresa. Todo incluido."
              : "What you see is what you pay. No membership fees. No surprise charges. All-inclusive."}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          {groups.map((group) => {
            if (group.products.length === 0) return null;
            return (
              <div key={group.title} className="mb-16 last:mb-0">
                <h2 className="font-heading text-heading text-2xl font-bold mb-6">
                  {group.title}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-3 px-4 font-heading text-heading text-sm">
                          {locale === "es" ? "Programa" : "Program"}
                        </th>
                        <th className="text-center py-3 px-4 font-heading text-heading text-sm">
                          {locale === "es" ? "\u00danico / 1 Mes" : "One-Time / 1-Mo"}
                        </th>
                        <th className="text-center py-3 px-4 font-heading text-heading text-sm">
                          {locale === "es" ? "3 Meses" : "3-Month"}
                        </th>
                        <th className="text-center py-3 px-4 font-heading text-heading text-sm">
                          {locale === "es" ? "6 Meses" : "6-Month"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.products.map((product) => {
                        const t = product.translations[0];
                        if (!t) return null;

                        const getVariantPrice = (duration: string) => {
                          const v = product.variants.find(
                            (v) => v.supplyDuration === duration
                          );
                          return v ? formatPrice(v.price) : null;
                        };

                        const oneTimeOrMonthly =
                          getVariantPrice("one-time") || getVariantPrice("1-month");
                        const threeMonth = getVariantPrice("3-month");
                        const sixMonth = getVariantPrice("6-month");

                        return (
                          <tr
                            key={product.id}
                            className="border-b border-border-light hover:bg-surface-dim transition-colors"
                          >
                            <td className="py-4 px-4">
                              <p className="font-heading font-semibold text-heading">
                                {t.name}
                              </p>
                              <p className="text-body-muted text-sm mt-0.5">
                                {t.descriptionShort}
                              </p>
                            </td>
                            <td className="py-4 px-4 text-center">
                              {oneTimeOrMonthly ? (
                                <span className="font-heading font-bold text-heading">
                                  {oneTimeOrMonthly}
                                  {getVariantPrice("1-month") && (
                                    <span className="text-body-muted text-sm font-normal">
                                      /{locale === "es" ? "mes" : "mo"}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-body-muted">&mdash;</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {threeMonth ? (
                                <span className="font-heading font-bold text-heading">
                                  {threeMonth}
                                  <span className="text-body-muted text-sm font-normal">
                                    /{locale === "es" ? "mes" : "mo"}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-body-muted">&mdash;</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {sixMonth ? (
                                <div>
                                  <span className="font-heading font-bold text-heading">
                                    {sixMonth}
                                    <span className="text-body-muted text-sm font-normal">
                                      /{locale === "es" ? "mes" : "mo"}
                                    </span>
                                  </span>
                                  {product.variants.find((v) => v.supplyDuration === "6-month")
                                    ?.compareAtPrice && (
                                    <p className="text-success text-xs font-semibold">
                                      {locale === "es" ? "Mejor precio" : "Best price"}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-body-muted">&mdash;</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <div className="text-center mt-12 p-8 bg-brand-pink-soft rounded-card">
            <p className="font-heading text-heading text-xl font-bold mb-2">
              {locale === "es" ? "\u00bfNo est\u00e1s segura cu\u00e1l es la mejor opci\u00f3n?" : "Not sure which option is right for you?"}
            </p>
            <p className="text-body-muted mb-6">
              {locale === "es"
                ? "Nuestro cuestionario te ayudar\u00e1 a encontrar el programa perfecto."
                : "Our quiz will help you find the perfect program."}
            </p>
            <Button href={`/${locale}/quiz`} size="lg">
              {locale === "es" ? "Toma el Cuestionario" : "Take the Quiz"}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
