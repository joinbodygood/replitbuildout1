"use client";

import { useState } from "react";
import { MapPin, ExternalLink, Tag, Info } from "lucide-react";

// Maps BGS product slug → GoodRx drug slug for direct landing pages
const GOODRX_SLUG_MAP: Record<string, string> = {
  // ── Branded GLP-1 (Weight Loss) ──────────────────────────────────────────
  "branded-glp1-rx":       "ozempic",
  "branded-rx-management": "ozempic",
  "ins-wegovy-injection":  "wegovy",
  "ins-wegovy-pill":       "rybelsus",
  "ins-ozempic":           "ozempic",
  "ins-mounjaro":          "mounjaro",
  "ins-zepbound":          "zepbound",
  "sp-ozempic":            "ozempic",
  "sp-wegovy":             "wegovy",
  "sp-mounjaro":           "mounjaro",
  "sp-zepbound-vial":      "zepbound",
  "sp-rybelsus":           "rybelsus",
  // ── Hair Loss ─────────────────────────────────────────────────────────────
  "hair-restore-starter-women": "minoxidil",
  "hair-restore-topical-women": "minoxidil",
  "hair-restore-plus-women":    "minoxidil",
  "hair-restore-rx-men":        "finasteride",
  "hair-restore-combo-men":     "finasteride",
  "dutasteride-rx-men":         "dutasteride",
  // ── Skincare ──────────────────────────────────────────────────────────────
  "hormonal-acne-rx":      "spironolactone",
  // ── Feminine Health ───────────────────────────────────────────────────────
  "uti-rx":                "nitrofurantoin",
  "yeast-infection-rx":    "fluconazole",
  "bv-rx":                 "metronidazole",
  "vaginal-dryness-estradiol": "estradiol",
};

// Human-readable display names for each GoodRx slug
const DRUG_DISPLAY_NAMES: Record<string, string> = {
  ozempic:         "Ozempic (semaglutide)",
  wegovy:          "Wegovy (semaglutide)",
  rybelsus:        "Rybelsus (semaglutide oral)",
  mounjaro:        "Mounjaro (tirzepatide)",
  zepbound:        "Zepbound (tirzepatide)",
  minoxidil:       "Minoxidil",
  finasteride:     "Finasteride",
  dutasteride:     "Dutasteride",
  spironolactone:  "Spironolactone",
  nitrofurantoin:  "Nitrofurantoin",
  fluconazole:     "Fluconazole",
  metronidazole:   "Metronidazole",
  estradiol:       "Estradiol",
};

type Props = {
  productSlug: string;
  fccMedicationName: string | null;
  locale: string;
};

export function GoodRxPriceCheck({ productSlug, fccMedicationName, locale }: Props) {
  const isEs = locale === "es";
  const [zip, setZip] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  // Resolve GoodRx drug slug
  const goodrxSlug =
    GOODRX_SLUG_MAP[productSlug] ??
    fccMedicationName?.toLowerCase().replace(/\s+/g, "-") ??
    null;

  if (!goodrxSlug) return null;

  const displayName = DRUG_DISPLAY_NAMES[goodrxSlug] ?? fccMedicationName ?? goodrxSlug;

  function buildGoodRxUrl() {
    const base = `https://www.goodrx.com/${goodrxSlug}`;
    const params = new URLSearchParams();
    if (zip.trim().length === 5) params.set("location", zip.trim());
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function handleCheck() {
    window.open(buildGoodRxUrl(), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="rounded-xl border border-[#00AC4F]/30 bg-[#F0FDF4] p-5 mt-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          {/* GoodRx wordmark pill */}
          <span className="inline-flex items-center gap-1 bg-[#00AC4F] text-white text-xs font-extrabold px-2.5 py-1 rounded-full tracking-wide">
            <Tag size={10} />
            GoodRx
          </span>
          <span className="font-heading font-semibold text-gray-800 text-sm">
            {isEs ? "Verificar precio en farmacias locales" : "Check price at local pharmacies"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((s) => !s)}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          aria-label="What is GoodRx?"
        >
          <Info size={16} />
        </button>
      </div>

      {/* Info tooltip */}
      {showInfo && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-[#00AC4F]/20 text-xs text-gray-600 leading-relaxed">
          {isEs
            ? "GoodRx es una herramienta gratuita que muestra precios de medicamentos en farmacias locales. Los precios pueden variar. Esto es solo para referencia — el precio final depende de tu farmacia y seguro."
            : "GoodRx is a free tool that shows medication prices at local pharmacies. Prices may vary. This is for reference only — your final price depends on your pharmacy and insurance."}
        </div>
      )}

      {/* Drug name */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-lg border border-gray-100">
        <span className="text-xs text-gray-500 font-medium shrink-0">
          {isEs ? "Medicamento:" : "Medication:"}
        </span>
        <span className="text-sm font-semibold text-gray-800">{displayName}</span>
      </div>

      {/* Zip + CTA */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            placeholder={isEs ? "Código ZIP (opcional)" : "ZIP code (optional)"}
            className="w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-[#00AC4F] focus:outline-none bg-white transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleCheck}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#00AC4F] hover:bg-[#009944] text-white text-sm font-bold transition-colors whitespace-nowrap"
        >
          {isEs ? "Ver Precios" : "Check Prices"}
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        {isEs
          ? "Los precios de GoodRx son estimados y pueden diferir del precio final en tu farmacia. Body Good Studio no está afiliado con GoodRx."
          : "GoodRx prices are estimates and may differ from your pharmacy's final price. Body Good Studio is not affiliated with GoodRx."}
      </p>
    </div>
  );
}
