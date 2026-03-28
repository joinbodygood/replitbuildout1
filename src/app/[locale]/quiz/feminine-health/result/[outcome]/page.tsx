import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DualPathCard } from "@/components/quiz/DualPathCard";
import { ShieldCheck, Clock, MessageCircle } from "lucide-react";

type Props = {
  params: Promise<{ locale: string; outcome: string }>;
};

const VALID_OUTCOMES = [
  "acute-infection",
  "vaginal-dryness",
  "intimacy",
  "prevention",
];

interface FHPathOption {
  price: string;
  priceNote?: string;
  badge?: string;
  benefits: string[];
  pharmacyNote?: string;
  cta: string;
  href: string;
}

interface FHConfig {
  headline: string;
  productName: string;
  productSubtitle: string;
  recommendation: string;
  pathA: FHPathOption | null;
  pathB: FHPathOption | null;
  crossSell?: { title: string; desc: string; price: string; href: string };
}

function getConfig(outcome: string, locale: string): FHConfig {
  const base = `/${locale}`;

  const configs: Record<string, FHConfig> = {
    "acute-infection": {
      headline: "Let's get you treated today.",
      productName: "UTI · Yeast Infection · BV Treatment",
      productSubtitle: "Prescription antibiotics or antifungals — same day",
      recommendation:
        "For acute infections, the fastest path is a prescription to your local pharmacy. A provider reviews your info, writes your Rx, and sends it electronically — you pick it up same day and pay with your insurance.",
      pathA: null,
      pathB: {
        price: "$35",
        priceNote: "one-time consultation fee — no subscription",
        badge: "Prescription to Your Pharmacy",
        benefits: [
          "Provider reviews your symptoms within hours",
          "Rx sent electronically to your pharmacy of choice",
          "Pick up same day — use your insurance for the medication",
          "UTI: Nitrofurantoin or TMP-SMX | Yeast: Fluconazole | BV: Metronidazole",
          "Follow-up included if symptoms don't resolve",
        ],
        pharmacyNote:
          "Most antibiotics and antifungals are $0–$15 with insurance. You pay Body Good $35 for the provider consultation — the medication is billed through your pharmacy.",
        cta: "Get Treatment Now →",
        href: `${base}/programs`,
      },
      crossSell: {
        title: "Prevent future infections: Infection Prevention Bundle",
        desc: "Probiotics + D-Mannose + Boric Acid — clinically shown to reduce recurrence.",
        price: "$29/mo",
        href: `${base}/programs`,
      },
    },

    "vaginal-dryness": {
      headline: "Relief and restoration — on your terms.",
      productName: "Vaginal Dryness Rx",
      productSubtitle:
        "Estradiol or Estriol vaginal gel — bioidentical hormone therapy",
      recommendation:
        "Vaginal dryness and discomfort — especially during or after menopause — responds extremely well to localized estrogen therapy. Low-dose vaginal estrogen is safe, highly effective, and does not carry the systemic risks of oral HRT.",
      pathA: {
        price: "$65/mo",
        priceNote: "Compounded estradiol or estriol gel, shipped free",
        badge: "Ship to My Door",
        benefits: [
          "Compounded estradiol (E2) or estriol (E3) vaginal gel",
          "Estriol is only available as a compounded formula (not at pharmacies)",
          "Gentler, more targeted than systemic hormone therapy",
          "Provider consultation & treatment plan included",
          "Discreet packaging, free shipping",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: {
        price: "$49",
        priceNote: "initial consultation + $25/mo ongoing care",
        badge: "Send to My Pharmacy",
        benefits: [
          "Rx: Estradiol vaginal cream or ring sent to your pharmacy",
          "Insurance often covers vaginal estrogen prescriptions",
          "Standard FDA-approved estradiol preparations",
          "Provider consultation & monitoring included",
          "Monthly check-ins & dose adjustments",
        ],
        pharmacyNote:
          "Estradiol vaginal cream (Premarin, Estrace) is typically covered by insurance. Estriol, a gentler alternative, is only available through compounding (Path A).",
        cta: "Start Consultation →",
        href: `${base}/programs`,
      },
    },

    "intimacy": {
      headline: "You deserve to feel good in your body.",
      productName: "Intimate Wellness Cream",
      productSubtitle:
        "Sildenafil + Arginine + Papaverine — topical arousal formula",
      recommendation:
        "Our Intimate Wellness Cream is a compounded topical formula that increases blood flow to the clitoris and surrounding tissue, enhancing arousal and sensitivity. Applied locally before intimacy — it works within 20–30 minutes and has no systemic side effects.",
      pathA: {
        price: "$65/mo",
        priceNote: "Compounded topical cream, shipped discreetly",
        badge: "Ship to My Door",
        benefits: [
          "Sildenafil + Arginine + Papaverine — topical formula",
          "Increases blood flow and sensitivity locally",
          "Works within 20–30 minutes of application",
          "No pills, no systemic effects, no prescription wait",
          "Compounded — not available at any standard pharmacy",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: null,
      crossSell: {
        title: "Add Connection Rx: Oxytocin Nasal Spray",
        desc: "Enhances emotional bonding and intimacy. Pairs with the Wellness Cream.",
        price: "$79/mo",
        href: `${base}/programs`,
      },
    },

    "prevention": {
      headline: "Stop the cycle before it starts.",
      productName: "Infection Prevention Bundle",
      productSubtitle: "Probiotics + D-Mannose + Boric Acid — OTC prevention protocol",
      recommendation:
        "Recurring UTIs, yeast infections, and BV often stem from the same root cause — microbiome imbalance. Our Prevention Bundle combines three clinically-validated OTC supplements that work together to restore vaginal pH, block bacterial adhesion, and crowd out harmful organisms.",
      pathA: {
        price: "$29/mo",
        priceNote: "OTC bundle, shipped monthly",
        badge: "Ship to My Door",
        benefits: [
          "Probiotics: Lactobacillus strains that restore vaginal flora",
          "D-Mannose: Blocks E. coli from adhering to bladder walls",
          "Boric Acid: Restores vaginal pH to prevent BV and yeast",
          "No prescription needed — all OTC ingredients",
          "Free shipping in discreet packaging",
        ],
        cta: "Get Started →",
        href: `${base}/programs`,
      },
      pathB: null,
      crossSell: {
        title: "Need treatment first? Get a $35 Acute Consult",
        desc: "If you have active symptoms right now, start with treatment — then add prevention.",
        price: "$35 one-time",
        href: `${base}/quiz/feminine-health`,
      },
    },
  };

  return configs[outcome] || configs["acute-infection"];
}

export default async function FeminineHealthResultPage({ params }: Props) {
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
              {config.headline}
            </h1>
            <p className="text-body-muted text-base max-w-lg mx-auto">
              Based on your answers, here&apos;s what we recommend. You choose the path that works best for you.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container narrow>
          <DualPathCard
            productName={config.productName}
            productSubtitle={config.productSubtitle}
            recommendation={config.recommendation}
            pathA={config.pathA ?? undefined}
            pathB={config.pathB ?? undefined}
            crossSell={config.crossSell}
            locale={locale}
          />
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
                desc: "A licensed provider reviews your information — typically within a few hours for acute cases.",
              },
              {
                icon: <Clock size={22} className="text-brand-red" />,
                title: "Fast Treatment",
                desc: "Acute Rx sent to your pharmacy same day. Compounded formulas ship in 3–5 business days.",
              },
              {
                icon: <MessageCircle size={22} className="text-brand-red" />,
                title: "Follow-Up Included",
                desc: "Follow-up if symptoms don't resolve. Ongoing management included for monthly subscriptions.",
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
