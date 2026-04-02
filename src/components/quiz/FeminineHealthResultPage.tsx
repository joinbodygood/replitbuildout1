"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Droplets,
  Flame,
  HeartHandshake,
  ShieldCheck,
  Pill,
  Loader2,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PharmacyDisclaimerBox } from "@/components/ui/PharmacyDisclaimerBox";
import { useCartConflictGuard } from "@/hooks/useCartConflictGuard";
import { CartConflictModal } from "@/components/cart/CartConflictModal";

// ── Product display catalog ───────────────────────────────────────────────

interface FHProduct {
  sku: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  howToUse: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  isPharmacy: boolean;
  pharmacyFee?: number;           // cents
  prices?: Record<number, number>; // { months: $/mo }
  tiers?: number[];
  slug: string;
}

const FH_DISPLAY: Record<string, FHProduct> = {
  "FH-VAGDRY": {
    sku: "FH-VAGDRY",
    name: "Estradiol Vaginal Cream",
    subtitle: "Vaginal Dryness Rx",
    tagline: "Low-dose estrogen · Physician-compounded",
    description:
      "A physician-compounded estradiol cream that restores natural moisture, reduces irritation, and rebuilds vaginal tissue that changes with hormonal shifts. Unlike over-the-counter lubricants, this targets the root cause — not just the symptom.",
    howToUse:
      "Apply a small amount topically 2–3 times per week, or exactly as your physician directs. Most women notice a meaningful difference within 2–4 weeks.",
    Icon: Droplets,
    iconBg: "#E8F5EE",
    iconColor: "#1B8A4A",
    isPharmacy: false,
    prices: { 1: 65, 3: 59 },
    tiers: [1, 3],
    slug: "estradiol",
  },
  "FH-SCREAM1": {
    sku: "FH-SCREAM1",
    name: "Intimate Wellness Cream",
    subtitle: "Arousal & Sensitivity Rx",
    tagline: "Topical · Sildenafil + Arginine + Papaverine",
    description:
      "A compounded topical cream combining three actives that increase blood flow and sensitivity exactly where it matters. Applied before intimacy for a noticeably enhanced experience — fast-acting, localized, and physician-formulated.",
    howToUse:
      "Apply a pea-sized amount to the clitoral area 15–30 minutes before intimacy. Effects are localized and typically felt within 20 minutes.",
    Icon: Flame,
    iconBg: "#FEF0E8",
    iconColor: "#E85A0E",
    isPharmacy: false,
    prices: { 1: 65, 3: 59 },
    tiers: [1, 3],
    slug: "intimate-wellness-cream",
  },
  "FH-SCREAM2": {
    sku: "FH-SCREAM2",
    name: "Intimate Wellness Plus",
    subtitle: "Prevention & Wellness Rx",
    tagline: "Enhanced formula · Prevention + long-term care",
    description:
      "An upgraded formulation with additional active ingredients designed for ongoing prevention and long-term intimate wellness. Ideal for women dealing with recurring infections or wanting to stay proactively healthy between episodes.",
    howToUse:
      "Apply a small amount topically as part of your daily or weekly intimate wellness routine. Can be used proactively between infection episodes.",
    Icon: ShieldCheck,
    iconBg: "#EBF2FF",
    iconColor: "#1A6EED",
    isPharmacy: false,
    prices: { 1: 75, 3: 69 },
    tiers: [1, 3],
    slug: "intimate-wellness-plus",
  },
  "FH-OXYTOCIN": {
    sku: "FH-OXYTOCIN",
    name: "Oxytocin Nasal Spray",
    subtitle: "Connection & Desire Rx",
    tagline: "Intranasal · Bonding hormone support",
    description:
      "Oxytocin — the 'bonding hormone' — plays a central role in emotional intimacy, trust, and desire. This nasal spray delivers it directly to support deeper connection, enhance desire, and strengthen your experience of intimacy from the inside out.",
    howToUse:
      "Administer 2–3 sprays intranasally 30–60 minutes before intimacy. Start with the lower dose and adjust based on your physician's guidance.",
    Icon: HeartHandshake,
    iconBg: "#F5EEF8",
    iconColor: "#9B59B6",
    isPharmacy: false,
    prices: { 1: 79, 3: 72 },
    tiers: [1, 3],
    slug: "oxytocin",
  },
  "FH-YEAST": {
    sku: "FH-YEAST",
    name: "Fluconazole",
    subtitle: "Yeast Infection Treatment Rx",
    tagline: "Prescription antifungal · Sent to your pharmacy",
    description:
      "Fluconazole is the gold-standard prescription antifungal for yeast infections. A board-certified physician reviews your symptoms, writes a prescription, and sends it directly to your local pharmacy — often the same day.",
    howToUse:
      "Typically a single 150mg oral tablet. Your physician will determine the exact dose and duration based on your symptoms and history.",
    Icon: Pill,
    iconBg: "#EBF2FF",
    iconColor: "#1A6EED",
    isPharmacy: true,
    pharmacyFee: 35,
    slug: "fluconazole",
  },
  "FH-BV": {
    sku: "FH-BV",
    name: "Metronidazole",
    subtitle: "BV Treatment Rx",
    tagline: "Prescription antibiotic · Sent to your pharmacy",
    description:
      "Metronidazole is the most prescribed antibiotic for bacterial vaginosis. Your physician reviews your answers, writes a prescription, and sends it to your local pharmacy as a gel or tablet — often the same day.",
    howToUse:
      "Usually a 5–7 day course as a vaginal gel or oral tablet. Your physician will determine the optimal form and duration for you.",
    Icon: Pill,
    iconBg: "#E8F5EE",
    iconColor: "#1B8A4A",
    isPharmacy: true,
    pharmacyFee: 35,
    slug: "metronidazole",
  },
};

