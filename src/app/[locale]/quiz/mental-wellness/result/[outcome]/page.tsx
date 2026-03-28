import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DualPathCard } from "@/components/quiz/DualPathCard";
import type { PathOption } from "@/components/quiz/DualPathCard";
import { ShieldCheck, Clock, MessageCircle, AlertTriangle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const VALID_OUTCOMES = ["anxiety", "performance", "sleep", "depression", "motivation", "assessment"];

function makePharmacyPath(
  variantId: string,
  price: string,
  priceNote: string,
  benefits: string[],
  cta: string,
  pharmacyNote: string,
  priceInCents = 4900,
  tradeoffs?: string[]
): PathOption {
  return {
    price,
    priceNote,
    badge: "Prescription to Your Pharmacy",
    benefits,
    tradeoffs: tradeoffs ?? [
      "Rx medications require provider approval — not instant",
      "Takes 2–4 weeks to reach full effect for most medications",
    ],
    pharmacyNote,
    cta,
    href: "/programs",
    cartData: {
      productId: "mw-pharmacy-consult",
      variantId,
      priceInCents,
      variantLabel: "Initial Consultation",
      slug: "mental-wellness-consultation",
    },
  };
}

interface MWConfig {
  productName: string;
  productSubtitle: string;
  recommendation: string;
  pathA: PathOption | null;
  pathB: PathOption | null;
  crossSell?: { title: string; desc: string; price: string; href: string };
}

function getConfig(outcome: string, locale: string): MWConfig {
  const base = `/${locale}`;

  const configs: Record<string, MWConfig> = {
    anxiety: {
      productName: "Calm Rx",
      productSubtitle: "Buspirone 5–15mg — non-addictive anxiety medication",
      recommendation:
        "For generalized anxiety, buspirone is the evidence-based first choice. Non-addictive, non-sedating, and works around-the-clock — unlike benzodiazepines, which we do not prescribe.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-anxiety",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Buspirone 5–15mg sent to your pharmacy of choice",
          "Non-addictive — not a controlled substance",
          "Insurance covers buspirone in most plans (generic ~$5/mo)",
          "Provider creates your personalized treatment plan",
          "Monthly check-ins & dose adjustments included",
          "Secure messaging with your provider anytime",
        ],
        "Start My Treatment",
        "Buspirone is not a benzo — no dependency, no withdrawal. Safe for long-term use and often covered at $0–$10/mo with a good plan.",
        4900,
        [
          "Takes 2–4 weeks to reach full effect (not instant relief)",
          "Not for situational or acute anxiety — see Propranolol instead",
        ]
      ),
      crossSell: {
        title: "For faster relief: Selank Nasal Spray",
        desc: "A peptide-based anti-anxiety spray. Works within minutes. Non-addictive.",
        price: "$129/mo",
        href: `${base}/programs`,
      },
    },

    performance: {
      productName: "Stage Ready",
      productSubtitle: "Propranolol 10–20mg — as-needed for performance anxiety",
      recommendation:
        "Propranolol blocks the physical symptoms of anxiety (racing heart, shaky hands, sweating) without sedating you or affecting your thinking. Take it 30–60 minutes before the situation.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-performance",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Propranolol 10–20mg sent to your pharmacy",
          "As-needed — take only when you need it, not daily",
          "Stops shaky hands, racing heart, sweating",
          "Doesn't affect thinking or mental clarity",
          "Insurance covers propranolol in most plans (generic ~$5/mo)",
          "Monthly management & refill included",
        ],
        "Get Stage Ready",
        "Propranolol is the medication professional musicians, surgeons, and public speakers use before high-pressure moments. Non-addictive, safe, and very effective.",
        4900,
        [
          "Works on physical symptoms — not generalized daily anxiety",
          "Must be taken 30–60 min before the event to take effect",
        ]
      ),
    },

    sleep: {
      productName: "Sleep Rx",
      productSubtitle: "Trazodone 25–50mg or Hydroxyzine 25mg — non-habit-forming sleep support",
      recommendation:
        "We use non-controlled, non-habit-forming medications that support natural sleep architecture. Neither trazodone nor hydroxyzine is addictive.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-sleep",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Trazodone or Hydroxyzine sent to your pharmacy",
          "Non-addictive — no dependency, no withdrawal",
          "Provider selects the best option for your sleep profile",
          "Insurance covers both in most plans (~$5/mo)",
          "Monthly check-ins & dose adjustments included",
          "Message your provider if sleep doesn't improve",
        ],
        "Start Sleeping Better",
        "We do not prescribe Ambien, Lunesta, or benzodiazepines for sleep. These are habit-forming and dangerous long-term. Our approach uses evidence-based, non-controlled alternatives.",
        4900,
        [
          "We do NOT prescribe Ambien, Lunesta, or benzodiazepines",
          "May cause mild morning grogginess until dose is dialed in",
        ]
      ),
    },

    depression: {
      productName: "Lift Rx",
      productSubtitle: "Sertraline · Escitalopram · Fluoxetine — SSRIs tailored to your profile",
      recommendation:
        "For depression and persistent low mood, SSRIs are the gold-standard first treatment. Your provider selects the right medication based on your symptom profile and history.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-depression",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: SSRI (Sertraline, Escitalopram, or Fluoxetine) to your pharmacy",
          "Provider selects based on your specific needs",
          "All generic — insurance covers in most plans (~$5/mo)",
          "Personalized treatment plan with monitoring",
          "Monthly check-ins & dose adjustments included",
          "Upgrade to SNRI if needed — included in ongoing care",
        ],
        "Start My Treatment",
        "All SSRIs we prescribe are generic and covered by most insurance at $0–$15/mo. You pay Body Good the consultation fee — your pharmacy handles the medication.",
        4900,
        [
          "Takes 6–8 weeks to feel full effect — requires patience",
          "Some mild side effects in the first 1–2 weeks are common",
        ]
      ),
    },

    motivation: {
      productName: "Momentum Rx",
      productSubtitle: "Bupropion XL 150mg — for low energy, motivation, and mood",
      recommendation:
        "Bupropion works on dopamine and norepinephrine rather than serotonin — directly supporting energy and motivation. Also used for smoking cessation and supports weight loss as a bonus.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-motivation",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Bupropion XL 150mg sent to your pharmacy",
          "Boosts dopamine & norepinephrine — energy and motivation",
          "Often helps with weight loss as a secondary benefit",
          "Generic — insurance covers in most plans (~$5/mo)",
          "Provider consultation & treatment plan included",
          "Monthly check-ins & dose adjustments included",
        ],
        "Start My Treatment",
        "Bupropion is non-addictive and non-sedating. A great alternative to SSRIs for patients whose main symptom is low energy rather than sadness.",
        4900,
        [
          "Not for patients with seizure history or eating disorders",
          "May cause initial insomnia — taken in the morning",
        ]
      ),
    },

    assessment: {
      productName: "Mental Wellness Assessment",
      productSubtitle: "Provider evaluation — a real doctor listens, assesses, and recommends",
      recommendation:
        "Not sure what you need? Our providers are trained to listen, ask the right questions, and create a personalized treatment plan — not a one-size-fits-all approach.",
      pathA: null,
      pathB: makePharmacyPath(
        "mw-consult-assessment",
        "$49",
        "one-time — no subscription required",
        [
          "Live intake form reviewed by a licensed provider",
          "Provider recommends the right medication or therapy",
          "No pressure to start medication if it's not right for you",
          "Prescription sent to your pharmacy if appropriate",
          "Follow-up included to refine your plan",
        ],
        "Start My Assessment",
        "We do not prescribe controlled substances: no Xanax, no Adderall, no Ambien. We use evidence-based, non-addictive medications.",
        4900,
        [
          "We do NOT prescribe Xanax, Adderall, or Ambien",
          "Assessment fee applies — refunded if no treatment recommended",
        ]
      ),
    },
  };

  return configs[outcome] || configs["assessment"];
}

