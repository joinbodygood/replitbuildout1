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

const PATH_B_HAIR: PathOption = {
  price: "$49",
  priceNote: "initial consultation + $25/mo ongoing care",
  badge: "Send to My Pharmacy",
  benefits: [
    "Prescription sent electronically to your pharmacy",
    "Use your health insurance at checkout",
    "Generic finasteride or minoxidil covered by most plans",
    "Monthly check-ins & dose adjustments included",
    "Message your provider anytime",
  ],
  pharmacyNote:
    "Generic prescriptions are often $5–$15/mo at the pharmacy with insurance. You pay Body Good the $49 consult fee — your pharmacy handles the medication.",
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
    "women-mild": {
      productName: "Hair Restore Starter (Women)",
      productSubtitle: "Oral Minoxidil 2.5mg — the gold standard for early-stage hair loss",
      recommendation:
        "For early thinning and shedding, oral minoxidil is the most effective first step. It's simple (one pill a day), works systemically, and most women see noticeable results within 3–6 months.",
      pathA: {
        price: "$39/mo",
        priceNote: "Compounded oral minoxidil, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Compounded oral minoxidil 2.5mg — medical-grade",
          "30-day supply shipped in discreet packaging",
          "Provider consultation & treatment plan included",
          "Auto-refill so you never run out",
          "Monthly check-in with your provider",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: PATH_B_HAIR,
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
        "For moderate, ongoing hair loss, combining oral minoxidil with a peptide scalp serum gives you a two-pronged approach — systemic treatment plus topical growth stimulation. Clinically proven to slow shedding and promote regrowth in 3–6 months.",
      pathA: {
        price: "$79/mo",
        priceNote: "Oral + topical combo, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Oral minoxidil 2.5mg (systemic treatment)",
          "GHK-Cu + Biotin peptide scalp serum (topical boost)",
          "Both compounded for your exact needs",
          "Provider consultation & treatment plan included",
          "Auto-refill, free discreet shipping",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: PATH_B_HAIR,
    },

    "women-max": {
      productName: "Hair Restore Max (Women)",
      productSubtitle:
        "Minoxidil + Finasteride + Latanoprost + Arginine + Melatonin — topical formula",
      recommendation:
        "For significant or long-standing hair loss — especially postmenopausal or hormone-related — our most powerful women's formula combines 5 proven actives in one topical spray. This is Body Good's most comprehensive hair restoration option.",
      pathA: {
        price: "$79/mo",
        priceNote: "5-active compounded topical spray, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "5 proven actives in one compounded formula",
          "Minoxidil + Finasteride + Latanoprost + Arginine + Melatonin",
          "Medical-grade — not available at any pharmacy",
          "Provider-monitored treatment with dose adjustments",
          "Free shipping, discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_HAIR,
        benefits: [
          "Rx: Finasteride + minoxidil sent to your pharmacy",
          "Use your health insurance for the medication",
          "Provider consultation & treatment plan included",
          "Monthly check-ins & dose adjustments",
          "Message your provider anytime",
        ],
        pharmacyNote:
          "The compounded 5-active formula is only available as Path A. Path B provides individual prescriptions (finasteride + minoxidil) that can be covered by insurance.",
      },
    },

    "men-basic": {
      productName: "Hair Restore Rx (Men)",
      productSubtitle: "Oral Finasteride 1mg — the proven first line for male pattern baldness",
      recommendation:
        "Finasteride is the most effective medication for male pattern baldness. It works by blocking DHT — the hormone responsible for shrinking hair follicles. One small pill daily. Most men see results in 3–6 months.",
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
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_HAIR,
        benefits: [
          "Rx: Finasteride 1mg sent to your pharmacy",
          "Generic finasteride often $10–$15/mo with insurance",
          "Provider consultation included",
          "Monthly dose management & check-ins",
          "Message your provider anytime",
        ],
        pharmacyNote:
          "Generic finasteride is one of the most affordable prescriptions at a pharmacy. With insurance, it's often $5–$15/mo.",
      },
    },

    "men-combo": {
      productName: "Hair Restore Combo Spray (Men)",
      productSubtitle:
        "Minoxidil + Finasteride + Arginine + Biotin — one spray, four actives",
      recommendation:
        "For moderate hair loss, combining finasteride (stops DHT) with minoxidil (stimulates regrowth) in one topical spray delivers significantly better results than either alone. Our proprietary blend also includes arginine and biotin for a complete hair health formula.",
      pathA: {
        price: "$59/mo",
        priceNote: "4-active topical spray, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Finasteride + Minoxidil + Arginine + Biotin in one spray",
          "Compounded — not available at any pharmacy",
          "One application daily, no pills if you prefer",
          "Provider consultation & treatment plan included",
          "Free shipping in discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_HAIR,
        benefits: [
          "Rx: Finasteride oral + Minoxidil 5% topical (OTC)",
          "Use insurance for finasteride prescription",
          "Minoxidil foam available OTC at any pharmacy",
          "Provider consultation & management included",
          "Monthly check-ins & refill management",
        ],
      },
    },

    "men-max": {
      productName: "Hair Restore Max (Men)",
      productSubtitle:
        "Minoxidil + Finasteride + Dutasteride + Caffeine + Azelaic Acid — advanced formula",
      recommendation:
        "For significant or long-standing hair loss, our most comprehensive formula adds dutasteride to the standard combination — blocking DHT more completely than finasteride alone. This is Body Good's most powerful men's hair restoration option.",
      pathA: {
        price: "$79/mo",
        priceNote: "6-active topical formula, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "6 proven actives including Dutasteride (blocks DHT 99%)",
          "Medical-grade compounded formula",
          "Not available at any standard pharmacy",
          "Provider-monitored with dose adjustments",
          "Free shipping, discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        ...PATH_B_HAIR,
        benefits: [
          "Rx: Finasteride + Dutasteride sent to your pharmacy",
          "Insurance may cover finasteride (generic ~$10/mo)",
          "Provider consultation & management included",
          "Monthly check-ins & dose adjustments",
          "Message your provider anytime",
        ],
        pharmacyNote:
          "Dutasteride may require prior authorization. Our team handles this paperwork for you.",
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
              Based on your answers, our providers recommend the following treatment. You choose how you&apos;d like to receive it.
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
                desc: "Path A: Your formula ships directly. Path B: Your Rx is sent electronically to your chosen pharmacy.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Ongoing Support",
                desc: "Monthly check-ins, dose adjustments, and direct messaging with your provider are all included.",
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
