import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MentalWellnessResultPage } from "@/components/quiz/MentalWellnessResultPage";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
  searchParams: Promise<{
    concern?: string;
    severity?: string;
    duration?: string;
    flagged?: string;
  }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  anxiety:     "MW-ANXIETY",
  performance: "MW-STAGE",
  sleep:       "MW-SLEEP",
  depression:  "MW-LIFT-SSRI",
  motivation:  "MW-MOMENTUM",
  assessment:  "MW-ANXIETY",
};

const VALID = Object.keys(OUTCOME_TO_SKU);

export default async function MentalWellnessResultRoute({ params, searchParams }: Props) {
  const { locale, outcome } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  if (!VALID.includes(outcome)) notFound();

  const sku = OUTCOME_TO_SKU[outcome];
  const product = BGS_PRODUCTS[sku];
  if (!product) notFound();

  return (
    <MentalWellnessResultPage
      product={product}
      locale={locale}
      outcome={outcome}
      concern={sp.concern}
      severity={sp.severity}
      duration={sp.duration}
      flagged={sp.flagged === "1"}
    />
  );
}
