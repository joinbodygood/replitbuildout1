import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DualPathCard } from "@/components/quiz/DualPathCard";
import type { PathOption } from "@/components/quiz/DualPathCard";
import { ShieldCheck, Clock, MessageCircle } from "lucide-react";

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

function makePathB(price: string, variantId: string, priceInCents: number): PathOption {
  return {
    price,
    priceNote: "initial consultation + $25/mo ongoing care",
    badge: "Send to My Pharmacy",
    benefits: [
      "Prescription sent electronically to your pharmacy",
      "Generic finasteride or minoxidil — often $5–15/mo with insurance",
      "Monthly check-ins & dose adjustments included",
      "Message your provider anytime",
    ],
    tradeoffs: [
      "Compounded multi-active formulas not available via pharmacy",
      "Insurance prior auth may be required",
    ],
    pharmacyNote:
      "You pay Body Good the consult fee — your pharmacy handles the medication cost. Generic prescriptions are often $5–$15/mo with insurance.",
    cta: "Start Consultation",
    href: "/programs",
    cartData: {
      productId: "hair-pharmacy-consult",
      variantId,
      priceInCents,
      variantLabel: "Initial Consultation",
      slug: "hair-consultation",
    },
  };
}

interface RecommendationConfig {
  productName: string;
  productSubtitle: string;
  recommendation: string;
  pathA: PathOption | null;
  pathB: PathOption | null;
  crossSell?: {
    title: string;
    desc: string;
    price: string;
    href: string;
  };
}