// ── Recommendation logic ──────────────────────────────────────────────────

function getSkus(
  outcome: string,
  preference: string,
): string[] {
  if (outcome === "vaginal-dryness") return ["FH-VAGDRY"];
  if (outcome === "acute-yeast")     return ["FH-YEAST"];
  if (outcome === "acute-bv")        return ["FH-BV"];
  if (outcome === "prevention")      return ["FH-SCREAM2"];

  if (outcome === "intimacy") {
    if (preference === "topical") return ["FH-SCREAM1"];
    if (preference === "oral")    return ["FH-OXYTOCIN"];
    // No preference → show both (max 2)
    return ["FH-SCREAM1", "FH-OXYTOCIN"];
  }

  return ["FH-SCREAM1"];
}

// ── Personalized reasoning ────────────────────────────────────────────────

const CONCERN_LABELS: Record<string, string> = {
  dryness:          "vaginal dryness or discomfort",
  yeast:            "recurrent yeast infections",
  bv:               "bacterial vaginosis",
  "uti-prevention": "UTI prevention",
  libido:           "lower libido or decreased desire",
  hormonal:         "hormonal changes",
  general:          "general intimate wellness",
};

const DURATION_LABELS: Record<string, string> = {
  "under-1mo":  "recently",
  "1-3mo":      "over the past 1–3 months",
  "3-6mo":      "for several months now",
  "6mo-plus":   "for more than 6 months",
  "on-and-off": "on and off for years",
};

const LIFE_STAGE_LABELS: Record<string, string> = {
  "pre-menopausal": "pre-menopausal with regular cycles",
  "peri":           "in perimenopause",
  "menopause":      "going through menopause",
  "post-menopause": "post-menopausal",
  "prefer-not":     "",
};

