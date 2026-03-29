"use client";

import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";

interface Props {
  locale: string;
}

const CONDITIONS = [
  {
    sku: "FH-UTI",
    label: "Urinary Tract Infection (UTI)",
    symptoms: ["Burning with urination", "Frequent urge to urinate", "Cloudy or strong-smelling urine", "Pelvic pressure or pain"],
    timeframe: "Ready in hours",
    color: "#1A6EED",
    bg: "#EBF2FF",
  },
  {
    sku: "FH-YEAST",
    label: "Yeast Infection",
    symptoms: ["Itching or irritation", "Thick white discharge", "Burning during sex or urination", "Redness or swelling"],
    timeframe: "Ready in hours",
    color: "#1B8A4A",
    bg: "#E8F5EE",
  },
  {
    sku: "FH-BV",
    label: "Bacterial Vaginosis (BV)",
    symptoms: ["Thin, gray or white discharge", "Fishy odor (especially after sex)", "Itching or burning", "Mild vaginal discomfort"],
    timeframe: "Ready in hours",
    color: "#ED1B1B",
    bg: "#FDE7E7",
  },
];

export function InfectionPickerPage({ locale }: Props) {
  const router = useRouter();

  function pick(sku: string) {
    router.push(`/${locale}/quiz/recommendation?sku=${sku}`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* TOP BAR */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Licensed in 20 States &bull; Same-Day Treatment
      </div>

      {/* HERO */}
      <div className="text-center pt-8 pb-6 px-5 max-w-[580px] mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#EBF2FF] text-[#1A6EED] text-[11px] font-semibold px-3.5 py-1 rounded-full mb-3">
          <AlertCircle size={12} strokeWidth={2.5} />
          Based on Your Quiz Results
        </div>
        <h1
          className="text-[#0C0D0F] text-[22px] md:text-[26px] font-bold leading-snug mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Which infection are you treating?
        </h1>
        <p className="text-[#55575A] text-[14px] leading-relaxed">
          A board-certified doctor will review your symptoms and send a prescription to your local
          pharmacy — often same day. $35 consult fee. Medication paid at pharmacy (insurance
          accepted).
        </p>
      </div>

      {/* CONDITION CARDS */}
      <div className="max-w-[640px] mx-auto px-4 pb-10 space-y-4">
        {CONDITIONS.map((c) => (
          <button
            key={c.sku}
            onClick={() => pick(c.sku)}
            className="w-full text-left border-2 border-[#E5E5E5] hover:border-[#0C0D0F] rounded-2xl p-5 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3
                  className="text-[#0C0D0F] font-bold text-[16px] mb-0.5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {c.label}
                </h3>
                <div
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{ color: c.color, background: c.bg }}
                >
                  <AlertCircle size={10} />
                  {c.timeframe}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[13px] transition-all duration-200 group-hover:scale-110"
                style={{ background: c.color, fontFamily: "Poppins, sans-serif" }}
              >
                →
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {c.symptoms.map((s) => (
                <div key={s} className="flex items-start gap-1.5 text-[12px] text-[#55575A]">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: c.bg }}
                  >
                    <Check size={8} strokeWidth={3} style={{ color: c.color }} />
                  </div>
                  {s}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-[640px] mx-auto px-4 pb-8 text-[11px] text-[#AAAAAA] text-center leading-relaxed">
        The $35 consult fee covers your doctor review and e-prescription. Medication costs are
        separate and paid at your pharmacy. Insurance often covers the medication.
      </div>
    </div>
  );
}