export default async function MentalWellnessResultPage({ params }: Props) {
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
              Here&apos;s What a Provider May Recommend For You
            </h1>
            <p className="text-body-muted text-base max-w-lg mx-auto">
              Based on your answers, here&apos;s the evidence-based treatment approach most appropriate for what you&apos;re experiencing.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container narrow>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3 mb-8">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Mental health emergencies:</strong> If you are in crisis or having thoughts of self-harm, please call or text{" "}
              <strong>988</strong> (Suicide & Crisis Lifeline) or go to your nearest emergency room. Body Good is not an emergency service.
            </p>
          </div>

          <DualPathCard
            productName={config.productName}
            productSubtitle={config.productSubtitle}
            recommendation={config.recommendation}
            pathA={config.pathA ?? undefined}
            pathB={config.pathB ?? undefined}
            crossSell={"crossSell" in config ? config.crossSell : undefined}
            locale={locale}
          />

          <div className="mt-8 bg-surface-dim rounded-xl p-5 text-center">
            <p className="text-body-muted text-sm">
              <strong>Body Good does not prescribe controlled substances.</strong>{" "}
              No Xanax. No Adderall. No Ambien. We use evidence-based, non-addictive medications safe for long-term use and covered by most insurance plans.
            </p>
          </div>
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
                desc: "A licensed provider reviews your intake form and creates your personalized treatment plan.",
              },
              {
                icon: <Clock size={22} className="text-brand-red" />,
                title: "Rx Sent Today",
                desc: "Your prescription is sent electronically to your chosen pharmacy — pick it up the same or next day.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Ongoing Support",
                desc: "Monthly check-ins, dose adjustments, and messaging access with your provider — all included.",
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
