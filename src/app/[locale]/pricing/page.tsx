import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { PricingContent } from "./PricingContent";
import { Shield, Check } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const products = await db.product.findMany({
    where: {
      isActive: true,
      category: {
        in: ["compounded", "oral", "branded_rx", "branded_mgmt", "insurance", "wellness-injection", "hair", "skin", "mental-wellness"],
      },
    },
    include: {
      translations: { where: { locale } },
      variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const isEs = locale === "es";

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-[#fdf4f4] to-white pt-14 pb-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#ed1b1b] mb-3">
            {isEs ? "Precios Transparentes" : "Transparent Pricing"}
          </span>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-gray-900 mb-4 leading-tight">
            {isEs
              ? "Lo que ves es lo que pagas."
              : "What you see is what you pay."}
          </h1>
          <p className="text-gray-500 text-lg mb-8">
            {isEs
              ? "Sin cuotas de membresía. Sin cargos sorpresa. Atención médica todo incluido."
              : "No membership fees. No surprise charges. All-inclusive medical care."}
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Check, text: isEs ? "Sin cuota de membresía" : "No membership fee" },
              { icon: Check, text: isEs ? "Consulta médica incluida" : "Physician consult included" },
              { icon: Check, text: isEs ? "Cancela cuando quieras" : "Cancel anytime" },
              { icon: Shield, text: isEs ? "Seguro y confidencial" : "Safe & confidential" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-sm text-gray-700 shadow-xs">
                <Icon size={13} className="text-green-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Insurance check shortcut */}
          <div className="mt-6">
            <Link
              href={`/${locale}/insurance-check`}
              className="text-sm text-gray-500 hover:text-[#ed1b1b] transition-colors"
            >
              {isEs
                ? "¿Tienes seguro? Verifica cobertura de GLP-1 gratis →"
                : "Have insurance? Check your GLP-1 coverage for free →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Tabbed content ── */}
      <PricingContent products={products} locale={locale} />
    </>
  );
}
