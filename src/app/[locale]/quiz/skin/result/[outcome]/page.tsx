import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  "anti-aging":        "SK-GLOW",
  "hyperpigmentation": "SK-BRIGHT",
  "hormonal-acne":     "SK-CLEAR",
  "rosacea":           "SK-ROSACEA",
};

export default async function SkinResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  const sku = OUTCOME_TO_SKU[outcome];
  if (!sku) notFound();

  const product = BGS_PRODUCTS[sku];
  if (!product) notFound();

  return <RecommendationConfigurator product={product} locale={locale} />;
}
