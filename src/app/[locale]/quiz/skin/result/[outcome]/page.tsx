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
  "anti-aging",
  "hyperpigmentation",
  "hormonal-acne",
  "rosacea",
];

const PATH_B_SKIN: PathOption = {
  price: "$49",
  priceNote: "initial consultation + $25/mo ongoing care",
  badge: "Send to My Pharmacy",
  benefits: [
    "Prescription sent electronically to your pharmacy",
    "Use your health insurance at the pharmacy",
    "Tretinoin, hydroquinone, or other Rx creams covered by most plans",
    "Monthly check-ins & formula adjustments included",
    "Message your provider anytime",
  ],
  pharmacyNote:
    "Generic tretinoin is often $10–$20/mo with insurance. You pay Body Good the $49 consult fee — your pharmacy handles the medication.",
  cta: "Start Consultation →",
  href: "/programs",
};

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
    "anti-aging": {
      productName: "Glow Cream",
      productSubtitle:
        "Azelaic Acid 8% + Tretinoin 0.1% + Niacinamide 15% — all in one cream",
      recommendation:
        "Our Glow Cream combines three of the most evidence-backed anti-aging ingredients in one medical-grade formula. Tretinoin speeds cell turnover, azelaic acid brightens and smooths, and niacinamide reduces redness and pore size. Expect noticeably smoother, brighter skin in 8–12 weeks.",
      pathA: {
        price: "$69/mo",
        priceNote: "Custom compounded cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Three actives in one cream — tretinoin 0.1%, azelaic acid 8%, niacinamide 15%",
          "Higher concentrations than most pharmacy alternatives",
          "Compounded to your exact skin type and tolerance",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_SKIN,
        benefits: [
          "Rx: Tretinoin 0.025%–0.1% sent to your pharmacy",
          "Tretinoin often $10–$20/mo with insurance",
          "Provider consultation & monitoring included",
          "Gradual dosing to minimize irritation",
          "Monthly check-ins & formula adjustments",
        ],
        pharmacyNote:
          "Pharmacy tretinoin is a single ingredient — our compounded Glow Cream adds azelaic acid and niacinamide for faster, more complete results.",
      },
    },

    "hyperpigmentation": {
      productName: "Bright Cream",
      productSubtitle:
        "Hydroquinone 8% + Tretinoin 0.1% + Azelaic Acid 15% + Kojic Acid + Hydrocortisone",
      recommendation:
        "For melasma, dark spots, and uneven skin tone — especially for women with deeper skin tones — our Bright Cream is the most powerful formula available. It contains 8% hydroquinone, double the standard pharmacy strength, plus four additional brightening agents. Results in 8–12 weeks.",
      pathA: {
        price: "$89/mo",
        priceNote: "5-active brightening cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "8% hydroquinone — DOUBLE standard pharmacy strength",
          "5 brightening actives in one compounded formula",
          "Tretinoin for cell turnover, kojic acid for pigment blocking",
          "Provider-monitored — dose adjusted every 8 weeks",
          "Free shipping in discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_SKIN,
        benefits: [
          "Rx: Hydroquinone 4% + Tretinoin sent to your pharmacy",
          "Insurance often covers hydroquinone prescriptions",
          "Standard pharmacy strength — effective for mild cases",
          "Provider consultation & monitoring included",
          "Monthly check-ins & formula adjustments",
        ],
        pharmacyNote:
          "Our compounded formula has 8% hydroquinone — double the pharmacy standard. If your dark spots are significant, Path A delivers measurably better results.",
      },
      crossSell: {
        title: "Also considering: Even Tone Cream",
        desc: "For sensitive skin or as a maintenance formula — hydroquinone-free brightening.",
        price: "$85/mo",
        href: `${base}/programs`,
      },
    },

    "hormonal-acne": {
      productName: "Clear Skin Combo",
      productSubtitle:
        "Azelaic Acid + Tretinoin + Niacinamide cream — plus spironolactone for hormonal control",
      recommendation:
        "Hormonal acne requires a two-pronged approach: a topical formula to treat existing breakouts and redness, plus a systemic medication to control the hormonal trigger. Our cream addresses the skin surface while spironolactone (Path B) balances the androgen hormones driving your breakouts.",
      pathA: {
        price: "$69/mo",
        priceNote: "Compounded acne cream, shipped free",
        badge: "Ship to My Door (Topical)",
        benefits: [
          "Azelaic acid + tretinoin + niacinamide in one cream",
          "Targets active breakouts and prevents new ones",
          "Reduces post-acne redness and scarring",
          "Provider consultation & treatment plan included",
          "Add Path B for complete hormonal control",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        price: "$49",
        priceNote: "consult + $25/mo — spironolactone to your pharmacy",
        badge: "Add Hormonal Control",
        benefits: [
          "Rx: Spironolactone 50–100mg sent to your pharmacy",
          "Insurance often covers spironolactone (generic ~$10/mo)",
          "Blocks androgen hormones that cause hormonal acne",
          "Most effective when combined with the topical cream",
          "Monthly check-ins & dose adjustments included",
        ],
        pharmacyNote:
          "Spironolactone is most effective when combined with a topical formula. Many patients use both Path A (cream) and Path B (spiro) for complete hormonal acne control.",
        cta: "Add Hormonal Control →",
        href: `${base}/programs`,
      },
    },

    "rosacea": {
      productName: "Rosacea Calm Cream",
      productSubtitle: "Niacinamide 4% + Metronidazole 1% — gentle, anti-inflammatory formula",
      recommendation:
        "Rosacea and chronic redness need anti-inflammatory treatment, not harsh actives. Our Rosacea Calm Cream uses metronidazole (the gold standard for rosacea) plus niacinamide to reduce redness, soothe irritated skin, and strengthen your skin barrier.",
      pathA: {
        price: "$55/mo",
        priceNote: "Gentle compounded cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Metronidazole 1% — gold standard for rosacea",
          "Niacinamide 4% for barrier strengthening & redness",
          "Gentle formula — safe for very sensitive skin",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_SKIN,
        benefits: [
          "Rx: Metronidazole gel 0.75% or 1% sent to your pharmacy",
          "Insurance often covers metronidazole prescriptions",
          "Standard pharmacy formula — effective first-line treatment",
          "Provider consultation & monitoring included",
          "Monthly check-ins & formula adjustments",
        ],
        pharmacyNote:
          "Our compounded cream adds niacinamide for barrier support. Both options use the same evidence-based metronidazole.",
      },
    },
  };

  return configs[outcome] || configs["anti-aging"];
}

export default async function SkinResultPage({ params }: Props) {
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
              Here&apos;s Your Personalized Skincare Formula
            </h1>
            <p className="text-body-muted text-base max-w-lg mx-auto">
              Based on your skin concerns, our providers recommend the following. Choose how you&apos;d like to receive your treatment.
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
                desc: "A licensed provider reviews your skin concerns and intake form — approved within 24 hours.",
              },
              {
                icon: <Clock size={22} className="text-brand-red" />,
                title: "Treatment Ships or Sends",
                desc: "Path A: Your formula ships in 3–5 days. Path B: Rx sent electronically to your pharmacy same day.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Skin Check-ins",
                desc: "Monthly check-ins included. Your provider adjusts your formula as your skin responds and improves.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 text-center">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-heading text-heading font-semibold mb-1">
                  {item.title}
                </h3>
                <p className="text-body-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container narrow>
          <div className="text-center">
            <p className="text-body-muted text-sm mb-4">
              Not sure which path is right for you?
            </p>
            <Button href={`/${locale}/programs`} variant="secondary" size="md">
              Explore All Programs
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
