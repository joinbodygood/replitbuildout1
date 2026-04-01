"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Leaf,
  Flame,
  Dumbbell,
  Star,
  Moon,
  Sparkles,
  ArrowRight,
  X,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ─── Price lookup (monthly rates per tier) ────────────────────────────────

const MONTHLY_PRICES: Record<string, Record<number, number>> = {
  "vitamin-b12":        { 1: 59,  3: 49,  6: 39  },
  "lipo-c":             { 1: 99,  3: 79,  6: 69  },
  "lipotropic-super-b": { 1: 129, 3: 99,  6: 89  },
  "l-carnitine":        { 1: 99,  3: 79,  6: 69  },
  "glutathione":        { 1: 149, 3: 119, 6: 99  },
  "nad-plus":           { 1: 199, 3: 169, 6: 149 },
  "sermorelin":         { 1: 179, 3: 149, 6: 129 },
  "pentadeca-arginate": { 1: 179, 3: 149, 6: 129 },
  "ascorbic-acid":      { 1: 79,  3: 65,  6: 55  },
};

const SKUS: Record<string, string> = {
  "vitamin-b12":        "WI-B12",
  "lipo-c":             "WI-LIPOC",
  "lipotropic-super-b": "WI-LSB",
  "l-carnitine":        "WI-LCAR",
  "glutathione":        "WI-GLUT",
  "nad-plus":           "WI-NAD",
  "sermorelin":         "WI-SERM",
  "pentadeca-arginate": "WI-PA",
  "ascorbic-acid":      "WI-VitC",
};

const PRODUCT_NAMES: Record<string, string> = {
  "vitamin-b12":        "Methylcobalamin (B12) Injectable",
  "lipo-c":             "Lipo-C Injectable",
  "lipotropic-super-b": "Lipotropic Super B Injectable",
  "l-carnitine":        "Levocarnitine Injectable",
  "glutathione":        "Glutathione Injectable",
  "nad-plus":           "NAD+ Injectable",
  "sermorelin":         "Sermorelin Injectable",
  "pentadeca-arginate": "Pentadeca Arginate Injectable",
  "ascorbic-acid":      "Ascorbic Acid Injectable",
};

const ICON_MAP: Record<string, React.ElementType> = {
  "vitamin-b12":        Zap,
  "lipotropic-super-b": Zap,
  "lipo-c":             Flame,
  "l-carnitine":        Dumbbell,
  "glutathione":        Leaf,
  "nad-plus":           Star,
  "sermorelin":         Moon,
  "pentadeca-arginate": Sparkles,
  "ascorbic-acid":      ShieldCheck,
};

const ICON_COLORS: Record<string, string> = {
  "vitamin-b12":        "#06b6d4",
  "lipotropic-super-b": "#f59e0b",
  "lipo-c":             "#ef4444",
  "l-carnitine":        "#f97316",
  "glutathione":        "#10b981",
  "nad-plus":           "#8b5cf6",
  "sermorelin":         "#6366f1",
  "pentadeca-arginate": "#0ea5e9",
  "ascorbic-acid":      "#f59e0b",
};

// ─── Bundle definitions ────────────────────────────────────────────────────

interface BundleDef {
  name: string;
  tagline: string;
  partnerHandle: string;
  partnerBenefit: string;
}

