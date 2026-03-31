"use client";

import { useRouter } from "next/navigation";
import { Check, X, Pill, Syringe, FlaskConical, Pen, ExternalLink, ShieldCheck, Star } from "lucide-react";

interface Props {
  locale: string;
}

interface BrandOption {
  id: string;
  badge?: string;
  badgeColor?: string;
  brand: "wegovy" | "zepbound";
  brandColor: string;
  brandBg: string;
  icon: React.ReactNode;
  name: string;
  formFactor: string;
  formFactorSub: string;
  pros: string[];
  cons: string[];
  priceLabel: string;
  priceNote: string;
  sourceLabel: string;
  sourceUrl: string;
  intakePref: string;
}

const OPTIONS: BrandOption[] = [
  {
    id: "wegovy-oral",
    brand: "wegovy",
    brandColor: "#1B5CB8",
    brandBg: "#EEF4FF",
    icon: <Pill size={22} className="text-[#1B5CB8]" />,
    name: "Wegovy",
    formFactor: "Oral Pill",
    formFactorSub: "Once-daily oral semaglutide",
    pros: [
      "No injections — swallow a pill",
      "Discreet and easy to carry",
      "Same FDA-approved active ingredient as Wegovy injection",
      "Ideal for needle-averse patients",
    ],
    cons: [
      "Must be taken on an empty stomach",
      "Lower bioavailability than injectable form",
      "Newer formulation — less long-term data",
    ],
    priceLabel: "~$1,349",
    priceNote: "/month list price",
    sourceLabel: "NovoCare",
    sourceUrl: "https://www.novocarepro.com/wegovy",
    intakePref: "wegovy-oral",
  },
  {
    id: "wegovy-injection",
    badge: "Most Data",
    badgeColor: "#1B5CB8",
    brand: "wegovy",
    brandColor: "#1B5CB8",
    brandBg: "#EEF4FF",
    icon: <Syringe size={22} className="text-[#1B5CB8]" />,
    name: "Wegovy",
    formFactor: "Injection",
    formFactorSub: "Once-weekly auto-injector pen",
    pros: [
      "5+ years of clinical safety data",
      "~15% avg weight loss in pivotal trials",
      "Once-weekly injection — easy to maintain",
      "Auto-injector pen — no needles to handle",
    ],
    cons: [
      "Requires a weekly self-injection",
      "Must be refrigerated",
    ],
    priceLabel: "~$1,349",
    priceNote: "/month list price",
    sourceLabel: "NovoCare",
    sourceUrl: "https://www.novonordisk-us.com/patients/wegovy.html",
    intakePref: "wegovy-injection",
  },
  {
    id: "zepbound-vial",
    badge: "Best Value",
    badgeColor: "#7C3AED",
    brand: "zepbound",
    brandColor: "#7C3AED",
    brandBg: "#F5F0FF",
    icon: <FlaskConical size={22} className="text-[#7C3AED]" />,
    name: "Zepbound",
    formFactor: "Single-Dose Vials",
    formFactorSub: "Self-drawn tirzepatide — Lilly Direct",
    pros: [
      "Lowest out-of-pocket cost available",
      "Available directly from Eli Lilly (no middleman)",
      "Same dual GLP-1 + GIP active ingredient as pens",
      "Flexible dosing — 2.5mg to 15mg vials",
    ],
    cons: [
      "Requires drawing medication with a syringe",
      "More steps than a pre-filled pen",
      "Must be refrigerated",
    ],
    priceLabel: "From $349",
    priceNote: "/month (Lilly Direct)",
    sourceLabel: "Lilly Direct",
    sourceUrl: "https://www.zepbound.lilly.com/self-pay",
    intakePref: "zepbound-vial",
  },
  {
    id: "zepbound-pen",
    badge: "Most Popular",
    badgeColor: "#7C3AED",
    brand: "zepbound",
    brandColor: "#7C3AED",
    brandBg: "#F5F0FF",
    icon: <Pen size={22} className="text-[#7C3AED]" />,
    name: "Zepbound",
    formFactor: "QwikPen",
    formFactorSub: "Pre-filled auto-injector tirzepatide",
    pros: [
      "Pre-filled pen — no prep or drawing required",
      "Click-and-go auto-injector, once weekly",
      "Dual GLP-1 + GIP — up to 22.5% weight loss in trials",
      "Same medication as Zepbound vial, more convenient",
    ],
    cons: [
      "Higher cost than vial option",
      "Requires a weekly self-injection",
    ],
    priceLabel: "~$1,060",
    priceNote: "/month list price",
    sourceLabel: "Eli Lilly",
    sourceUrl: "https://www.zepbound.lilly.com",
    intakePref: "zepbound-pen",
  },
];

