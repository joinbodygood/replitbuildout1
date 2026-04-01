"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pill, ShieldCheck, Star, ExternalLink, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";

type Recommended = "appetite" | "metabolic" | "wegovy";

interface Props {
  locale: string;
  recommended: Recommended;
}

interface OralOption {
  id: Recommended;
  name: string;
  tagline: string;
  formulaLabel: string;
  mechanism: string;
  pros: string[];
  cons: string[];
  medsIncluded: boolean;
  pharmacyPrice: string | null;
  pharmacyNote: string | null;
  pharmacyUrl: string | null;
  accentColor: string;
  accentBg: string;
}

const ORAL_PRICES: Record<number, number> = { 1: 129, 3: 119, 6: 109 };

const DURATION_LABELS: Record<number, string> = {
  1: "Monthly",
  3: "3-Month Plan",
  6: "6-Month Plan",
};

const OPTIONS: OralOption[] = [
  {
    id: "appetite",
    name: "Glow Rx Appetite Control",
    tagline: "Metformin + Topiramate",
    formulaLabel: "Compounded capsules — once daily",
    mechanism: "Targets insulin resistance and appetite-regulating hormones to reduce hunger at the source.",
    pros: [
      "Medication included in monthly price",
      "No injections — oral capsule",
      "Addresses insulin resistance & PCOS",
      "Proven safety profile, widely studied",
    ],
    cons: [
      "Not a GLP-1 — different mechanism",
      "Gradual results vs. injectable GLP-1s",
    ],
    medsIncluded: true,
    pharmacyPrice: null,
    pharmacyNote: null,
    pharmacyUrl: null,
    accentColor: "#1B6B3A",
    accentBg: "#E8F5EE",
  },
  {
    id: "metabolic",
    name: "Glow Rx Metabolic Reset",
    tagline: "Low-Dose Naltrexone (LDN)",
    formulaLabel: "Compounded capsules — 4.5mg nightly",
    mechanism: "Targets the endorphin system to quiet cravings and reduce the inflammation that drives weight gain.",
    pros: [
      "Medication included in monthly price",
      "No injections — oral capsule",
      "Addresses emotional eating & cravings",
      "Well-tolerated, low side-effect profile",
    ],
    cons: [
      "Not a GLP-1 — different mechanism",
      "Gentler approach — not the highest % weight loss",
    ],
    medsIncluded: true,
    pharmacyPrice: null,
    pharmacyNote: null,
    pharmacyUrl: null,
    accentColor: "#7C3AED",
    accentBg: "#F5F0FF",
  },
  {
    id: "wegovy",
    name: "Oral Wegovy",
    tagline: "Oral semaglutide — once daily pill",
    formulaLabel: "FDA-approved brand-name — NovoCare",
    mechanism: "The same FDA-approved semaglutide as Wegovy injection — now in a once-daily pill. No needles, same proven GLP-1 efficacy.",
    pros: [
      "FDA-approved oral GLP-1 medication",
      "~15% avg weight loss in clinical trials",
      "No injections — once-daily pill",
      "Same active ingredient as Wegovy injection",
    ],
    cons: [
      "Medication cost paid separately at pharmacy",
      "Lower bioavailability than injectable form",
    ],
    medsIncluded: false,
    pharmacyPrice: "~$1,349",
    pharmacyNote: "/month list price at pharmacy",
    pharmacyUrl: "https://www.novocarepro.com/wegovy",
    accentColor: "#1B5CB8",
    accentBg: "#EEF4FF",
  },
];