function buildReasoning(
  sku: string,
  concern: string,
  lifeStage: string,
  severity: string,
  duration: string,
): string {
  const concernLabel   = CONCERN_LABELS[concern] ?? "your concern";
  const durationLabel  = DURATION_LABELS[duration] ?? "";
  const lifeStageLabel = LIFE_STAGE_LABELS[lifeStage] ?? "";

  const durationPhrase = durationLabel ? ` — and you've been experiencing this ${durationLabel}` : "";
  const stagePhrase    = lifeStageLabel ? `, and you're ${lifeStageLabel}` : "";

  switch (sku) {
    case "FH-VAGDRY":
      return `You came in for ${concernLabel}${durationPhrase}${stagePhrase}. ${
        ["peri", "menopause", "post-menopause"].includes(lifeStage)
          ? "Hormonal shifts at this life stage directly reduce natural estrogen levels, which affects vaginal tissue and moisture. Estradiol cream is the most clinically-supported topical option for exactly this."
          : "Estradiol cream addresses the root cause of vaginal dryness by gently restoring estrogen to the tissue — not just masking discomfort."
      }${severity === "significant" ? " Because this is significantly affecting your quality of life, we prioritized a solution that works at the source." : ""}`;

    case "FH-SCREAM1":
      return `You're experiencing ${concernLabel}${durationPhrase}. Intimate Wellness Cream is a topical formula that increases blood flow and sensitivity directly — making it one of the most effective options for arousal support${
        ["peri", "menopause", "post-menopause"].includes(lifeStage)
          ? ", especially during the hormonal changes of your current life stage"
          : ""
      }.`;

    case "FH-OXYTOCIN":
      return `You're experiencing ${concernLabel}${durationPhrase}. Oxytocin plays a central role in emotional connection, desire, and intimacy — this spray works systemically to support that bond from within, which makes it the right fit based on your preference for a non-topical option.`;

    case "FH-SCREAM2":
      return `You've been dealing with ${concernLabel}${durationPhrase}. Because of the recurring nature of your situation, we recommended a prevention-focused formula rather than a one-time treatment. Intimate Wellness Plus is designed for ongoing use to maintain optimal intimate health between flare-ups.`;

    case "FH-YEAST":
      return `You came in for ${concernLabel}${durationPhrase}. Fluconazole is the gold-standard prescription antifungal — it's fast, effective, and commonly prescribed for exactly what you're describing. A physician will review your answers and send a prescription to your local pharmacy.`;

    case "FH-BV":
      return `You came in for ${concernLabel}${durationPhrase}. Metronidazole is the most prescribed antibiotic for BV and it works reliably when taken as directed. Your physician will review your symptoms and send a prescription to your local pharmacy — often the same day.`;

    default:
      return `Based on your answers, our physician team identified this as the most appropriate option for your situation.`;
  }
}

// ── Props ─────────────────────────────────────────────────────────────────

interface Props {
  outcome: string;
  concern: string;
  lifeStage: string;
  severity: string;
  preference: string;
  duration: string;
  locale: string;
}

// ── Single product card ───────────────────────────────────────────────────

interface SingleCardProps {
  product: FHProduct;
  reasoning: string;
  locale: string;
  concern: string;
  lifeStage: string;
  severity: string;
  duration: string;
}