export function BrandedCashPayPage({ locale }: Props) {
  const router = useRouter();

  function handleChoose(pref: string) {
    router.push(`/${locale}/intake/branded-rx?med=${pref}`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* TOP BAR */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Licensed in 20 States &bull; Free Shipping
      </div>

      {/* HERO */}
      <div className="text-center pt-8 pb-6 px-5 max-w-[700px] mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#1B8A4A] text-[11px] font-semibold px-3.5 py-1 rounded-full mb-3">
          <Check size={12} strokeWidth={2.5} />
          Based on Your Quiz Results
        </div>
        <h1
          className="text-[#0C0D0F] text-[22px] md:text-[28px] font-bold leading-snug mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Compare all 4 brand-name options
        </h1>
        <p className="text-[#55575A] text-[14px] leading-relaxed max-w-[560px] mx-auto">
          All are FDA-approved GLP-1 medications. Review the pros, cons, and out-of-pocket costs
          from the manufacturer — then pick the one that fits your life.
        </p>
      </div>

      {/* COMPARISON GRID */}
      <div className="max-w-[1100px] mx-auto px-4 pb-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className="relative flex flex-col rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Badge */}
            {opt.badge && (
              <div
                className="absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: opt.badgeColor }}
              >
                {opt.badge}
              </div>
            )}

            {/* Brand color header */}
            <div className="px-5 pt-5 pb-4" style={{ backgroundColor: opt.brandBg }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: "white" }}
              >
                {opt.icon}
              </div>
              <div
                className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: opt.brandColor }}
              >
                {opt.name}
              </div>
              <div className="text-[#0C0D0F] text-[17px] font-bold leading-tight">
                {opt.formFactor}
              </div>
              <div className="text-[#55575A] text-[12px] mt-0.5">{opt.formFactorSub}</div>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-4">
              {/* Pros */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B8A4A] mb-2">
                  Pros
                </div>
                <ul className="space-y-1.5">
                  {opt.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-[#0C0D0F] leading-snug">
                      <Check size={13} className="text-[#1B8A4A] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C0392B] mb-2">
                  Cons
                </div>
                <ul className="space-y-1.5">
                  {opt.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-[#55575A] leading-snug">
                      <X size={13} className="text-[#C0392B] mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div className="mt-auto pt-3 border-t border-[#F0F0F0]">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-[22px] font-bold text-[#0C0D0F]">{opt.priceLabel}</span>
                  <span className="text-[12px] text-[#55575A]">{opt.priceNote}</span>
                </div>
                <a
                  href={opt.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold mb-3"
                  style={{ color: opt.brandColor }}
                >
                  <ExternalLink size={10} strokeWidth={2.5} />
                  Pricing from {opt.sourceLabel}
                </a>

                <button
                  onClick={() => handleChoose(opt.intakePref)}
                  className="w-full py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: opt.brandColor }}
                >
                  Choose {opt.name} {opt.formFactor} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS FOOTER */}
      <div className="max-w-[900px] mx-auto px-4 pb-14">
        <div className="rounded-2xl bg-[#F8F8F8] border border-[#E5E5E5] px-6 py-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={18} className="text-[#1B8A4A]" />
            <span className="text-[14px] font-bold text-[#0C0D0F]">How it works with Body Good Studio</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px] text-[#55575A]">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Choose your medication above</div>
                Select your preferred brand and form factor, then complete a short intake form.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Board-certified doctor reviews your info</div>
                Dr. Moleon or a licensed physician reviews your intake form. <strong>$55 one-time fee.</strong>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0C0D0F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="font-semibold text-[#0C0D0F] mb-0.5">Prescription sent to your pharmacy</div>
                You fill your Rx at your preferred pharmacy using your insurance or self-pay pricing above.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#E5E5E5]">
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <ShieldCheck size={13} className="text-[#1B8A4A]" /> HIPAA Compliant
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Check size={13} className="text-[#1B8A4A]" /> Board-Certified MDs
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Star size={13} className="text-[#F59E0B]" fill="#F59E0B" /> 4.9 / 5 Rating
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#55575A]">
              <Check size={13} className="text-[#1B8A4A]" /> Insurance may cover your meds at pharmacy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
