import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { MedicationPickerPage } from "@/components/quiz/MedicationPickerPage";
import { BrandedCashPayPage } from "@/components/quiz/BrandedCashPayPage";
import { OralRecommendationPage } from "@/components/quiz/OralRecommendationPage";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  oral:      "WM-ORAL-SEM",
  insurance: "INS-ELIG",
};

export default async function WeightLossResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  const VALID = ["compounded", "oral", "insurance", "branded", "oral-appetite", "oral-metabolic", "oral-wegovy"];
  if (!VALID.includes(outcome)) notFound();

  // Compounded → show medication picker (Tirzepatide vs Semaglutide)
  if (outcome === "compounded") {
    return <MedicationPickerPage locale={locale} />;
  }

  // Branded (Cash Pay) → show 4-option brand comparison page
  if (outcome === "branded") {
    return <BrandedCashPayPage locale={locale} />;
  }

  // Oral path → show 3-option oral recommendation page
  if (outcome === "oral-appetite" || outcome === "oral-metabolic" || outcome === "oral-wegovy") {
    const recommended = outcome === "oral-appetite" ? "appetite" : outcome === "oral-metabolic" ? "metabolic" : "wegovy";
    return <OralRecommendationPage locale={locale} recommended={recommended as "appetite" | "metabolic" | "wegovy"} />;
  }

  const sku = OUTCOME_TO_SKU[outcome];
  const product = BGS_PRODUCTS[sku];
  if (!product) redirect(`/${locale}/quiz`);

  return <RecommendationConfigurator product={product} locale={locale} />;
}