function getConfig(outcome: string, locale: string): RecommendationConfig {
  const base = `/${locale}`;

  const configs: Record<string, RecommendationConfig> = {
    "women-mild": {
      productName: "Hair Restore Starter (Women)",
      productSubtitle: "Oral Minoxidil 2.5mg — the proven first step for early-stage hair loss",
      recommendation:
        "For early thinning and shedding, oral minoxidil is the most effective first step — one pill a day, works systemically.",
      pathA: {
        price: "$39/mo",
        priceNote: "Compounded oral minoxidil, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Compounded oral minoxidil 2.5mg — medical-grade",
          "30-day supply in discreet packaging, shipped free",
          "Provider consultation & treatment plan included",
          "Auto-refill so you never run out",
          "Monthly check-in with your provider",
        ],
        tradeoffs: [
          "Self-pay only — not covered by insurance",
          "Requires a brief medical intake form",
        ],
        cta: "Add to Cart — $39/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-starter-women",
          variantId: "hair-restore-starter-women-1mo",
          priceInCents: 3900,
          variantLabel: "1-Month Supply — Oral Minoxidil 2.5mg",
          slug: "hair-restore-starter-women",
        },
      },
      pathB: makePathB("$49", "hair-consult-women-mild", 4900),
      crossSell: {
        title: "Boost your results: Scalp Peptide Serum",
        desc: "GHK-Cu + Biotin topical foam — pairs with oral minoxidil for 30% faster results.",
        price: "$79/mo",
        href: `${base}/programs`,
      },
    },

    "women-moderate": {
      productName: "Hair Restore Plus (Women)",
      productSubtitle: "Oral Minoxidil 2.5mg + GHK-Cu Peptide Scalp Serum",
      recommendation:
        "For moderate, ongoing hair loss — combining oral minoxidil with a peptide serum gives systemic treatment plus topical growth stimulation.",
      pathA: {
        price: "$79/mo",
        priceNote: "Oral + topical combo, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Oral minoxidil 2.5mg — systemic treatment",
          "GHK-Cu + Biotin peptide scalp serum — topical boost",
          "Both compounded for your exact needs",
          "Provider consultation & treatment plan included",
          "Auto-refill, free discreet shipping",
        ],
        tradeoffs: [
          "Self-pay only — not covered by insurance",
        ],
        cta: "Add to Cart — $79/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-plus-women",
          variantId: "hair-restore-plus-women-1mo",
          priceInCents: 7900,
          variantLabel: "1-Month Supply — Minoxidil + Peptide Serum",
          slug: "hair-restore-plus-women",
        },
      },
      pathB: makePathB("$49", "hair-consult-women-moderate", 4900),
    },

    "women-max": {
      productName: "Hair Restore Max (Women)",
      productSubtitle: "Minoxidil + Finasteride + Latanoprost + Arginine + Melatonin — topical spray",
      recommendation:
        "For significant or postmenopausal hair loss — 5 proven actives in one topical spray. Body Good's most comprehensive women's formula.",
      pathA: {
        price: "$79/mo",
        priceNote: "5-active compounded topical spray, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "5 proven actives in one compounded formula",
          "Minoxidil + Finasteride + Latanoprost + Arginine + Melatonin",
          "Medical-grade — not available at any standard pharmacy",
          "Provider-monitored with dose adjustments",
          "Free shipping, discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — this specific formula is not covered by insurance",
          "Finasteride in this blend: avoid if pregnant or planning pregnancy",
        ],
        cta: "Add to Cart — $79/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-max-women",
          variantId: "hair-restore-max-women-1mo",
          priceInCents: 7900,
          variantLabel: "1-Month Supply — 5-Active Women's Formula",
          slug: "hair-restore-max-women",
        },
      },
      pathB: {
        ...makePathB("$49", "hair-consult-women-max", 4900),
        benefits: [
          "Rx: Finasteride + minoxidil sent to your pharmacy",
          "Insurance may cover finasteride or minoxidil generics",
          "Provider consultation & treatment plan included",
          "Monthly check-ins & dose adjustments",
        ],
        tradeoffs: [
          "5-active compounded formula only available as Ship to Door (Path A)",
          "Individual prescriptions provided — not the combined formula",
        ],
        pharmacyNote:
          "The 5-active formula is only available compounded. Path B provides individual prescriptions (finasteride + minoxidil) that may be covered by insurance.",
      },
    },

    "men-basic": {
      productName: "Hair Restore Rx (Men)",
      productSubtitle: "Oral Finasteride 1mg — the #1 proven treatment for male pattern baldness",
      recommendation:
        "Finasteride blocks DHT — the hormone that shrinks follicles. One pill daily. Most men see results in 3–6 months.",
      pathA: {
        price: "$35/mo",
        priceNote: "Compounded finasteride 1mg, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Finasteride 1mg — one pill daily",
          "30-day supply in discreet packaging",
          "Body Good provider consultation included",
          "Auto-refill, never run out",
          "Monthly check-ins and messaging access",
        ],
        tradeoffs: [
          "Self-pay only — insurance rarely covers compounded Rx",
        ],
        cta: "Add to Cart — $35/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-rx-men",
          variantId: "hair-restore-rx-men-1mo",
          priceInCents: 3500,
          variantLabel: "1-Month Supply — Finasteride 1mg",
          slug: "hair-restore-rx-men",
        },
      },
      pathB: {
        ...makePathB("$49", "hair-consult-men-basic", 4900),
        benefits: [
          "Rx: Finasteride 1mg sent to your pharmacy of choice",
          "Generic finasteride often $5–$15/mo with insurance",
          "Provider consultation included",
          "Monthly dose management & check-ins",
        ],
        tradeoffs: [
          "No compounded multi-active formula — individual Rx only",
        ],
        pharmacyNote:
          "Generic finasteride is one of the most affordable prescriptions — often $5–$15/mo with insurance.",
      },
    },

    "men-combo": {
      productName: "Hair Restore Combo Spray (Men)",
      productSubtitle: "Minoxidil + Finasteride + Arginine + Biotin — one spray, four actives",
      recommendation:
        "For moderate hair loss — combining finasteride (stops DHT) with minoxidil (stimulates regrowth) in one spray delivers significantly better results than either alone.",
      pathA: {
        price: "$59/mo",
        priceNote: "4-active topical spray, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Finasteride + Minoxidil + Arginine + Biotin in one spray",
          "Compounded — not available at any pharmacy",
          "One application daily — no pills needed",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — this specific formula not covered by insurance",
          "Topical finasteride has less systemic absorption (a pro for most)",
        ],
        cta: "Add to Cart — $59/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-combo-men",
          variantId: "hair-restore-combo-men-1mo",
          priceInCents: 5900,
          variantLabel: "1-Month Supply — 4-Active Combo Spray",
          slug: "hair-restore-combo-men",
        },
      },
      pathB: {
        ...makePathB("$49", "hair-consult-men-combo", 4900),
        benefits: [
          "Rx: Oral finasteride + minoxidil 5% foam (OTC)",
          "Insurance covers finasteride prescription for most plans",
          "Minoxidil foam available OTC at any pharmacy",
          "Provider consultation & refill management",
        ],
        tradeoffs: [
          "Arginine + Biotin additives only available in compounded Path A spray",
        ],
      },
    },

    "men-max": {
      productName: "Hair Restore Max (Men)",
      productSubtitle: "Minoxidil + Finasteride + Dutasteride + Caffeine + Azelaic Acid",
      recommendation:
        "For significant or long-standing hair loss — adds dutasteride to block DHT more completely than finasteride alone. Body Good's most powerful men's formula.",
      pathA: {
        price: "$79/mo",
        priceNote: "5-active compounded formula, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Dutasteride blocks 99% of DHT vs 70% for finasteride alone",
          "5 proven actives — all in one medical-grade formula",
          "Not available at any standard pharmacy",
          "Provider-monitored with dose adjustments",
          "Free shipping, discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — this formula not covered by insurance",
          "Avoid if you plan to have children (discuss with provider)",
        ],
        cta: "Add to Cart — $79/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "hair-restore-max-men",
          variantId: "hair-restore-max-men-1mo",
          priceInCents: 7900,
          variantLabel: "1-Month Supply — 5-Active Men's Formula",
          slug: "hair-restore-max-men",
        },
      },
      pathB: {
        ...makePathB("$49", "hair-consult-men-max", 4900),
        benefits: [
          "Rx: Finasteride + Dutasteride sent to your pharmacy",
          "Insurance may cover finasteride (generic ~$10/mo)",
          "Provider consultation & management included",
          "Monthly check-ins & dose adjustments",
        ],
        tradeoffs: [
          "Dutasteride may require prior authorization",
          "5-active compounded formula only available as Path A",
        ],
        pharmacyNote:
          "Dutasteride may require prior authorization. Our team handles this paperwork for you at no extra charge.",
      },
    },
  };

  return configs[outcome] || configs["men-basic"];
}

