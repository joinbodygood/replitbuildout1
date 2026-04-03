import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { setRequestLocale } from "next-intl/server";

const SLUG = "shipping-policy";

export default async function ShippingPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEs = locale === "es";

  const page = await db.legalPage.findUnique({ where: { slug: SLUG } });

  const title   = isEs ? (page?.titleEs   ?? page?.title   ?? "Política de Envíos") : (page?.title   ?? "Shipping Policy");
  const content = isEs ? (page?.contentEs ?? page?.content ?? "") : (page?.content ?? "");
  const updatedLabel = isEs ? "Última actualización:" : "Last updated:";
  const updatedDate  = page ? new Date(page.updatedAt).toLocaleDateString(isEs ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <section className="py-16">
      <Container narrow>
        <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-2">{title}</h1>
        <p className="text-body-muted text-sm mb-10">{updatedLabel} {updatedDate}</p>
        <div className="prose prose-sm max-w-none text-body legal-content" dangerouslySetInnerHTML={{ __html: content }} />
      </Container>
    </section>
  );
}
