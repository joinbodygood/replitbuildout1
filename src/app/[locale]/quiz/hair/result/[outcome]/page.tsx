import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  "women-mild":     "HL-W-MINOX",
  "women-moderate": "HL-W-MINOX",
  "women-max":      "HL-M-MAX",
  "men-basic":      "HL-M-COMBO",
  "men-combo":      "HL-M-COMBO",
  "men-max":        "HL-M-MAX",
};

export default async function HairResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  const sku = OUTCOME_TO_SKU[outcome];
  if (!sku) notFound();

  const product = BGS_PRODUCTS[sku];
  if (!product) redirect(`/${locale}/quiz/hair`);

  return <RecommendationConfigurator product={product} locale={locale} />;
}
