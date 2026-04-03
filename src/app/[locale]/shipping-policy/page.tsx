import { db } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { setRequestLocale } from "next-intl/server";

const SLUG = "shipping-policy";
const DEFAULT_TITLE = "Shipping Policy";
const DEFAULT_CONTENT = `<p>Our Shipping Policy is being updated. Please check back shortly or contact us at <a href="mailto:support@bodygoodstudio.com">support@bodygoodstudio.com</a> for any questions.</p>`;

export default async function ShippingPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await db.legalPage.findUnique({ where: { slug: SLUG } });

  return (
    <section className="py-16">
      <Container narrow>
        <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-2">
          {page?.title ?? DEFAULT_TITLE}
        </h1>
        <p className="text-body-muted text-sm mb-10">
          Last updated: {page ? new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
        </p>
        <div
          className="prose prose-sm max-w-none text-body legal-content"
          dangerouslySetInnerHTML={{ __html: page?.content ?? DEFAULT_CONTENT }}
        />
      </Container>
    </section>
  );
}