function SingleRecommendation({
  product,
  reasoning,
  locale,
}: SingleCardProps) {
  const router = useRouter();
  const { conflict, dismissConflict, guardedReplaceFlow } = useCartConflictGuard();
  const [tier, setTier] = useState(product.tiers?.[0] ?? 1);
  const [loading, setLoading] = useState(false);

  const pricePerMonth = product.prices?.[tier] ?? 0;
  const totalPrice    = product.isPharmacy
    ? (product.pharmacyFee ?? 35)
    : pricePerMonth * tier;

  function handleGetStarted() {
    setLoading(true);
    const cartItem = product.isPharmacy
      ? {
          productId:    product.sku,
          variantId:    `${product.sku}-pharmacy`,
          name:         `${product.name} — Doctor Consultation`,
          variantLabel: "Doctor Review + E-Prescription",
          price:        (product.pharmacyFee ?? 35) * 100,
          slug:         product.slug,
        }
      : {
          productId:      product.sku,
          variantId:      `${product.sku}-${tier}mo`,
          name:           product.name,
          variantLabel:   tier === 1 ? "1-month supply" : `${tier}-month supply`,
          price:          totalPrice * 100,
          slug:           product.slug,
          isMedPlan:      true,
          monthlyPrice:   pricePerMonth * 100,
          durationMonths: tier,
        };
    const ok = guardedReplaceFlow(
      "feminine-health",
      [cartItem],
      () => router.push(`/${locale}/checkout`),
    );
    if (!ok) setLoading(false);
  }

  const { Icon } = product;

  return (
    <>
    <div className="max-w-xl mx-auto">
      {/* Product header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: product.iconBg }}
        >
          <Icon size={26} style={{ color: product.iconColor }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA] mb-0.5">
            {product.subtitle}
          </p>
          <h1 className="font-heading text-[#0C0D0F] text-2xl md:text-3xl font-bold leading-tight">
            {product.name}
          </h1>
          <p className="text-[#55575A] text-sm mt-0.5">{product.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[#0C0D0F] text-[15px] leading-relaxed mb-6">
        {product.description}
      </p>

      {/* Why recommended */}
      <div className="bg-[#FFF5F5] border border-brand-red/20 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <Info size={16} className="text-brand-red flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-red mb-1">
              Why this was recommended for you
            </p>
            <p className="text-[#0C0D0F] text-[14px] leading-relaxed">{reasoning}</p>
          </div>
        </div>
      </div>

      {/* How to use */}
      <div className="bg-[#F8F9FA] rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA] mb-2">
          How to use it
        </p>
        <p className="text-[#0C0D0F] text-[14px] leading-relaxed">{product.howToUse}</p>
      </div>

      {/* Pricing */}
      {product.isPharmacy ? (
        <>
          <div className="border-2 border-[#E5E5E5] rounded-2xl p-5 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA] mb-1">
              Consultation fee
            </p>
            <p className="text-[#0C0D0F] text-3xl font-bold mb-1">
              ${product.pharmacyFee}
            </p>
            <p className="text-[#55575A] text-sm">
              Doctor review + e-prescription sent to your local pharmacy
            </p>
          </div>
          <PharmacyDisclaimerBox className="mb-6" />
        </>
      ) : (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#AAAAAA] mb-3">
            Choose your supply
          </p>
          <div className="flex gap-3 mb-4">
            {(product.tiers ?? [1]).map((t) => {
              const ppm = product.prices?.[t] ?? 0;
              const isSelected = tier === t;
              return (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5"
                      : "border-[#E5E5E5] hover:border-brand-red/40"
                  }`}
                >
                  <p className="font-bold text-[#0C0D0F] text-[15px]">${ppm}/mo</p>
                  <p className="text-[#55575A] text-xs mt-0.5">
                    {t === 1 ? "1-month supply" : `${t}-month supply`}
                    {t > 1 && (
                      <span className="ml-1 text-[#1B8A4A] font-semibold">
                        · Save ${((product.prices?.[1] ?? 0) - ppm) * t}/total
                      </span>
                    )}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="bg-[#F8F9FA] rounded-xl px-4 py-3 flex justify-between items-center">
            <p className="text-[#55575A] text-sm">
              {tier === 1 ? "Billed monthly" : `Billed as $${totalPrice} for ${tier} months`}
            </p>
            <p className="font-bold text-[#0C0D0F]">${pricePerMonth}/mo</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={handleGetStarted}
        size="lg"
        variant="primary"
        className="w-full rounded-full text-base"
        disabled={loading}
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin mr-2" /> Preparing your order…</>
        ) : (
          <>Get Started <ArrowRight size={18} className="ml-2" /></>
        )}
      </Button>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
        {[
          "Board-certified physician review",
          "No subscription required",
          "Cancel anytime",
        ].map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
            <CheckCircle size={13} className="text-[#1B8A4A]" />
            {t}
          </div>
        ))}
      </div>
    </div>
    {conflict && (
      <CartConflictModal
        existingProgram={conflict.existingProgram}
        onKeep={dismissConflict}
        onReplace={conflict.onReplace}
      />
    )}
    </>
  );
}

// ── Two-option comparison card ────────────────────────────────────────────

interface CompareProps {
  products: FHProduct[];
  locale: string;
  concern: string;
  lifeStage: string;
  severity: string;
  duration: string;
}

function TwoOptionComparison({ products, locale, concern, lifeStage, severity, duration }: CompareProps) {
  const router = useRouter();
  const { conflict, dismissConflict, guardedReplaceFlow } = useCartConflictGuard();
  const [selected, setSelected] = useState<string | null>(null);
  const [tier, setTier] = useState(1);
  const [loading, setLoading] = useState(false);

  const COMPARE_HINT: Record<string, string> = {
    "FH-SCREAM1":  "Better fit if you prefer a direct, fast-acting topical that works before intimacy.",
    "FH-OXYTOCIN": "Better fit if you want to enhance emotional connection and desire on a deeper level.",
  };

  function handleChoose(sku: string) {
    setSelected(sku);
  }

  function handleGetStarted() {
    if (!selected) return;
    const product = products.find((p) => p.sku === selected)!;
    setLoading(true);
    const pricePerMonth = product.prices?.[tier] ?? 0;
    const totalPrice    = pricePerMonth * tier;
    const ok = guardedReplaceFlow(
      "feminine-health",
      [{
        productId:      product.sku,
        variantId:      `${product.sku}-${tier}mo`,
        name:           product.name,
        variantLabel:   tier === 1 ? "1-month supply" : `${tier}-month supply`,
        price:          totalPrice * 100,
        slug:           product.slug,
        isMedPlan:      true,
        monthlyPrice:   pricePerMonth * 100,
        durationMonths: tier,
      }],
      () => router.push(`/${locale}/checkout`),
    );
    if (!ok) setLoading(false);
  }

  return (
    <>
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading text-[#0C0D0F] text-2xl md:text-3xl font-bold mb-3">
          Two great options for your situation
        </h1>
        <p className="text-[#55575A] text-[15px] max-w-md mx-auto">
          Based on your answers, either of these could be a great fit. Read the brief descriptions below to pick what resonates most with you.
        </p>
      </div>

      {/* Supply selector */}
      <div className="flex gap-3 mb-6 justify-center">
        {[1, 3].map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border-2 ${
              tier === t
                ? "border-brand-red bg-brand-red text-white"
                : "border-[#E5E5E5] text-[#55575A] hover:border-brand-red/40"
            }`}
          >
            {t === 1 ? "1-month" : "3-month"}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {products.map((product) => {
          const isSelected = selected === product.sku;
          const pricePerMonth = product.prices?.[tier] ?? 0;
          const { Icon } = product;

          return (
            <button
              key={product.sku}
              onClick={() => handleChoose(product.sku)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${
                isSelected
                  ? "border-brand-red bg-brand-red/5"
                  : "border-[#E5E5E5] hover:border-brand-red/30 bg-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: product.iconBg }}
                >
                  <Icon size={20} style={{ color: product.iconColor }} />
                </div>
                <div>
                  <p className="font-bold text-[#0C0D0F] text-[15px] leading-snug">{product.name}</p>
                  <p className="text-[#AAAAAA] text-xs">{product.tagline}</p>
                </div>
                {isSelected && (
                  <CheckCircle size={18} className="text-brand-red ml-auto flex-shrink-0" />
                )}
              </div>

              <p className="text-[#55575A] text-[13px] leading-relaxed mb-3">
                {product.description}
              </p>

              <div
                className="rounded-xl px-3 py-2 text-[12px] font-medium mb-3"
                style={{ background: product.iconBg, color: product.iconColor }}
              >
                {COMPARE_HINT[product.sku] ?? ""}
              </div>

              <p className="font-bold text-[#0C0D0F] text-lg">
                ${pricePerMonth}/mo
                {tier > 1 && (
                  <span className="text-xs font-normal text-[#1B8A4A] ml-2">
                    · Save ${((product.prices?.[1] ?? 0) - pricePerMonth) * tier}/total
                  </span>
                )}
              </p>
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleGetStarted}
        size="lg"
        variant="primary"
        className="w-full rounded-full"
        disabled={!selected || loading}
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin mr-2" /> Preparing your order…</>
        ) : selected ? (
          <>Get Started with {products.find((p) => p.sku === selected)?.name} <ArrowRight size={18} className="ml-2" /></>
        ) : (
          "Select an option above to continue"
        )}
      </Button>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-5">
        {["Board-certified physician review", "No subscription required", "Cancel anytime"].map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
            <CheckCircle size={13} className="text-[#1B8A4A]" />
            {t}
          </div>
        ))}
      </div>
    </div>
    {conflict && (
      <CartConflictModal
        existingProgram={conflict.existingProgram}
        onKeep={dismissConflict}
        onReplace={conflict.onReplace}
      />
    )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────

export function FeminineHealthResultPage({
  outcome,
  concern,
  lifeStage,
  severity,
  preference,
  duration,
  locale,
}: Props) {
  const skus     = getSkus(outcome, preference);
  const products = skus.map((s) => FH_DISPLAY[s]).filter(Boolean);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* Top bar */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Physicians &bull; Your answers are kept completely confidential &bull; No judgment
      </div>

      {/* Badge */}
      <div className="text-center pt-8 pb-2">
        <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Based on Your Quiz Results
        </div>
      </div>

      <div className="py-8 px-4">
        <Container narrow>
          {products.length === 1 ? (
            <SingleRecommendation
              product={products[0]}
              reasoning={buildReasoning(products[0].sku, concern, lifeStage, severity, duration)}
              locale={locale}
              concern={concern}
              lifeStage={lifeStage}
              severity={severity}
              duration={duration}
            />
          ) : (
            <TwoOptionComparison
              products={products}
              locale={locale}
              concern={concern}
              lifeStage={lifeStage}
              severity={severity}
              duration={duration}
            />
          )}
        </Container>
      </div>

      {/* Doctor trust strip */}
      <div className="border-t border-[#E5E5E5] bg-[#F8F9FA] py-6 px-4 mt-4">
        <Container narrow>
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[#55575A] text-[13px]">
              <strong className="text-[#0C0D0F]">Dr. Linda Moleon, MD</strong> — Founder &amp; Medical Director · Double Board-Certified Anesthesiologist &amp; Obesity/Wellness Medicine · All prescriptions reviewed and signed by a licensed physician.
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
