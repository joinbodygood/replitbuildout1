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

const VALID_OUTCOMES = ["anti-aging", "hyperpigmentation", "hormonal-acne", "rosacea"];

function makePathBSkin(variantId: string, priceInCents = 4900): PathOption {
  return {
    price: "$49",
    priceNote: "initial consultation + $25/mo ongoing care",
    badge: "Send to My Pharmacy",
    benefits: [
      "Prescription sent electronically to your pharmacy",
      "Tretinoin, hydroquinone, or Rx creams — often covered by insurance",
      "Monthly check-ins & formula adjustments included",
      "Message your provider anytime",
    ],
    tradeoffs: [
      "Single-ingredient only — no multi-active compounded blends",
      "Lower concentrations than compounded formulas",
    ],
    pharmacyNote:
      "Generic tretinoin is often $10–$20/mo with insurance. You pay Body Good the $49 consult — your pharmacy handles the medication.",
    cta: "Start Consultation",
    href: "/programs",
    cartData: {
      productId: "skin-pharmacy-consult",
      variantId,
      priceInCents,
      variantLabel: "Initial Consultation",
      slug: "skin-consultation",
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
    "anti-aging": {
      productName: "Glow Cream",
      productSubtitle: "Tretinoin 0.1% + Azelaic Acid 8% + Niacinamide 15% — all in one",
      recommendation:
        "Tretinoin speeds cell turnover, azelaic acid brightens and smooths, and niacinamide reduces redness and pore size — in one medical-grade formula.",
      pathA: {
        price: "$69/mo",
        priceNote: "Custom compounded cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "3 actives in one — Tretinoin 0.1%, Azelaic Acid 8%, Niacinamide 15%",
          "Higher concentrations than most pharmacy alternatives",
          "Compounded for your skin type and tolerance",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — not covered by insurance",
          "Retinoid purge possible in weeks 2–4 (normal, temporary)",
        ],
        cta: "Add to Cart — $69/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "skin-glow-cream",
          variantId: "skin-glow-cream-1mo",
          priceInCents: 6900,
          variantLabel: "1-Month Supply — Glow Cream",
          slug: "skin-glow-cream",
        },
      },
      pathB: {
        ...makePathBSkin("skin-consult-anti-aging"),
        benefits: [
          "Rx: Tretinoin 0.025%–0.1% sent to your pharmacy",
          "Tretinoin often $10–$20/mo with insurance",
          "Provider consultation & monitoring included",
          "Gradual dosing to minimize irritation",
          "Monthly check-ins & formula adjustments",
        ],
        tradeoffs: [
          "Pharmacy tretinoin is a single ingredient — no azelaic acid or niacinamide",
          "Lower concentration options may be less effective for significant aging",
        ],
        pharmacyNote:
          "Pharmacy tretinoin works well for mild aging concerns. Our Glow Cream adds azelaic acid + niacinamide for faster, more complete results.",
      },
    },

    "hyperpigmentation": {
      productName: "Bright Cream",
      productSubtitle: "Hydroquinone 8% + Tretinoin + Azelaic Acid 15% + Kojic Acid + Hydrocortisone",
      recommendation:
        "For melasma, dark spots, and uneven skin tone — 8% hydroquinone (double pharmacy strength) plus four additional brightening agents.",
      pathA: {
        price: "$89/mo",
        priceNote: "5-active brightening cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "8% hydroquinone — DOUBLE standard pharmacy strength",
          "5 brightening actives in one compounded formula",
          "Tretinoin + kojic acid + hydrocortisone for complete coverage",
          "Provider-monitored — dose adjusted every 8 weeks",
          "Free shipping in discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — not typically covered by insurance",
          "Should not be used long-term without breaks (provider monitors this)",
        ],
        cta: "Add to Cart — $89/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "skin-bright-cream",
          variantId: "skin-bright-cream-1mo",
          priceInCents: 8900,
          variantLabel: "1-Month Supply — Bright Cream",
          slug: "skin-bright-cream",
        },
      },
      pathB: {
        ...makePathBSkin("skin-consult-hyperpigmentation"),
        benefits: [
          "Rx: Hydroquinone 4% + Tretinoin sent to your pharmacy",
          "Insurance often covers hydroquinone prescriptions",
          "Standard pharmacy strength — effective for mild cases",
          "Provider consultation & monitoring included",
          "Monthly check-ins & formula adjustments",
        ],
        tradeoffs: [
          "4% hydroquinone — half the strength of our Bright Cream",
          "Individual ingredients only — no combined compounded formula",
        ],
        pharmacyNote:
          "Our compounded formula has 8% hydroquinone — double the pharmacy standard. For significant dark spots, Path A delivers measurably better results.",
      },
      crossSell: {
        title: "Sensitive skin alternative: Even Tone Cream",
        desc: "Hydroquinone-free brightening — for maintenance or reactive skin.",
        price: "$85/mo",
        href: `${base}/programs`,
      },
    },

    "hormonal-acne": {
      productName: "Clear Skin Combo",
      productSubtitle: "Topical: Azelaic Acid + Tretinoin + Niacinamide · Hormonal: Spironolactone",
      recommendation:
        "Hormonal acne needs two things: a topical formula to treat breakouts + a systemic med to stop the hormonal trigger. Choose the topical, the hormonal control, or both.",
      pathA: {
        price: "$69/mo",
        priceNote: "Compounded acne cream, shipped free",
        badge: "Ship to My Door (Topical)",
        benefits: [
          "Azelaic acid + tretinoin + niacinamide in one cream",
          "Targets active breakouts and prevents new ones",
          "Reduces post-acne redness and scarring",
          "Provider consultation & treatment plan included",
          "Best when combined with hormonal control (Path B)",
        ],
        tradeoffs: [
          "Self-pay — not covered by insurance",
          "Topical only — doesn't address hormonal root cause",
        ],
        cta: "Add to Cart — $69/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "skin-clear-cream",
          variantId: "skin-clear-cream-1mo",
          priceInCents: 6900,
          variantLabel: "1-Month Supply — Clear Skin Cream",
          slug: "skin-clear-cream",
        },
      },
      pathB: {
        price: "$49",
        priceNote: "consult + $25/mo — spironolactone to your pharmacy",
        badge: "Add Hormonal Control",
        benefits: [
          "Rx: Spironolactone 50–100mg sent to your pharmacy",
          "Insurance often covers spironolactone (generic ~$10/mo)",
          "Blocks androgen hormones that trigger hormonal acne",
          "Monthly check-ins & dose adjustments included",
          "Most effective when combined with the topical cream (Path A)",
        ],
        tradeoffs: [
          "Takes 2–3 months to see full hormonal effect",
          "Not suitable during pregnancy",
        ],
        pharmacyNote:
          "Spironolactone works best alongside a topical formula. Many patients use both Path A (cream) + Path B (spiro) for complete control.",
        cta: "Start Hormonal Control",
        href: `${base}/programs`,
        cartData: {
          productId: "skin-pharmacy-consult",
          variantId: "skin-consult-hormonal-acne",
          priceInCents: 4900,
          variantLabel: "Hormonal Control Consultation",
          slug: "skin-consultation",
        },
      },
    },

    "rosacea": {
      productName: "Rosacea Calm Cream",
      productSubtitle: "Metronidazole 1% + Niacinamide 4% — gentle, anti-inflammatory formula",
      recommendation:
        "Rosacea needs anti-inflammatory treatment, not harsh actives. Metronidazole (the gold standard) plus niacinamide to reduce redness and strengthen your skin barrier.",
      pathA: {
        price: "$55/mo",
        priceNote: "Gentle compounded cream, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Metronidazole 1% — gold standard for rosacea",
          "Niacinamide 4% for barrier support & redness reduction",
          "Formulated for very sensitive, reactive skin",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        tradeoffs: [
          "Self-pay — insurance doesn't typically cover compounded creams",
        ],
        cta: "Add to Cart — $55/mo",
        href: `${base}/programs`,
        cartData: {
          productId: "skin-rosacea-cream",
          variantId: "skin-rosacea-cream-1mo",
          priceInCents: 5500,
          variantLabel: "1-Month Supply — Rosacea Calm Cream",
          slug: "skin-rosacea-cream",
        },
      },
      pathB: {
        ...makePathBSkin("skin-consult-rosacea"),
        benefits: [
          "Rx: Metronidazole gel 0.75% or 1% sent to your pharmacy",
          "Insurance often covers metronidazole prescriptions",
          "Standard pharmacy formula — effective first-line treatment",
          "Provider consultation & monitoring included",
          "Monthly check-ins & adjustments",
        ],
        tradeoffs: [
          "Pharmacy metronidazole only — no niacinamide barrier support",
        ],
        pharmacyNote:
          "Both options use metronidazole. Our compounded cream adds niacinamide — better for patients with significant redness or sensitive barrier.",
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
              Based on your skin concerns, our providers recommend the following.
              You choose how you&apos;d like to receive your treatment.
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
                desc: "Ship to Door: Your formula ships in 3–5 days. Send to Pharmacy: Rx sent electronically same day.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Skin Check-ins",
                desc: "Monthly check-ins included. Your provider adjusts your formula as your skin responds.",
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
            <p className="text-body-muted text-sm mb-4">Want to explore other options?</p>
            <Button href={`/${locale}/programs`} variant="secondary" size="md">
              Explore All Programs
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
