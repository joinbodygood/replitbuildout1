import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BGS_PRODUCTS } from "@/lib/bgs-products";
import { RecommendationConfigurator } from "@/components/quiz/RecommendationConfigurator";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sku?: string }>;
};

export default async function RecommendationPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sku } = await searchParams;
  setRequestLocale(locale);

  if (!sku) redirect(`/${locale}/quiz`);

  const product = BGS_PRODUCTS[sku];
  if (!product) redirect(`/${locale}/quiz`);

  return <RecommendationConfigurator product={product} locale={locale} />;
}
