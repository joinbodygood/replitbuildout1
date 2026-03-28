import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DualPathCard } from "@/components/quiz/DualPathCard";
import { ShieldCheck, Clock, MessageCircle, AlertTriangle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const VALID_OUTCOMES = [
  "anxiety",
  "performance",
  "sleep",
  "depression",
  "motivation",
  "assessment",
];

function getConfig(outcome: string, locale: string) {
  const base = `/${locale}`;

  const pharmacyOnly = (
    productName: string,
    productSubtitle: string,
    recommendation: string,
    medication: string,
    price: string,
    priceNote: string,
    benefits: string[],
    cta: string,
    pharmacyNote: string
  ) => ({
    productName,
    productSubtitle,
    recommendation,
    pathA: null,
    pathB: {
      price,
      priceNote,
      badge: "Prescription to Your Pharmacy",
      benefits,
      pharmacyNote,
      cta,
      href: `${base}/programs`,
    },
  });

  const configs: Record<string, ReturnType<typeof pharmacyOnly> & {
    crossSell?: { title: string; desc: string; price: string; href: string };
  }> = {
    anxiety: {
      ...pharmacyOnly(
        "Calm Rx",
        "Buspirone 5–15mg — non-addictive anxiety medication",
        "For generalized anxiety, buspirone is the evidence-based first choice. It's non-addictive, non-sedating, and works around-the-clock — unlike benzodiazepines (Xanax, Ativan) which we do not prescribe. It takes 2–4 weeks to reach full effect, but patients report feeling meaningfully calmer and less reactive.",
        "Buspirone",
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
        "Start My Treatment →",
        "Buspirone is not a benzo — no dependency, no withdrawal. It's safe for long-term use and often covered by insurance at $0–$10/mo with a good plan."
      ),
      crossSell: {
        title: "For faster relief: Selank Nasal Spray",
        desc: "A peptide-based anti-anxiety spray. Works within minutes. Non-addictive. No pharmacy equivalent.",
        price: "$129/mo",
        href: `${base}/programs`,
      },
    },

    performance: {
      ...pharmacyOnly(
        "Stage Ready",
        "Propranolol 10–20mg — as-needed for performance anxiety",
        "Performance anxiety — whether before presentations, events, dates, or high-stakes situations — responds remarkably well to propranolol. It's a beta-blocker that blocks the physical symptoms of anxiety (racing heart, shaky hands, sweating) without sedating you or affecting your thinking. Take it 30–60 minutes before the situation.",
        "Propranolol",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Propranolol 10–20mg sent to your pharmacy",
          "As-needed — take only when you need it (not daily)",
          "Stops shaky hands, racing heart, sweating",
          "Doesn't affect your thinking or mental clarity",
          "Insurance covers propranolol in most plans (generic ~$5/mo)",
          "Monthly management & refill included",
        ],
        "Get Stage Ready →",
        "Propranolol is the medication professional musicians, surgeons, and public speakers use before high-pressure moments. Non-addictive, safe, and very effective."
      ),
    },

    sleep: {
      ...pharmacyOnly(
        "Sleep Rx",
        "Trazodone 25–50mg or Hydroxyzine 25mg — non-habit-forming sleep support",
        "For insomnia, we use non-controlled, non-habit-forming medications that support natural sleep architecture. Trazodone is an antidepressant at full dose — at low doses, it's one of the safest and most effective sleep aids. Hydroxyzine is an antihistamine with calming, sleep-promoting properties. Neither is habit-forming.",
        "Trazodone or Hydroxyzine",
        "$49",
        "initial consultation + $25/mo ongoing care",
        [
          "Rx: Trazodone or Hydroxyzine sent to your pharmacy",
          "Non-addictive — no dependency, no withdrawal",
          "Provider selects the best option based on your profile",
          "Insurance covers both in most plans (~$5/mo)",
          "Monthly check-ins & dose adjustments included",
          "Message your provider if sleep doesn't improve",
        ],
        "Start Sleeping Better →",
        "We do not prescribe Ambien, Lunesta, or benzodiazepines for sleep. These are habit-forming and dangerous long-term. Our approach uses evidence-based, non-controlled alternatives."
      ),
    },

    depression: {
      ...pharmacyOnly(
        "Lift Rx",
        "Sertraline · Escitalopram · Fluoxetine — SSRIs tailored to your profile",
        "For depression and persistent low mood, SSRIs are the gold-standard first treatment. Our provider will select the right medication based on your symptom profile, history, and preferences. Most patients start noticing improvement in 2–4 weeks, with full effect at 6–8 weeks.",
        "SSRI",
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
        "Start My Treatment →",
        "All SSRIs we prescribe are generic and covered by most insurance plans at $0–$15/mo. You pay Body Good the consultation fee — your pharmacy handles the medication."
      ),
    },

    motivation: {
      ...pharmacyOnly(
        "Momentum Rx",
        "Bupropion XL 150mg — for low energy, motivation, and mood",
        "Bupropion is the only antidepressant that also directly supports energy and motivation — it works on dopamine and norepinephrine rather than serotonin. It's also used for smoking cessation and has been shown to support weight loss as a bonus effect.",
        "Bupropion",
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
        "Start My Treatment →",
        "Bupropion is non-addictive and non-sedating. It's often a great alternative to SSRIs for patients whose main symptom is low energy rather than sadness."
      ),
    },

    assessment: {
      ...pharmacyOnly(
        "Mental Wellness Assessment",
        "Provider evaluation — a real doctor listens, assesses, and recommends",
        "If you're not sure what you need, that's completely okay. Our providers are trained to listen, ask the right questions, and create a personalized treatment plan based on your full picture — not a one-size-fits-all approach.",
        "Assessment",
        "$49",
        "one-time — no subscription required",
        [
          "Live intake form reviewed by a licensed provider",
          "Provider recommends the right medication or therapy approach",
          "No pressure to start medication if it's not right for you",
          "Prescription sent to your pharmacy if appropriate",
          "Follow-up included to refine your plan",
        ],
        "Start My Assessment →",
        "We do not prescribe controlled substances: no Xanax, no Adderall, no Ambien. We use evidence-based, non-addictive medications."
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
        </Container>
      </section>

      <section className="py-4 pb-12">
        <Container narrow>
          <DualPathCard
            productName={config.productName}
            productSubtitle={config.productSubtitle}
            recommendation={config.recommendation}
            pathA={config.pathA ?? undefined}
            pathB={config.pathB ?? undefined}
            crossSell={"crossSell" in config ? config.crossSell : undefined}
            locale={locale}
          />
        </Container>
      </section>

      <section className="py-4 pb-12">
        <Container narrow>
          <div className="bg-surface-dim rounded-xl p-5 text-center">
            <p className="text-body-muted text-sm">
              <strong>Body Good does not prescribe controlled substances.</strong>{" "}
              No Xanax. No Adderall. No Ambien. We use evidence-based, non-addictive medications that are safe for long-term use and covered by most insurance plans.
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
              Want to explore other options?
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
