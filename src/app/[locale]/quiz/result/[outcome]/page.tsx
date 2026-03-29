import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";
import { MedicationPickerPage } from "@/components/quiz/MedicationPickerPage";
import { BGS_PRODUCTS } from "@/lib/bgs-products";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const OUTCOME_TO_SKU: Record<string, string> = {
  oral:      "WM-ORAL-SEM",
  insurance: "INS-ELIG",
  branded:   "WM-BRAND-MGMT",
};

export default async function WeightLossResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  const VALID = ["compounded", "oral", "insurance", "branded"];
  if (!VALID.includes(outcome)) notFound();

  // Compounded → show medication picker (Tirzepatide vs Semaglutide)
  if (outcome === "compounded") {
    return <MedicationPickerPage locale={locale} />;
  }

  const sku = OUTCOME_TO_SKU[outcome];
  const product = BGS_PRODUCTS[sku];
  if (!product) redirect(`/${locale}/quiz`);

  return <RecommendationConfigurator product={product} locale={locale} />;
}