export function OralRecommendationPage({ locale, recommended }: Props) {
  const router = useRouter();
  const { replaceMedPlan } = useCart();

  const [selectedDuration, setSelectedDuration] = useState<Record<string, number>>({
    appetite: 1,
    metabolic: 1,
  });

  function getMonthlyPrice(id: string): number {
    return ORAL_PRICES[selectedDuration[id] ?? 1] ?? 129;
  }

  function getTotalPrice(id: string): number {
    const dur = selectedDuration[id] ?? 1;
    return (ORAL_PRICES[dur] ?? 129) * dur;
  }

  function handleSelect(opt: OralOption) {
    if (opt.id === "wegovy") {
      router.push(`/${locale}/intake/branded-rx?med=wegovy-oral`);
      return;
    }
    const sku = opt.id === "appetite" ? "WM-ORAL-METCOMBO" : "WM-ORAL-LDN";
    const dur = selectedDuration[opt.id] ?? 1;
    const monthly = ORAL_PRICES[dur] ?? 129;
    const totalCents = monthly * dur * 100;
    replaceMedPlan({
      productId: sku,
      variantId: `${sku}-${dur}mo`,
      name: opt.name,
      variantLabel: `${opt.tagline} — ${DURATION_LABELS[dur]}`,
      price: totalCents,
      slug: opt.id === "appetite" ? "appetite-control" : "metabolic-reset",
      isMedPlan: true,
      monthlyPrice: monthly * 100,
      durationMonths: dur,
    });
    router.push(`/${locale}/cart/upsell?flow=oral`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Oral Medications Only &bull; No Injections Required
      </div>

      <div className="text-center pt-8 pb-6 px-5 max-w-[700px] mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#1B6B3A] text-[11px] font-semibold px-3.5 py-1 rounded-full mb-3">
          <Check size={12} strokeWidth={2.5} />
          Based on Your Quiz Results — Oral Medications
        </div>
        <h1
          className="text-[#0C0D0F] text-[22px] md:text-[28px] font-bold leading-snug mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Your 3 oral medication options
        </h1>
        <p className="text-[#55575A] text-[14px] leading-relaxed max-w-[560px] mx-auto">
          All options below are taken orally — no injections, ever. Choose the one that best matches
          your goal. One is highlighted as your quiz recommendation.
        </p>
      </div>

      <div className="max-w-[1050px] mx-auto px-4 pb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {OPTIONS.map((opt) => {
          const isRecommended = opt.id === recommended;
          const hasTiers = opt.medsIncluded;
          const dur = selectedDuration[opt.id] ?? 1;
          const monthly = hasTiers ? getMonthlyPrice(opt.id) : (opt.id === "wegovy" ? 55 : 129);
          const total = hasTiers ? getTotalPrice(opt.id) : null;

          return (
            <div
              key={opt.id}
              className={`relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-shadow ${
                isRecommended
                  ? "border-[color:var(--accent)] shadow-lg"
                  : "border-[#E5E5E5] shadow-sm hover:shadow-md"
              }`}
              style={{ "--accent": opt.accentColor } as React.CSSProperties}
            >
              {isRecommended && (
                <div
                  className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: opt.accentColor }}
                >
                  <Star size={9} fill="white" strokeWidth={0} />
                  Recommended for You
                </div>
              )}

              <div className="px-5 pt-5 pb-4" style={{ backgroundColor: opt.accentBg }}>
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3">
                  <Pill size={20} style={{ color: opt.accentColor }} />
                </div>
                <div
                  className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: opt.accentColor }}
                >
                  {opt.tagline}
                </div>
                <div className="text-[#0C0D0F] text-[17px] font-bold leading-tight">{opt.name}</div>
                <div className="text-[#55575A] text-[12px] mt-0.5">{opt.formulaLabel}</div>
              </div>

              <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-4">
                <p className="text-[12px] text-[#55575A] leading-relaxed">{opt.mechanism}</p>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B6B3A] mb-2">Pros</div>
                  <ul className="space-y-1.5">
                    {opt.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-[#0C0D0F] leading-snug">
                        <Check size={13} className="text-[#1B6B3A] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C0392B] mb-2">Cons</div>
                  <ul className="space-y-1.5">
                    {opt.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-[#55575A] leading-snug">
                        <X size={13} className="text-[#C0392B] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-3 border-t border-[#F0F0F0] space-y-2">

                  {hasTiers && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#55575A] mb-1.5">
                        Choose your plan
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {([1, 3, 6] as const).map((mo) => {
                          const isSelected = dur === mo;
                          return (
                            <button
                              key={mo}
                              onClick={() =>
                                setSelectedDuration((prev) => ({ ...prev, [opt.id]: mo }))
                              }
                              className={`flex flex-col items-center py-2 px-1 rounded-lg border-2 text-center transition-all ${
                                isSelected
                                  ? "border-[color:var(--accent)] bg-[color:var(--accent-bg)]"
                                  : "border-[#E5E5E5] hover:border-[#AAAAAA]"
                              }`}
                              style={
                                {
                                  "--accent": opt.accentColor,
                                  "--accent-bg": opt.accentBg,
                                } as React.CSSProperties
                              }
                            >
                              <span
                                className="text-[13px] font-bold"
                                style={{ color: isSelected ? opt.accentColor : "#0C0D0F" }}
                              >
                                ${ORAL_PRICES[mo]}/mo
                              </span>
                              <span className="text-[9px] text-[#55575A] leading-tight mt-0.5">
                                {mo === 1 ? "Monthly" : `${mo}-Mo Plan`}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {dur > 1 && (
                        <div className="text-[10px] text-[#55575A] mt-1 text-center">
                          Billed as ${total} total &bull; Save ${(129 - monthly) * dur}/total vs monthly
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-lg bg-[#E8F5EE] px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B6B3A] mb-0.5">
                      {opt.medsIncluded ? "Your monthly price" : "Body Good consultation fee"}
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[22px] font-bold text-[#0C0D0F]">${monthly}</span>
                      <span className="text-[11px] text-[#55575A]">
                        {opt.medsIncluded ? "/mo — medication included" : " one-time consultation fee"}
                      </span>
                    </div>
                    {opt.medsIncluded && (
                      <div className="inline-flex items-center gap-1 mt-1 bg-[#1B6B3A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <Package size={8} strokeWidth={2.5} />
                        MEDICATION INCLUDED
                      </div>
                    )}
                  </div>

                  {opt.pharmacyPrice && (
                    <div className="rounded-lg bg-[#F5F5F5] px-3 py-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#55575A] mb-0.5">
                        Medication cost (paid to pharmacy)
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[18px] font-bold text-[#0C0D0F]">{opt.pharmacyPrice}</span>
                        <span className="text-[11px] text-[#55575A]">{opt.pharmacyNote}</span>
                      </div>
                      {opt.pharmacyUrl && (
                        <a
                          href={opt.pharmacyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5"
                          style={{ color: opt.accentColor }}
                        >
                          <ExternalLink size={9} strokeWidth={2.5} />
                          Check NovoCare savings programs
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleSelect(opt)}
                    className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: opt.accentColor }}
                  >
                    {opt.id === "wegovy"
                      ? "Choose Oral Wegovy — $55 →"
                      : `Start ${opt.id === "appetite" ? "Appetite Control" : "Metabolic Reset"} — $${monthly}/mo →`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="max-w-[1050px] mx-auto px-4 pb-14">
        <div className="rounded-2xl bg-[#F8F8F8] border border-[#E5E5E5] px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-[#1B6B3A]" />
            <span className="text-[14px] font-bold text-[#0C0D0F]">How it works with Body Good Studio</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px] text-[#55575A]">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Choose your medication</div>
                Select the option above that matches your goal, then complete a short health intake form.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Board-certified doctor reviews</div>
                Dr. Moleon or a licensed physician reviews your intake form and approves your prescription.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Medication delivered or sent to pharmacy</div>
                Glow Rx products ship directly to you. Wegovy is sent to your preferred pharmacy.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#E5E5E5]">
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <ShieldCheck size={13} className="text-[#1B6B3A]" /> HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Check size={13} className="text-[#1B6B3A]" /> Board-Certified MDs
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Check size={13} className="text-[#1B6B3A]" /> 100% Oral — No Injections
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Star size={13} className="text-[#F59E0B]" fill="#F59E0B" /> 4.9 / 5 Rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
