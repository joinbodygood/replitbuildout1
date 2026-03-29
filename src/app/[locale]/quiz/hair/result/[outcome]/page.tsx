import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SplitRecommendationPage } from "@/components/quiz/SplitRecommendationPage";
import type { SplitRecoConfig } from "@/components/quiz/SplitRecommendationPage";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const VALID_OUTCOMES = [
  "women-mild",
  "women-moderate",
  "women-max",
  "men-basic",
  "men-combo",
  "men-max",
];

function getConfig(outcome: string): SplitRecoConfig {
  const configs: Record<string, SplitRecoConfig> = {
    "women-mild": {
      productName: "Oral Minoxidil 2.5mg",
      productSubtitle: "Oral tablet — 30-day supply",
      bestFor: "thinning hair & early-stage hair loss",
      recommendation:
        "For early thinning and shedding, oral minoxidil is the most effective first step — one pill a day, works systemically.",
      shipToMePrice: 3900,
      shipToMePriceLabel: "$39",
      goodrxSlug: "minoxidil",
      shipCartData: {
        productId: "hair-restore-starter-women",
        variantId: "hair-restore-starter-women-1mo",
        priceInCents: 3900,
        variantLabel: "1-Month Supply — Oral Minoxidil 2.5mg",
        slug: "hair-restore-starter-women",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-women-mild",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },

    "women-moderate": {
      productName: "Minoxidil + Peptide Serum Combo",
      productSubtitle: "Oral Minoxidil 2.5mg + GHK-Cu Scalp Serum",
      bestFor: "moderate, ongoing hair loss",
      recommendation:
        "Combining oral minoxidil with a peptide serum gives systemic treatment plus topical growth stimulation.",
      shipToMePrice: 7900,
      shipToMePriceLabel: "$79",
      goodrxSlug: "minoxidil",
      shipCartData: {
        productId: "hair-restore-plus-women",
        variantId: "hair-restore-plus-women-1mo",
        priceInCents: 7900,
        variantLabel: "1-Month Supply — Minoxidil + Peptide Serum",
        slug: "hair-restore-plus-women",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-women-moderate",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },

    "women-max": {
      productName: "5-Active Women's Formula",
      productSubtitle:
        "Minoxidil + Finasteride + Latanoprost + Arginine + Melatonin — topical spray",
      bestFor: "significant or postmenopausal hair loss",
      recommendation:
        "5 proven actives in one topical spray — Body Good's most comprehensive women's formula.",
      shipToMePrice: 7900,
      shipToMePriceLabel: "$79",
      goodrxSlug: "finasteride",
      shipCartData: {
        productId: "hair-restore-max-women",
        variantId: "hair-restore-max-women-1mo",
        priceInCents: 7900,
        variantLabel: "1-Month Supply — 5-Active Women's Formula",
        slug: "hair-restore-max-women",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-women-max",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },

    "men-basic": {
      productName: "Finasteride 1mg",
      productSubtitle: "Oral tablet — 30-day supply",
      bestFor: "pattern hair loss & receding hairline",
      recommendation:
        "Finasteride blocks DHT — the hormone that shrinks follicles. One pill daily. Most men see results in 3–6 months.",
      shipToMePrice: 3500,
      shipToMePriceLabel: "$35",
      goodrxSlug: "finasteride",
      shipCartData: {
        productId: "hair-restore-rx-men",
        variantId: "hair-restore-rx-men-1mo",
        priceInCents: 3500,
        variantLabel: "1-Month Supply — Finasteride 1mg",
        slug: "hair-restore-rx-men",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-men-basic",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },

    "men-combo": {
      productName: "4-Active Combo Spray",
      productSubtitle:
        "Minoxidil + Finasteride + Arginine + Biotin — topical spray",
      bestFor: "moderate hair loss & thinning temples",
      recommendation:
        "Combining finasteride (stops DHT) with minoxidil (stimulates regrowth) delivers significantly better results than either alone.",
      shipToMePrice: 5900,
      shipToMePriceLabel: "$59",
      goodrxSlug: "finasteride",
      shipCartData: {
        productId: "hair-restore-combo-men",
        variantId: "hair-restore-combo-men-1mo",
        priceInCents: 5900,
        variantLabel: "1-Month Supply — 4-Active Combo Spray",
        slug: "hair-restore-combo-men",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-men-combo",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },

    "men-max": {
      productName: "5-Active Men's Formula",
      productSubtitle:
        "Minoxidil + Finasteride + Dutasteride + Caffeine + Azelaic Acid",
      bestFor: "significant or long-standing hair loss",
      recommendation:
        "Adds dutasteride to block DHT more completely than finasteride alone — Body Good's most powerful men's formula.",
      shipToMePrice: 7900,
      shipToMePriceLabel: "$79",
      goodrxSlug: "dutasteride",
      shipCartData: {
        productId: "hair-restore-max-men",
        variantId: "hair-restore-max-men-1mo",
        priceInCents: 7900,
        variantLabel: "1-Month Supply — 5-Active Men's Formula",
        slug: "hair-restore-max-men",
      },
      pharmacyCartData: {
        productId: "hair-pharmacy-consult",
        variantId: "hair-consult-men-max",
        priceInCents: 4900,
        variantLabel: "Doctor Consultation + E-Prescription",
        slug: "hair-consultation",
      },
    },
  };

  return configs[outcome] ?? configs["men-basic"];
}

export default async function HairResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  if (!VALID_OUTCOMES.includes(outcome)) notFound();

  const config = getConfig(outcome);

  return <SplitRecommendationPage config={config} locale={locale} />;
}
