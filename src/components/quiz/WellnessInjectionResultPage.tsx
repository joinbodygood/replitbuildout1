"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Truck,
  Syringe,
  Zap,
  Leaf,
  Flame,
  Dumbbell,
  Star,
  Moon,
  Package,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ─── Full product details ──────────────────────────────────────────────────

const PRODUCTS: Record<string, {
  sku: string;
  name: string;
  badge?: string;
  bestFor: string;
  description: string;
  long: string;
  price: number;
  price3mo?: number;
  supply: string;
  supply3mo?: string;
  concentration?: string;
  frequency: string;
  includes: string;
  benefitTags: string[];
  iconColor: string;
  pairsWell: string[];
  goals: string[];
}> = {
  "vitamin-b12": {
    sku: "WI-B12",
    name: "Vitamin B12 Injection",
    badge: "Budget-Friendly",
    bestFor: "Energy, metabolism & nerve function",
    description: "Medical-grade Methylcobalamin — the active, bioavailable B12 your body absorbs immediately.",
    long: "Vitamin B12 is essential for energy production, red blood cell formation, and nerve health. Many people are deficient without knowing it. Our injections use Methylcobalamin — the active form your body can use right away, far superior to the synthetic cyanocobalamin in cheap supplements. Patients commonly notice improved energy, better mood, and reduced brain fog within days.",
    price: 59,
    supply: "10mL vial (monthly)",
    concentration: "1mg/mL Methylcobalamin",
    frequency: "Weekly sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Energy Boost", "Metabolism", "Nerve Health", "Mood"],
    iconColor: "#06b6d4",
    pairsWell: ["Glutathione Injection", "Lipotropic Super B"],
    goals: ["energy", "immune"],
  },
  "lipo-c": {
    sku: "WI-LIPOC",
    name: "Lipo-C Injection",
    bestFor: "Fat burning & metabolic acceleration",
    description: "MIC + L-Carnitine + Thiamine — proven fat-burning lipotropic blend.",
    long: "Lipo-C combines the classic MIC formula (Methionine, Inositol, Choline) with L-Carnitine for enhanced fat transport into cells for energy, plus Thiamine for metabolic support. A step up from a basic lipotropic shot — designed to maximize fat metabolism, especially when paired with a diet or weight loss program.",
    price: 99,
    supply: "10mL vial (monthly)",
    concentration: "MIC + 200mg/mL L-Carnitine",
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Fat Burning", "Metabolism Boost", "MIC Formula"],
    iconColor: "#ef4444",
    pairsWell: ["L-Carnitine Injection", "Vitamin B12 Injection"],
    goals: ["fat-burning"],
  },
  "lipotropic-super-b": {
    sku: "WI-LSB",
    name: "Lipotropic Super B",
    badge: "Most Popular",
    bestFor: "Energy, fat-burning & metabolism",
    description: "11-ingredient powerhouse — B12, B-complex, L-Carnitine, and fat-burning lipotropics in one shot.",
    long: "Our most comprehensive energy injection. Lipotropic Super B combines Methionine, Inositol, and Choline with L-Carnitine, Methylcobalamin (B12), Niacin, Dexpanthenol, Pyridoxal 5-Phosphate, Riboflavin, and Thiamine. Patients feel the difference immediately. Supports fat metabolism, energy production, focus, and immune function all in one weekly shot.",
    price: 129,
    price3mo: 99,
    supply: "10mL vial (monthly)",
    supply3mo: "30mL vial — 3-month supply",
    frequency: "Weekly sub-Q injection",
    includes: "10mL or 30mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Energy & Metabolism", "Fat-Burning", "B-Vitamin Complex", "Immune Support"],
    iconColor: "#f59e0b",
    pairsWell: ["Glutathione Injection", "L-Carnitine Injection"],
    goals: ["energy", "fat-burning"],
  },
  "l-carnitine": {
    sku: "WI-LCAR",
    name: "L-Carnitine Injection",
    bestFor: "Fat burning & muscle preservation",
    description: "Amino acid that shuttles fat into cells for energy — workout support and body composition.",
    long: "L-Carnitine (Levocarnitine) plays a critical role in fat metabolism — it transports fatty acids into your mitochondria where they're burned for energy. During exercise or weight loss, L-Carnitine helps ensure your body burns fat, not muscle. Patients report better energy during workouts, faster recovery, and improved body composition.",
    price: 99,
    supply: "10mL vial (monthly)",
    concentration: "500mg/mL",
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Fat Burning", "Muscle Preservation", "Workout Recovery"],
    iconColor: "#f97316",
    pairsWell: ["Lipotropic Super B", "Sermorelin Injection"],
    goals: ["fat-burning", "athletic"],
  },
  "glutathione": {
    sku: "WI-GLUT",
    name: "Glutathione Injection",
    badge: "Detox & Skin",
    bestFor: "Detox, skin radiance & cellular health",
    description: "The \"master antioxidant\" — brightens skin, supports liver detox, and fights oxidative stress.",
    long: "Glutathione is the body's most powerful antioxidant, produced in every cell. It supports liver detox, cellular repair, and helps neutralize free radicals. Patients report brighter skin, more energy, and faster recovery. At 200mg/mL in a generous 30mL vial, our formulation provides consistent full-month support.",
    price: 149,
    supply: "30mL vial (monthly)",
    concentration: "200mg/mL",
    frequency: "2–3x per week sub-Q injection",
    includes: "30mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Detox Support", "Skin Radiance", "Antioxidant", "Cellular Health"],
    iconColor: "#10b981",
    pairsWell: ["Lipotropic Super B", "NAD+ Injection"],
    goals: ["detox-skin", "immune"],
  },
  "nad-plus": {
    sku: "WI-NAD",
    name: "NAD+ Injection",
    badge: "Premium",
    bestFor: "Anti-aging, brain & cellular energy",
    description: "Cellular energy coenzyme — 100mg/mL NAD+ for mitochondrial health, DNA repair, and longevity.",
    long: "NAD+ (Nicotinamide Adenine Dinucleotide) is essential for energy metabolism in every living cell. As we age, NAD+ levels decline — impairing energy, cognitive clarity, and cellular repair. Our injections restore NAD+ directly, supporting mitochondrial function, DNA repair, and metabolic efficiency. Patients report dramatically improved energy, mental clarity, and faster recovery.",
    price: 199,
    supply: "10mL vial (monthly)",
    concentration: "100mg/mL",
    frequency: "2–3x per week sub-Q injection",
    includes: "10mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Cellular Energy", "Anti-Aging", "Mental Clarity", "Longevity"],
    iconColor: "#8b5cf6",
    pairsWell: ["Sermorelin Injection", "Glutathione Injection"],
    goals: ["anti-aging", "energy"],
  },
  "sermorelin": {
    sku: "WI-SERM",
    name: "Sermorelin Injection",
    badge: "Peptide",
    bestFor: "Sleep, recovery & muscle preservation",
    description: "Growth hormone peptide — stimulates your body's own GH for better sleep, recovery, and muscle.",
    long: "Sermorelin is a growth hormone releasing peptide (GHRP) that stimulates your pituitary to produce more of your own natural growth hormone. Unlike synthetic HGH, Sermorelin works with your body's natural feedback systems. It helps maintain muscle mass during weight loss, dramatically improves sleep quality, and speeds recovery. At 1.5mg/mL, our formulation is at the therapeutic sweet spot.",
    price: 179,
    supply: "6mL vial (monthly)",
    concentration: "1.5mg/mL",
    frequency: "Daily sub-Q injection at bedtime",
    includes: "6mL vial, syringes, needles, alcohol swabs",
    benefitTags: ["Sleep & Recovery", "Muscle Preservation", "Anti-Aging", "GH Peptide"],
    iconColor: "#6366f1",
    pairsWell: ["NAD+ Injection", "L-Carnitine Injection"],
    goals: ["sleep-stress", "anti-aging", "athletic"],
  },
};

