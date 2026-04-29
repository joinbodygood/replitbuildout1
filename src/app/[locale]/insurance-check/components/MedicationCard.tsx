"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import type { MedicationResult } from "@/lib/insurance/confidence-engine";

const STATUS_PILL: Record<MedicationResult["status"], { label: string; bg: string; text: string }> = {
  high_probability: { label: "High Probability", bg: "bg-emerald-100", text: "text-emerald-800" },
  coverage_with_pa: { label: "Coverage with PA", bg: "bg-amber-100", text: "text-amber-800" },
  unlikely: { label: "Unlikely", bg: "bg-[#FDE7E7]", text: "text-[#ED1B1B]" },
  not_on_formulary: { label: "Not on Formulary", bg: "bg-neutral-100", text: "text-neutral-700" },
};

const FRESHNESS_LABEL: Record<MedicationResult["freshness"], string> = {
  real_time: "Real-time", fresh: "Fresh", recent: "Recent", estimated: "Estimated",
};

interface Props {
  med: MedicationResult;
  isFoundayo: boolean;
}

function ctaForCard(med: MedicationResult, isFoundayo: boolean, locale: string): { primaryLabel: string; primaryHref: string; secondaryLabel?: string; secondaryHref?: string } {
  const selfPay = `/${locale}/quiz/result/compounded`;
  const oral = `/${locale}/intake/glp1-oral`;
  const eligibility = `/${locale}/intake/insurance-eligibility`;

  if (isFoundayo && med.status === "not_on_formulary") {
    return {
      primaryLabel: "Get Foundayo for $25/mo with Lilly's savings card →",
      primaryHref: "https://www.lilly.com/foundayo",
      secondaryLabel: "See compounded oral GLP-1 alternatives",
      secondaryHref: oral,
    };
  }
  switch (med.status) {
    case "not_on_formulary":
      return { primaryLabel: "See self-pay options →", primaryHref: selfPay };
    case "unlikely":
      return {
        primaryLabel: "See self-pay options →", primaryHref: selfPay,
        secondaryLabel: "Want us to verify anyway? $25 →", secondaryHref: eligibility,
      };
    case "coverage_with_pa":
      return {
        primaryLabel: "Confirm coverage for $25 →", primaryHref: eligibility,
        secondaryLabel: "Or skip insurance — see self-pay", secondaryHref: selfPay,
      };
    case "high_probability":
      return {
        primaryLabel: "Fast-track confirmation — $25 →", primaryHref: eligibility,
        secondaryLabel: "Or skip insurance — see self-pay", secondaryHref: selfPay,
      };
  }
}

export default function MedicationCard({ med, isFoundayo }: Props) {
  const [open, setOpen] = useState(false);
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const pill = STATUS_PILL[med.status];
  const cta = ctaForCard(med, isFoundayo, locale);
  const probDisplay = med.status === "not_on_formulary" ? "Not covered" : `${med.probLow}–${med.probHigh}%`;
  const isNew = isFoundayo;

  return (
    <article className="bg-white rounded-2xl border border-neutral-200 p-6">
      <header className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900">{med.brand}</h3>
            {isNew && <span className="text-[10px] font-semibold tracking-wider text-white bg-[#ED1B1B] px-2 py-0.5 rounded-full">NEW</span>}
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{med.generic} · {med.manufacturer}</p>
          <p className="text-xs text-[#ED1B1B] font-semibold mt-1">{med.fdaIndicationLabel}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${pill.bg} ${pill.text}`}>{pill.label}</span>
          <div className="text-xl font-semibold text-neutral-900 mt-1">{probDisplay}</div>
          <div className="text-[10px] text-neutral-500">{FRESHNESS_LABEL[med.freshness]} data</div>
        </div>
      </header>

      {med.notes && (
        <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{med.notes}</p>
      )}

      <div className="text-xs text-neutral-700 mb-4">
        <span className="font-semibold">Recommended pathway: </span>
        <span className="capitalize">{med.recommendedIndication.replace("_", " ")}</span>
        {med.paRequired && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">PA REQUIRED</span>}
      </div>

      {med.paRequired && med.status !== "not_on_formulary" && (
        <div className="mb-4">
          <button onClick={() => setOpen(o => !o)} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900">
            {open ? "▾" : "▸"} Documentation needed for PA
          </button>
          {open && (
            <ul className="mt-2 space-y-1 pl-4 list-disc text-xs text-neutral-600">
              <li>BMI 30+ OR 27+ with comorbidity (T2D, hypertension, dyslipidemia, CV)</li>
              <li>3-month diet history</li>
              <li>Failed prior therapy documentation (if step therapy applies)</li>
              <li>Recent labs (A1c if T2D, lipid panel)</li>
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <a href={cta.primaryHref}
          className="inline-flex items-center justify-center bg-[#ED1B1B] hover:bg-[#D01818] text-white text-sm font-semibold px-5 py-3 rounded-full transition">
          {cta.primaryLabel}
        </a>
        {cta.secondaryLabel && cta.secondaryHref && (
          <a href={cta.secondaryHref} className="text-xs text-neutral-500 hover:text-neutral-900 text-center">{cta.secondaryLabel}</a>
        )}
      </div>
    </article>
  );
}
