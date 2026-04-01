import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { InfectionPickerPage } from "@/components/quiz/InfectionPickerPage";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  "vaginal-dryness": "FH-VAGDRY",
  "intimacy":        "FH-SCREAM1",
  "prevention":      "FH-SCREAM2",
  "acute-yeast":     "FH-YEAST",
  "acute-bv":        "FH-BV",
};

const VALID = [
  "acute-infection",
  "vaginal-dryness",
  "intimacy",
  "prevention",
  "acute-yeast",
  "acute-bv",
];

export default async function FeminineHealthResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  if (!VALID.includes(outcome)) notFound();

  // Generic infection picker (backward compat / direct navigation)
  if (outcome === "acute-infection") {
    return <InfectionPickerPage locale={locale} />;
  }

  const sku = OUTCOME_TO_SKU[outcome];
  if (!sku) notFound();

  const product = BGS_PRODUCTS[sku];
  if (!product) notFound();

  return <RecommendationConfigurator product={product} locale={locale} />;
}