const ICON_MAP: Record<string, React.ElementType> = {
  "vitamin-b12":        Zap,
  "lipo-c":             Flame,
  "lipotropic-super-b": Zap,
  "l-carnitine":        Dumbbell,
  "glutathione":        Leaf,
  "nad-plus":           Star,
  "sermorelin":         Moon,
};

const GOAL_LABELS: Record<string, string> = {
  "energy":       "Energy & Fatigue",
  "detox-skin":   "Detox & Skin Health",
  "fat-burning":  "Fat Burning & Metabolism",
  "athletic":     "Athletic Performance & Recovery",
  "anti-aging":   "Anti-Aging & Longevity",
  "immune":       "Immune Support",
  "sleep-stress": "Sleep & Stress",
};

interface Props {
  handle: string;
  locale: string;
  goal?: string;
  budget?: string;
  experience?: string;
}

export function WellnessInjectionResultPage({ handle, locale, goal, budget, experience }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [selected3mo, setSelected3mo] = useState(false);

  const product = PRODUCTS[handle];

  if (!product) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#55575A] mb-4">Product not found.</p>
          <Link href={`/${locale}/wellness-injections`} className="text-brand-red underline">
            View all wellness injections
          </Link>
        </div>
      </section>
    );
  }

  const Icon = ICON_MAP[handle] ?? Syringe;
  const price = selected3mo && product.price3mo ? product.price3mo : product.price;
  const supply = selected3mo && product.supply3mo ? product.supply3mo : product.supply;
  const noInjectionPreferred = experience === "no-prefer";

  function handleAddToCart() {
    setLoading(true);
    const durationMonths = selected3mo ? 3 : 1;
    addItem({
      productId: product.sku,
      variantId: `${product.sku}-${durationMonths}mo`,
      name: product.name,
      variantLabel: `${durationMonths}-month supply`,
      price: price * 100,
      slug: handle,
      isMedPlan: true,
      monthlyPrice: price * 100,
      durationMonths,
    });
    router.push(`/${locale}/checkout`);
  }

  return (
    <section className="bg-white min-h-[80vh] py-12">
      <Container narrow>
        <div className="max-w-xl mx-auto">

          {/* ── HEADER BADGE ── */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1B8A4A] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <CheckCircle2 size={12} />
              Based on Your Quiz Results
            </div>
          </div>

          {/* ── PRODUCT HEADER ── */}
          <div className="text-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${product.iconColor}18` }}
            >
              <Icon size={26} style={{ color: product.iconColor }} />
            </div>

            {product.badge && (
              <span className="inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3" style={{ backgroundColor: "#0C0D0F" }}>
                {product.badge}
              </span>
            )}

            <h1
              className="text-[#0C0D0F] text-3xl md:text-4xl font-bold mb-2 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {product.name}
            </h1>
            <p className="text-[#55575A] text-sm flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-brand-red" />
              Best for:{" "}
              <span className="text-brand-red font-medium">{product.bestFor}</span>
            </p>
          </div>

          {/* ── GOAL MATCH SUMMARY ── */}
          <div className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl p-5 mb-6">
            {goal && GOAL_LABELS[goal] && (
              <p className="text-[#55575A] text-[12px] uppercase tracking-wider font-semibold mb-2">
                Your goal: {GOAL_LABELS[goal]}
              </p>
            )}
            <p className="text-[#0C0D0F] text-[14px] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* ── NO-INJECTION NOTE ── */}
          {noInjectionPreferred && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-[13px] leading-relaxed">
                <strong>Note:</strong> All wellness injectables are subcutaneous (just under the skin) — the same technique used for insulin, very easy to learn. We include a full injection guide and our care team is available to walk you through it.
              </p>
            </div>
          )}

          {/* ── BENEFIT TAGS ── */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.benefitTags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-[#55575A] bg-[#F8F9FA] border border-[#E5E5E5] px-3 py-1.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* ── PRICING ── */}
          <div className="border-2 border-brand-red/20 rounded-2xl overflow-hidden mb-6">
            <div className="bg-brand-red/5 px-6 pt-6 pb-4 border-b border-brand-red/10">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-[#55575A] text-lg font-medium">$</span>
                <span
                  className="text-[#0C0D0F] text-6xl font-bold"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {price}
                </span>
                <span className="text-[#55575A] text-base font-medium">/mo</span>
              </div>
              <p className="text-[#55575A] text-[13px] text-center">{supply}</p>

              {/* Duration toggle */}
              {product.price3mo && (
                <div className="flex gap-2 mt-4 justify-center">
                  <button
                    onClick={() => setSelected3mo(false)}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all ${
                      !selected3mo
                        ? "border-brand-red bg-brand-red text-white"
                        : "border-[#E5E5E5] text-[#55575A] hover:border-brand-red/40"
                    }`}
                  >
                    1-Month
                  </button>
                  <button
                    onClick={() => setSelected3mo(true)}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold border-2 transition-all ${
                      selected3mo
                        ? "border-brand-red bg-brand-red text-white"
                        : "border-[#E5E5E5] text-[#55575A] hover:border-brand-red/40"
                    }`}
                  >
                    3-Month{" "}
                    <span className={selected3mo ? "text-white/80" : "text-[#1B8A4A]"}>
                      (Save ${(product.price - product.price3mo) * 3}/mo)
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* What's included */}
            <div className="px-6 py-5">
              <p className="text-[10px] uppercase tracking-widest text-[#55575A] font-semibold mb-3">
                What&apos;s included
              </p>
              <ul className="space-y-2.5 mb-4">
                {[
                  product.includes,
                  product.concentration ? `Concentration: ${product.concentration}` : null,
                  `Usage: ${product.frequency}`,
                  "Full injection guide + how-to instructions",
                ].filter(Boolean).map((item) => (
                  <li key={item!} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[#1B8A4A] flex-shrink-0 mt-0.5" />
                    <span className="text-[#0C0D0F] text-[13px]">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Shipping notice */}
              <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl px-4 py-3">
                <Truck size={14} className="text-[#55575A] flex-shrink-0" />
                <p className="text-[#55575A] text-[12px]">
                  Ships via <strong className="text-[#0C0D0F]">UPS Overnight</strong> directly to your door.
                  Shipping: <strong className="text-[#0C0D0F]">$24</strong> (or $15 for TX/OK).
                </p>
              </div>
            </div>
          </div>

          {/* ── CLINICAL DESCRIPTION ── */}
          <div className="mb-6">
            <h2
              className="text-[#0C0D0F] font-bold text-[14px] mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Full clinical description
            </h2>
            <p className="text-[#55575A] text-[13px] leading-relaxed">{product.long}</p>
          </div>

          {/* ── PAIRS WELL WITH ── */}
          {product.pairsWell.length > 0 && (
            <div className="mb-8">
              <p
                className="text-[#0C0D0F] font-bold text-[14px] mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Pairs well with
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.pairsWell.map((p) => (
                  <span
                    key={p}
                    className="text-xs font-medium text-brand-red bg-brand-red/10 border border-brand-red/20 px-3 py-1.5 rounded-full"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          <div className="mb-5">
            <Button
              onClick={handleAddToCart}
              disabled={loading}
              size="lg"
              variant="primary"
              className="w-full rounded-full text-base font-semibold"
            >
              {loading
                ? "Adding to cart…"
                : `Add to Cart — $${price}/mo`}
            </Button>
          </div>

          {/* ── TRUST BADGES ── */}
          <div className="flex items-center justify-center gap-5 flex-wrap mb-6">
            {[
              { icon: ShieldCheck, label: "HIPAA Compliant" },
              { icon: Package,     label: "Supplies included" },
              { icon: Lock,        label: "Secure checkout" },
            ].map(({ icon: IcoC, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[#55575A] text-[11px]">
                <IcoC size={13} className="text-[#1B8A4A]" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* ── VIEW ALL LINK ── */}
          <div className="text-center">
            <Link
              href={`/${locale}/wellness-injections`}
              className="inline-flex items-center gap-1.5 text-[#55575A] text-[13px] hover:text-brand-red transition-colors"
            >
              Browse all wellness injections <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