const UPSELL_BUNDLES: Record<string, BundleDef> = {
  "vitamin-b12": {
    name: "Energy & Immune Bundle",
    tagline: "Pair B12's neurological energy boost with Glutathione's master-antioxidant detox — the inside-out combination.",
    partnerHandle: "glutathione",
    partnerBenefit: "Detox, skin radiance & cellular protection",
  },
  "lipotropic-super-b": {
    name: "Metabolism Boost Bundle",
    tagline: "Add L-Carnitine to Lipotropic Super B for the most powerful fat-burning duo we offer — lipotropics plus direct mitochondrial fat transport.",
    partnerHandle: "l-carnitine",
    partnerBenefit: "Direct fat transport into mitochondria",
  },
  "lipo-c": {
    name: "Fat Burn Stack",
    tagline: "Add L-Carnitine to Lipo-C for dual-mechanism fat burning — MIC formula plus direct cellular fat transport.",
    partnerHandle: "l-carnitine",
    partnerBenefit: "Direct fat transport into mitochondria",
  },
  "l-carnitine": {
    name: "Fat Burn Stack",
    tagline: "Add Lipotropic Super B to L-Carnitine for B-vitamins, MIC formula, and metabolic support that amplifies fat burning.",
    partnerHandle: "lipotropic-super-b",
    partnerBenefit: "B-complex, MIC formula & metabolic boost",
  },
  "glutathione": {
    name: "Detox + Glow Bundle",
    tagline: "Add Ascorbic Acid (Vitamin C) to supercharge Glutathione's detox and skin effects — they work synergistically.",
    partnerHandle: "ascorbic-acid",
    partnerBenefit: "High-dose Vitamin C for immune & collagen",
  },
  "nad-plus": {
    name: "Anti-Aging Essentials Bundle",
    tagline: "Pair NAD+'s cellular energy restoration with Glutathione's antioxidant protection — the two most important molecules for longevity.",
    partnerHandle: "glutathione",
    partnerBenefit: "Master antioxidant & cellular protection",
  },
  "sermorelin": {
    name: "Recovery & Performance Bundle",
    tagline: "Add L-Carnitine to Sermorelin's sleep and GH support — burn more fat and preserve muscle simultaneously.",
    partnerHandle: "l-carnitine",
    partnerBenefit: "Fat burning & muscle preservation",
  },
  "pentadeca-arginate": {
    name: "Athletic Recovery Bundle",
    tagline: "Add L-Carnitine to Pentadeca Arginate — accelerate recovery AND maximize fat oxidation during training.",
    partnerHandle: "l-carnitine",
    partnerBenefit: "Fat oxidation & muscle energy",
  },
  "ascorbic-acid": {
    name: "Immune Shield Bundle",
    tagline: "Pair high-dose Vitamin C with Glutathione — the body's two most powerful antioxidant and immune-defense molecules together.",
    partnerHandle: "glutathione",
    partnerBenefit: "Master antioxidant & detox support",
  },
};

const DISCOUNT_PCT = 15;

// ─── Props ────────────────────────────────────────────────────────────────

