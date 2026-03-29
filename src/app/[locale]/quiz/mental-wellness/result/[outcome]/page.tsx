import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  "anxiety":     "MW-ANXIETY",
  "performance": "MW-STAGE",
  "sleep":       "MW-SLEEP",
  "depression":  "MW-LIFT-SSRI",
  "motivation":  "MW-MOMENTUM",
  "assessment":  "MW-ANXIETY",
};

export default async function MentalWellnessResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  const VALID = ["anxiety", "performance", "sleep", "depression", "motivation", "assessment"];
  if (!VALID.includes(outcome)) notFound();

  const sku = OUTCOME_TO_SKU[outcome];
  const product = BGS_PRODUCTS[sku];
  if (!product) notFound();

  return <RecommendationConfigurator product={product} locale={locale} />;
}