export default async function HairResultPage({ params }: Props) {
  const { locale, outcome } = await params;
  setRequestLocale(locale);

  if (!VALID_OUTCOMES.includes(outcome)) notFound();

  const config = getConfig(outcome, locale);

  return (
    <>
      <section className="py-12 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="red">YOUR RECOMMENDATION</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-3">
              Here&apos;s What We Recommend For You
            </h1>
            <p className="text-body-muted text-base max-w-lg mx-auto">
              Based on your answers, our providers recommend the following treatment.
              You choose how you&apos;d like to receive it.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container narrow>
          <DualPathCard {...config} locale={locale} />
        </Container>
      </section>

      <section className="py-10 bg-surface-dim">
        <Container narrow>
          <h2 className="font-heading text-heading text-xl font-bold text-center mb-6">
            What happens after you get started?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: <ShieldCheck size={22} className="text-brand-red" />,
                title: "Provider Review",
                desc: "A licensed provider reviews your intake form and approves your treatment — typically within 24 hours.",
              },
              {
                icon: <Clock size={22} className="text-brand-red" />,
                title: "Treatment Begins",
                desc: "Ship to Door: Your formula ships directly. Send to Pharmacy: Your Rx is sent electronically.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Ongoing Support",
                desc: "Monthly check-ins, dose adjustments, and direct messaging with your provider — all included.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-heading text-heading font-semibold mb-1">{item.title}</h3>
                <p className="text-body-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container narrow>
          <div className="text-center">
            <p className="text-body-muted text-sm mb-4">Not sure which path is right for you?</p>
            <Button href={`/${locale}/programs`} variant="secondary" size="md">
              Explore All Programs
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