interface Props {
  handle: string;
  tier: number;
  locale: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function WellnessInjectionUpsell({ handle, tier, locale }: Props) {
  const router = useRouter();
  const { replaceFlow } = useCart();
  const [actionLoading, setActionLoading] = useState<"bundle" | "skip" | null>(null);

  // ── Main product values ──
  const mainName    = PRODUCT_NAMES[handle] ?? handle;
  const mainMonthly = MONTHLY_PRICES[handle]?.[tier] ?? 0;
  const mainTotal   = mainMonthly * tier;
  const mainSku     = SKUS[handle] ?? handle;
  const MainIcon    = ICON_MAP[handle] ?? Zap;
  const mainColor   = ICON_COLORS[handle] ?? "#ed1b1b";
  const tierLabel   = tier === 1 ? "1-month" : tier === 3 ? "3-month" : "6-month";

  // ── Bundle lookup ──
  const bundle        = UPSELL_BUNDLES[handle];
  const hasBundle     = Boolean(bundle);

  // ── Partner values (only meaningful when hasBundle is true) ──
  const partnerHandle  = bundle?.partnerHandle ?? "";
  const partnerName    = PRODUCT_NAMES[partnerHandle] ?? partnerHandle;
  const partnerMonthly = MONTHLY_PRICES[partnerHandle]?.[tier] ?? 0;
  const partnerTotal   = partnerMonthly * tier;
  const partnerSku     = SKUS[partnerHandle] ?? partnerHandle;
  const PartnerIcon    = ICON_MAP[partnerHandle] ?? Zap;
  const partnerColor   = ICON_COLORS[partnerHandle] ?? "#ed1b1b";

  // ── Pricing math ──
  const individualMonthly = mainMonthly + partnerMonthly;
  const individualTotal   = mainTotal + partnerTotal;
  const bundleMonthly     = Math.round(individualMonthly * (1 - DISCOUNT_PCT / 100));
  const bundleTotal       = Math.round(individualTotal   * (1 - DISCOUNT_PCT / 100));
  const savingsMonthly    = individualMonthly - bundleMonthly;
  const savingsTotal      = individualTotal   - bundleTotal;

  // Proportional discount split
  const mainBundleMonthly    = Math.round(mainMonthly    * (1 - DISCOUNT_PCT / 100));
  const partnerBundleMonthly = bundleMonthly - mainBundleMonthly;
  const mainBundleTotal      = mainBundleMonthly    * tier;
  const partnerBundleTotal   = partnerBundleMonthly * tier;

  // ── If no bundle for this handle, go straight to checkout ──
  useEffect(() => {
    if (!hasBundle) {
      replaceFlow("wellness-injection", [{
        productId:      mainSku,
        variantId:      `${mainSku}-${tier}mo`,
        name:           mainName,
        variantLabel:   `${tier}-month supply`,
        price:          mainTotal * 100,
        slug:           handle,
        isMedPlan:      true,
        monthlyPrice:   mainMonthly * 100,
        durationMonths: tier,
      }]);
      router.push(`/${locale}/checkout`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBundle]);

  if (!hasBundle) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#55575A] text-sm">Preparing your checkout…</p>
      </section>
    );
  }

  function handleAddBundle() {
    setActionLoading("bundle");
    replaceFlow("wellness-injection", [
      {
        productId:      mainSku,
        variantId:      `${mainSku}-${tier}mo-bundle`,
        name:           mainName,
        variantLabel:   `${tier}-month supply (bundle)`,
        price:          mainBundleTotal * 100,
        slug:           handle,
        isMedPlan:      true,
        monthlyPrice:   mainBundleMonthly * 100,
        durationMonths: tier,
      },
      {
        productId:      partnerSku,
        variantId:      `${partnerSku}-${tier}mo-bundle`,
        name:           partnerName,
        variantLabel:   `${tier}-month supply (bundle)`,
        price:          partnerBundleTotal * 100,
        slug:           partnerHandle,
        isMedPlan:      true,
        monthlyPrice:   partnerBundleMonthly * 100,
        durationMonths: tier,
      },
    ]);
    router.push(`/${locale}/checkout`);
  }

  function handleSkip() {
    setActionLoading("skip");
    replaceFlow("wellness-injection", [{
      productId:      mainSku,
      variantId:      `${mainSku}-${tier}mo`,
      name:           mainName,
      variantLabel:   `${tier}-month supply`,
      price:          mainTotal * 100,
      slug:           handle,
      isMedPlan:      true,
      monthlyPrice:   mainMonthly * 100,
      durationMonths: tier,
    }]);
    router.push(`/${locale}/checkout`);
  }

  return (
    <section className="min-h-[80vh] bg-[#F8F9FA] py-12">
      <Container narrow>
        <div className="max-w-lg mx-auto">

          {/* ── BADGE ── */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[#FFF3CD] text-[#92600A] text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-[#F0C040]">
              <Tag size={12} />
              Special Bundle Offer
            </div>
          </div>

          {/* ── HEADLINE ── */}
          <div className="text-center mb-8">
            <h1
              className="text-[#0C0D0F] text-2xl md:text-3xl font-bold mb-2 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              One perfect complement to your order
            </h1>
            <p className="text-[#55575A] text-sm">
              Customers who add this pairing see significantly better results.
            </p>
          </div>

          {/* ── YOUR ORDER SUMMARY ── */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 mb-5">
            <p className="text-[10px] uppercase tracking-widest text-[#55575A] font-semibold mb-3">
              Your current order
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${mainColor}18` }}
              >
                <MainIcon size={18} style={{ color: mainColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#0C0D0F] font-semibold text-[13px] leading-snug truncate">
                  {mainName}
                </p>
                <p className="text-[#55575A] text-[11px]">{tierLabel} supply</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#0C0D0F] font-bold text-[15px]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  ${mainMonthly}
                  <span className="text-[#55575A] text-[11px] font-normal">/mo</span>
                </p>
                <p className="text-[#55575A] text-[10px]">${mainTotal} total</p>
              </div>
            </div>
          </div>

          {/* ── BUNDLE OFFER CARD ── */}
          <div className="bg-white border-2 border-brand-red/25 rounded-2xl overflow-hidden mb-5 shadow-sm">

            {/* Header */}
            <div className="bg-gradient-to-r from-brand-red/6 to-transparent px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-red font-bold mb-1">
                    Bundle &amp; Save {DISCOUNT_PCT}%
                  </p>
                  <h2
                    className="text-[#0C0D0F] text-[18px] font-bold leading-tight"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {bundle.name}
                  </h2>
                </div>
                <div className="bg-[#1B8A4A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                  Save ${savingsMonthly}/mo
                </div>
              </div>
              <p className="text-[#55575A] text-[12px] mt-2 leading-relaxed">
                {bundle.tagline}
              </p>
            </div>

            {/* Products breakdown */}
            <div className="px-5 py-4 space-y-3">

              {/* Main product */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${mainColor}18` }}
                >
                  <MainIcon size={15} style={{ color: mainColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0C0D0F] text-[12px] font-semibold leading-snug truncate">
                    {mainName}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={10} className="text-[#1B8A4A] flex-shrink-0" />
                    <p className="text-[#1B8A4A] text-[10px] font-medium">Already in your order</p>
                  </div>
                </div>
                <p className="text-[#0C0D0F] text-[13px] font-bold flex-shrink-0">
                  ${mainMonthly}
                  <span className="text-[10px] font-normal text-[#55575A]">/mo</span>
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <span className="text-[10px] text-[#55575A] font-semibold uppercase tracking-wider">+ Add</span>
                <div className="flex-1 h-px bg-[#E5E5E5]" />
              </div>

              {/* Partner product */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${partnerColor}18` }}
                >
                  <PartnerIcon size={15} style={{ color: partnerColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0C0D0F] text-[12px] font-semibold leading-snug truncate">
                    {partnerName}
                  </p>
                  <p className="text-[#55575A] text-[10px]">{bundle.partnerBenefit}</p>
                </div>
                <p className="text-[#0C0D0F] text-[13px] font-bold flex-shrink-0">
                  ${partnerMonthly}
                  <span className="text-[10px] font-normal text-[#55575A]">/mo</span>
                </p>
              </div>

              {/* Price comparison */}
              <div className="border-t border-[#E5E5E5] pt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[#55575A] text-[11px]">If purchased separately:</p>
                  <p className="text-[#55575A] text-[12px] line-through font-medium">
                    ${individualMonthly}/mo
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[#0C0D0F] font-bold text-[13px]">Bundle price:</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#1B8A4A] text-[10px] font-semibold bg-[#E8F5EE] px-2 py-0.5 rounded-full">
                      Save ${savingsTotal} total
                    </span>
                    <p className="text-[#0C0D0F] font-bold text-[18px]" style={{ fontFamily: "Poppins, sans-serif" }}>
                      ${bundleMonthly}
                      <span className="text-[#55575A] text-[11px] font-normal">/mo</span>
                    </p>
                  </div>
                </div>
                <p className="text-[#55575A] text-[10px] text-right">
                  ${bundleTotal} charged for {tierLabel} supply
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
              <Button
                onClick={handleAddBundle}
                disabled={actionLoading !== null}
                size="lg"
                variant="primary"
                className="w-full rounded-full font-semibold"
              >
                <span className="flex items-center justify-center gap-2">
                  {actionLoading === "bundle"
                    ? "Adding bundle…"
                    : <>Add Bundle — ${bundleMonthly}/mo <ArrowRight size={15} /></>}
                </span>
              </Button>
              <p className="text-center text-[#55575A] text-[10px] mt-1.5">
                {tierLabel} supply · ${bundleTotal} total · {DISCOUNT_PCT}% off both products
              </p>
            </div>
          </div>

          {/* ── SKIP ── */}
          <div className="text-center">
            <button
              onClick={handleSkip}
              disabled={actionLoading !== null}
              className="inline-flex items-center gap-1.5 text-[#55575A] text-[13px] hover:text-[#0C0D0F] transition-colors disabled:opacity-50"
            >
              {actionLoading === "skip"
                ? "Continuing…"
                : <><X size={13} />No thanks, just {mainName} — ${mainMonthly}/mo</>}
            </button>
          </div>

        </div>
      </Container>
    </section>
  );
}
