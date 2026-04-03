"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

// ═══════════════════════════════════════════════════════
// BODY GOOD — "What Are My Odds?" Coverage Quiz v2.0
// Phase 1: Basic quiz → Phase 2: Boost questions → Phase 3: Roadmap results
// ═══════════════════════════════════════════════════════

const B = {
  red: "#ED1B1B", pink: "#FDE7E7", black: "#0C0D0F", white: "#FFFFFF",
  light: "#FAF9F7", cream: "#F5F3EF", mid: "#E5E5E5", gray: "#55575A",
  dark: "#444", green: "#1B8A4A", greenLight: "#E8F5EE",
  amber: "#F59E0B", amberLight: "#FFFBEB",
  blue: "#1A6EED", blueLight: "#EBF2FF",
  redLight: "#FDE7E7",
};

const font = "'Manrope', sans-serif";
const fontHead = "'Poppins', sans-serif";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

type IndicationData = {
  prob: [number, number];
  pa: boolean;
  notes: string;
};

type CarrierDatabase = Record<string, IndicationData>;

type BoostItem = { label: string; points: number; icon: string };
type RoadmapItem = { type: "green" | "blue" | "amber"; label: string };

type MedResult = {
  prob: number;
  indication: string;
  indicationLabel: string;
  note: string;
  pa: boolean;
  boosts: BoostItem[];
  roadmap: RoadmapItem[];
};

type QuizResults = {
  medications: Record<string, MedResult>;
  bestMedication: string;
  bestProbability: number;
  overallRating: "green" | "yellow" | "red";
  overallLabel: string;
};

type Phase = "landing" | "quiz" | "initial_results" | "boost" | "email" | "results";

type Answers = {
  insurer: string;
  planType: string;
  employerSize: string;
  state: string;
  diagnoses: string[];
  bmiRange: string;
};

type BoostAnswers = {
  priorMeds: string[];
  lifestyleProgram: string;
  labWork: string[];
  weightDuration: string;
  additionalConditions: string[];
  tricarePlan: string;
};

// ═══════════════════════════════════════════════════════
// CARRIER COVERAGE DATA (research-verified v2 database)
// ═══════════════════════════════════════════════════════

const CARRIER_DATA: Record<string, CarrierDatabase> = {
  cigna: {
    wegovy_weight_loss: { prob: [35, 50], pa: true, notes: "PA required. Express Scripts PBM. $200/mo cost cap if plan covers." },
    wegovy_cv: { prob: [60, 75], pa: true, notes: "Strongest pathway with documented CVD + BMI 27+." },
    zepbound_weight_loss: { prob: [30, 45], pa: true, notes: "Best major PBM for Zepbound access." },
    zepbound_osa: { prob: [40, 55], pa: true, notes: "OSA pathway. Sleep study required." },
    mounjaro_t2d: { prob: [85, 92], pa: true, notes: "Preferred formulary for T2D." },
    ozempic_t2d: { prob: [85, 92], pa: false, notes: "Preferred formulary for T2D." },
  },
  aetna: {
    wegovy_weight_loss: { prob: [30, 45], pa: true, notes: "CVS Caremark preferred GLP-1 for weight management." },
    wegovy_cv: { prob: [55, 70], pa: true, notes: "CV indication strengthens approval." },
    zepbound_weight_loss: { prob: [5, 10], pa: true, notes: "EXCLUDED from CVS Caremark formulary. Near-zero chance." },
    zepbound_osa: { prob: [10, 20], pa: true, notes: "Excluded from formulary. Exception-only." },
    mounjaro_t2d: { prob: [85, 92], pa: true, notes: "T2D coverage strong." },
    ozempic_t2d: { prob: [85, 92], pa: false, notes: "T2D coverage strong." },
  },
  uhc: {
    wegovy_weight_loss: { prob: [25, 40], pa: true, notes: "Depends on employer plan election." },
    wegovy_cv: { prob: [60, 75], pa: true, notes: "OptumRx added Wegovy as preferred for CV indication." },
    zepbound_weight_loss: { prob: [20, 35], pa: true, notes: "Plan-dependent. Not on standard formulary." },
    zepbound_osa: { prob: [40, 55], pa: true, notes: "OSA pathway active per UHC policy." },
    mounjaro_t2d: { prob: [85, 95], pa: true, notes: "Preferred formulary for T2D." },
    ozempic_t2d: { prob: [85, 95], pa: false, notes: "Preferred formulary for T2D." },
  },
  humana: {
    wegovy_weight_loss: { prob: [5, 10], pa: false, notes: "Benefit exclusion. Obesity codes auto-rejected at pharmacy." },
    wegovy_cv: { prob: [30, 40], pa: true, notes: "CV indication may work as different benefit category." },
    zepbound_weight_loss: { prob: [5, 10], pa: false, notes: "Benefit exclusion. Auto-rejected." },
    zepbound_osa: { prob: [35, 50], pa: true, notes: "OSA pathway available." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage intact." },
    ozempic_t2d: { prob: [80, 90], pa: false, notes: "T2D coverage intact." },
  },
  bcbs_fl: {
    wegovy_weight_loss: { prob: [20, 35], pa: true, notes: "Requires employer obesity medication rider." },
    wegovy_cv: { prob: [45, 60], pa: true, notes: "CV indication pathway. Better odds." },
    zepbound_weight_loss: { prob: [15, 25], pa: true, notes: "CVS Caremark removed Zepbound. Rider + exception needed." },
    zepbound_osa: { prob: [30, 45], pa: true, notes: "OSA pathway may work." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage intact." },
    ozempic_t2d: { prob: [80, 90], pa: false, notes: "T2D coverage intact." },
  },
  bcbs_fep: {
    wegovy_weight_loss: { prob: [40, 55], pa: true, notes: "One of the strongest federal programs for GLP-1 access." },
    wegovy_cv: { prob: [60, 75], pa: true, notes: "CV indication strong pathway." },
    zepbound_weight_loss: { prob: [35, 50], pa: true, notes: "FEP Blue Focus: Tier 2." },
    zepbound_osa: { prob: [45, 60], pa: true, notes: "OSA pathway available." },
    mounjaro_t2d: { prob: [85, 95], pa: true, notes: "Standard T2D coverage." },
    ozempic_t2d: { prob: [85, 95], pa: false, notes: "Standard T2D coverage." },
  },
  tricare: {
    wegovy_weight_loss: { prob: [45, 60], pa: true, notes: "Prime/Select: Covered with PA + step therapy." },
    wegovy_cv: { prob: [60, 75], pa: true, notes: "CV risk reduction recognized. Prime/Select only." },
    zepbound_weight_loss: { prob: [40, 55], pa: true, notes: "Brand formulary Tier 2 — cheaper copay than Wegovy." },
    zepbound_osa: { prob: [50, 65], pa: true, notes: "OSA pathway. Sleep study required. Prime/Select only." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "Covered for ALL TRICARE plans including For Life." },
    ozempic_t2d: { prob: [80, 90], pa: true, notes: "Covered for ALL TRICARE plans including For Life." },
  },
  tricare_tfl: {
    wegovy_weight_loss: { prob: [0, 0], pa: false, notes: "EXCLUDED since Aug 2025 for TRICARE For Life." },
    wegovy_cv: { prob: [0, 0], pa: false, notes: "EXCLUDED for TFL." },
    zepbound_weight_loss: { prob: [0, 0], pa: false, notes: "EXCLUDED since Aug 2025." },
    zepbound_osa: { prob: [0, 0], pa: false, notes: "EXCLUDED for TFL." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D medications STILL covered for TFL." },
    ozempic_t2d: { prob: [80, 90], pa: true, notes: "T2D medications STILL covered for TFL." },
  },
  va: {
    wegovy_weight_loss: { prob: [40, 55], pa: true, notes: "Requires MOVE! program participation." },
    wegovy_cv: { prob: [55, 70], pa: true, notes: "CV indication pathway. MACE prevention covered." },
    zepbound_weight_loss: { prob: [25, 35], pa: true, notes: "Limited. OSA pathway better." },
    zepbound_osa: { prob: [45, 60], pa: true, notes: "OSA pathway available." },
    mounjaro_t2d: { prob: [85, 95], pa: true, notes: "VA formulary T2D coverage." },
    ozempic_t2d: { prob: [85, 95], pa: true, notes: "VA formulary T2D coverage." },
  },
  medicare: {
    wegovy_weight_loss: { prob: [0, 0], pa: false, notes: "Statutory exclusion. Bridge Program launches July 2026." },
    wegovy_cv: { prob: [55, 70], pa: true, notes: "CV risk reduction covered by many Part D plans." },
    zepbound_weight_loss: { prob: [0, 0], pa: false, notes: "Statutory exclusion. Bridge July 2026." },
    zepbound_osa: { prob: [40, 55], pa: true, notes: "OSA indication covered by some Part D plans." },
    mounjaro_t2d: { prob: [85, 95], pa: true, notes: "Standard Part D benefit for T2D." },
    ozempic_t2d: { prob: [85, 95], pa: true, notes: "Standard Part D benefit for T2D." },
  },
  kaiser: {
    wegovy_weight_loss: { prob: [15, 30], pa: true, notes: "Restrictive. Requires Kaiser weight management program." },
    wegovy_cv: { prob: [45, 60], pa: true, notes: "CV indication better pathway." },
    zepbound_weight_loss: { prob: [10, 20], pa: true, notes: "Very restricted." },
    zepbound_osa: { prob: [30, 45], pa: true, notes: "OSA pathway." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "Internal formulary coverage." },
    ozempic_t2d: { prob: [80, 90], pa: false, notes: "Internal formulary coverage." },
  },
  medicaid_ny: {
    wegovy_weight_loss: { prob: [75, 90], pa: false, notes: "Most generous state. No PA required." },
    zepbound_weight_loss: { prob: [70, 85], pa: false, notes: "Same generous coverage." },
    mounjaro_t2d: { prob: [85, 95], pa: false, notes: "No PA required." },
    ozempic_t2d: { prob: [85, 95], pa: false, notes: "No PA required." },
  },
  medicaid_il: {
    wegovy_weight_loss: { prob: [5, 10], pa: true, notes: "Weight loss NOT covered. T2D only." },
    zepbound_weight_loss: { prob: [5, 10], pa: true, notes: "Weight loss NOT covered." },
    mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage with PA." },
    ozempic_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage with PA." },
  },
  medicaid_fl: {
    wegovy_weight_loss: { prob: [0, 5], pa: false, notes: "Weight loss meds non-covered under FL Medicaid." },
    zepbound_weight_loss: { prob: [0, 5], pa: false, notes: "Not covered." },
    mounjaro_t2d: { prob: [65, 80], pa: true, notes: "Limited T2D coverage through MCO." },
    ozempic_t2d: { prob: [75, 85], pa: true, notes: "T2D coverage through MCO." },
  },
  medicaid_ca: {
    wegovy_weight_loss: { prob: [0, 3], pa: false, notes: "Eliminated Jan 2026." },
    wegovy_cv: { prob: [45, 60], pa: true, notes: "CV indication still covered." },
    zepbound_weight_loss: { prob: [0, 3], pa: false, notes: "Not covered." },
    zepbound_osa: { prob: [35, 50], pa: true, notes: "OSA may still be covered." },
    mounjaro_t2d: { prob: [75, 85], pa: true, notes: "T2D only." },
    ozempic_t2d: { prob: [80, 90], pa: false, notes: "T2D coverage." },
  },
};

const GENERIC_BCBS: CarrierDatabase = {
  wegovy_weight_loss: { prob: [18, 30], pa: true, notes: "Requires employer obesity medication rider." },
  wegovy_cv: { prob: [40, 55], pa: true, notes: "CV indication may still be covered." },
  zepbound_weight_loss: { prob: [12, 22], pa: true, notes: "Depends on PBM." },
  zepbound_osa: { prob: [28, 42], pa: true, notes: "OSA pathway may work." },
  mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage intact." },
  ozempic_t2d: { prob: [80, 90], pa: false, notes: "T2D coverage intact." },
};

const GENERIC_CARRIER: CarrierDatabase = {
  wegovy_weight_loss: { prob: [20, 38], pa: true, notes: "Coverage varies by plan." },
  wegovy_cv: { prob: [45, 60], pa: true, notes: "CV pathway may be available." },
  zepbound_weight_loss: { prob: [15, 30], pa: true, notes: "Coverage varies." },
  zepbound_osa: { prob: [30, 45], pa: true, notes: "OSA pathway may be available." },
  mounjaro_t2d: { prob: [80, 90], pa: true, notes: "T2D coverage generally available." },
  ozempic_t2d: { prob: [80, 90], pa: false, notes: "T2D coverage generally available." },
};

const MANDATE_STATES: Record<string, number> = { CT: 10, DE: 8, MD: 10, NJ: 8, VT: 8, WV: 8 };
const RESTRICTED_MEDICAID = ["FL", "TX", "CA", "PA", "MI", "NH"];
const EMPLOYER_MODS: Record<string, number> = {
  large_5000_plus: 1.15, medium_500_4999: 1.0, small_under_500: 0.7,
  government_federal: 1.2, government_state: 0.9, self_employed: 0.6, marketplace_aca: 0.5,
};

const CARRIER_MAP: Record<string, string> = {
  "aetna": "aetna", "anthem blue cross blue shield": "aetna",
  "cigna": "cigna", "florida blue (bcbs fl)": "bcbs_fl",
  "humana": "humana", "kaiser permanente": "kaiser",
  "unitedhealthcare": "uhc", "umr": "uhc", "tricare": "tricare",
  "va health": "va", "medicare": "medicare",
  "bcbs federal employee program (fep)": "bcbs_fep",
};

// ═══════════════════════════════════════════════════════
// PROBABILITY ENGINE v2 — Table-driven + Boost system
// ═══════════════════════════════════════════════════════

function resolveCarrier(insurer: string, planType: string, state: string, tricarePlan: string): string | null {
  const ins = (insurer || "").toLowerCase();
  if (planType === "tricare") {
    if (tricarePlan === "tfl") return "tricare_tfl";
    return "tricare";
  }
  if (planType === "va") return "va";
  if (planType === "bcbs_fep") return "bcbs_fep";
  if (planType === "medicare") return "medicare";
  if (planType === "medicaid") {
    if (state === "NY") return "medicaid_ny";
    if (state === "IL") return "medicaid_il";
    if (state === "FL") return "medicaid_fl";
    if (state === "CA") return "medicaid_ca";
    if (RESTRICTED_MEDICAID.includes(state)) return "medicaid_fl";
    return null;
  }
  const key = CARRIER_MAP[ins];
  if (key !== undefined) return key;
  if (ins.includes("cigna")) return "cigna";
  if (ins.includes("aetna") || ins.includes("anthem")) return "aetna";
  if (ins.includes("united") || ins.includes("uhc")) return "uhc";
  if (ins.includes("humana")) return "humana";
  if (ins.includes("kaiser")) return "kaiser";
  if (ins.includes("florida blue")) return "bcbs_fl";
  if (ins.includes("fep") || ins.includes("federal employee")) return "bcbs_fep";
  if (ins.includes("bcbs") || ins.includes("blue cross") || ins.includes("blue shield")) return null;
  return null;
}

function getCarrierData(carrierKey: string | null, insurer: string): CarrierDatabase {
  if (carrierKey && CARRIER_DATA[carrierKey]) return CARRIER_DATA[carrierKey];
  const ins = (insurer || "").toLowerCase();
  if (ins.includes("bcbs") || ins.includes("blue cross") || ins.includes("blue shield") ||
      ins.includes("anthem") || ins.includes("carefirst") || ins.includes("horizon") ||
      ins.includes("empire") || ins.includes("independence")) return GENERIC_BCBS;
  return GENERIC_CARRIER;
}

function buildRoadmap(
  _med: string,
  indication: string,
  data: IndicationData,
  answers: Answers,
  boostAnswers: BoostAnswers,
  hasStepTherapy: boolean,
  boosts: BoostItem[]
): RoadmapItem[] {
  const items: RoadmapItem[] = [];
  const { lifestyleProgram } = boostAnswers;

  boosts.forEach(b => items.push({ type: "green", label: b.label }));
  if (answers.diagnoses.includes("obesity")) items.push({ type: "green", label: "BMI qualifies for coverage criteria" });

  items.push({ type: "blue", label: "Insurance benefit verification" });
  if (data.pa) items.push({ type: "blue", label: "Prior authorization submission" });
  items.push({ type: "blue", label: "Letter of medical necessity from Dr. Linda" });
  if (indication === "cv") items.push({ type: "blue", label: "CV risk reduction documentation" });
  if (indication === "osa") items.push({ type: "blue", label: "OSA pathway documentation" });

  const userSelectedNoMeds = boostAnswers.priorMeds.includes("none");
  if (!hasStepTherapy && !userSelectedNoMeds) {
    items.push({ type: "amber", label: "Prior weight loss medication history strengthens your case" });
  }
  if (!lifestyleProgram || lifestyleProgram === "none") {
    items.push({ type: "amber", label: "Documented lifestyle modification efforts improve approval odds" });
  }

  return items;
}

function calculateProbability(answers: Answers, boostAnswers: BoostAnswers): QuizResults {
  const { state, insurer, planType, employerSize, diagnoses } = answers;
  const { priorMeds = [], lifestyleProgram, labWork = [], weightDuration, additionalConditions = [], tricarePlan } = boostAnswers;
  const hasDx = (id: string) => diagnoses.includes(id) || additionalConditions.includes(id);

  const carrierKey = resolveCarrier(insurer, planType, state, tricarePlan);
  const carrier = getCarrierData(carrierKey, insurer);

  const meds: Record<string, MedResult> = {};

  (["wegovy", "zepbound", "mounjaro", "ozempic"] as const).forEach((med) => {
    let indication: string, indicationLabel: string, key: string;
    if (med === "wegovy") {
      if (hasDx("cvd")) { indication = "cv"; indicationLabel = "CV Risk Reduction"; key = "wegovy_cv"; }
      else { indication = "weight_loss"; indicationLabel = "Weight Management"; key = "wegovy_weight_loss"; }
    } else if (med === "zepbound") {
      if (hasDx("osa")) { indication = "osa"; indicationLabel = "Obstructive Sleep Apnea (FDA-approved)"; key = "zepbound_osa"; }
      else { indication = "weight_loss"; indicationLabel = "Weight Management"; key = "zepbound_weight_loss"; }
    } else if (med === "mounjaro") {
      if (hasDx("t2d")) { indication = "t2d"; indicationLabel = "Type 2 Diabetes (FDA-approved)"; key = "mounjaro_t2d"; }
      else if (hasDx("prediabetes") || hasDx("metabolic") || hasDx("insulin_resistance")) { indication = "prediabetes"; indicationLabel = "Metabolic / Prediabetes (physician advocacy)"; key = "mounjaro_t2d"; }
      else { indication = "weight_loss"; indicationLabel = "Not FDA-approved for weight loss"; key = "mounjaro_t2d"; }
    } else {
      if (hasDx("t2d")) { indication = "t2d"; indicationLabel = "Type 2 Diabetes (FDA-approved)"; key = "ozempic_t2d"; }
      else { indication = "weight_loss"; indicationLabel = "Not approved for weight loss"; key = "ozempic_t2d"; }
    }

    const data = carrier[key] || GENERIC_CARRIER[key] || { prob: [10, 25] as [number, number], pa: true, notes: "" };
    let low = data.prob[0], high = data.prob[1];

    if (low === 0 && high <= 5) {
      meds[med] = { prob: Math.round((low + high) / 2), indication, indicationLabel, note: data.notes, pa: data.pa, boosts: [], roadmap: [] };
      return;
    }

    if (planType === "employer" && employerSize) {
      const mod = EMPLOYER_MODS[employerSize] || 1.0;
      low = Math.round(low * mod); high = Math.round(high * mod);
    }

    if (planType === "employer" && MANDATE_STATES[state] && employerSize !== "large_5000_plus" && employerSize !== "government_federal") {
      low += MANDATE_STATES[state]; high += MANDATE_STATES[state];
    }

    let dxBoost = 0;
    if (indication !== "cv" && hasDx("cvd")) dxBoost += 5;
    if (indication !== "osa" && hasDx("osa")) dxBoost += 5;
    if (indication !== "t2d" && hasDx("t2d")) dxBoost += 8;
    if (hasDx("obesity")) dxBoost += 3;
    if (hasDx("pcos")) dxBoost += 2;
    if (hasDx("metabolic") && indication !== "prediabetes") dxBoost += 3;
    if (hasDx("hypertension")) dxBoost += 4;
    if (hasDx("high_cholesterol")) dxBoost += 3;
    if (hasDx("fatty_liver")) dxBoost += 4;
    if (hasDx("joint_pain")) dxBoost += 2;
    if (hasDx("snoring")) dxBoost += 5;
    low += dxBoost; high += dxBoost;

    const boosts: BoostItem[] = [];

    const stepTherapyMeds = ["phentermine", "contrave", "qsymia", "saxenda", "metformin"];
    const hasStepTherapy = priorMeds.some(m => stepTherapyMeds.includes(m));
    const hasAnyPriorMed = priorMeds.length > 0 && !priorMeds.includes("none");
    if (hasStepTherapy) {
      const stBoost = priorMeds.filter(m => stepTherapyMeds.includes(m)).length >= 2 ? 18 : 14;
      low += stBoost; high += stBoost;
      boosts.push({ label: "Prior weight loss medication", points: stBoost, icon: "check" });
    } else if (hasAnyPriorMed) {
      low += 6; high += 6;
      boosts.push({ label: "Prior medication history", points: 6, icon: "check" });
    }

    if (lifestyleProgram === "supervised") {
      low += 12; high += 12;
      boosts.push({ label: "Supervised diet/exercise program", points: 12, icon: "check" });
    } else if (lifestyleProgram === "self") {
      low += 6; high += 6;
      boosts.push({ label: "Self-directed weight loss efforts", points: 6, icon: "check" });
    }

    if (labWork.includes("a1c") && !hasDx("t2d") && !hasDx("prediabetes")) {
      low += 5; high += 5;
      boosts.push({ label: "A1C / blood sugar on file", points: 5, icon: "check" });
    }
    if (labWork.includes("sleep_study") && !hasDx("osa") && med === "zepbound") {
      low += 8; high += 8;
      boosts.push({ label: "Sleep study on file", points: 8, icon: "check" });
    }
    if (labWork.includes("lipid_panel")) {
      low += 3; high += 3;
      boosts.push({ label: "Cholesterol / lipid panel on file", points: 3, icon: "check" });
    }
    if (labWork.includes("bp_on_file")) {
      low += 2; high += 2;
      boosts.push({ label: "Blood pressure documented", points: 2, icon: "check" });
    }

    if (weightDuration === "3_plus_years") {
      low += 8; high += 8;
      boosts.push({ label: "3+ years managing weight", points: 8, icon: "check" });
    } else if (weightDuration === "1_3_years") {
      low += 5; high += 5;
      boosts.push({ label: "1-3 years managing weight", points: 5, icon: "check" });
    } else if (weightDuration === "6mo_1yr") {
      low += 3; high += 3;
      boosts.push({ label: "6+ months managing weight", points: 3, icon: "check" });
    }

    low = Math.min(95, Math.max(0, low));
    high = Math.min(95, Math.max(0, high));
    let prob = Math.round((low + high) / 2);

    if (med === "mounjaro" && !hasDx("t2d") && !hasDx("prediabetes") && !hasDx("metabolic") && !hasDx("insulin_resistance")) {
      prob = Math.min(prob, 15);
    } else if (med === "mounjaro" && hasDx("prediabetes") && !hasDx("t2d")) {
      prob = Math.min(prob, 62);
    }
    if (med === "ozempic" && !hasDx("t2d")) {
      prob = Math.min(prob, 5);
    }

    const roadmap = buildRoadmap(med, indication, data, answers, boostAnswers, hasStepTherapy, boosts);

    let note = data.notes;
    if (med === "wegovy" && hasDx("cvd")) note = "Your heart disease history opens a strong coverage pathway that works even on plans excluding weight loss.";
    else if (med === "zepbound" && hasDx("osa")) note = "Your sleep apnea diagnosis creates an FDA-approved coverage pathway — this significantly strengthens your odds.";
    else if (med === "mounjaro" && hasDx("t2d")) note = "Your diabetes diagnosis qualifies you for the highest-probability coverage path.";
    else if (med === "ozempic" && hasDx("t2d")) note = "Near-universal coverage with your T2D diagnosis.";

    meds[med] = { prob, indication, indicationLabel, note, pa: data.pa, boosts, roadmap };
  });

  const sorted = Object.entries(meds).sort((a, b) => b[1].prob - a[1].prob);
  const best = sorted[0];

  return {
    medications: meds,
    bestMedication: best[0],
    bestProbability: best[1].prob,
    overallRating: best[1].prob >= 60 ? "green" : best[1].prob >= 30 ? "yellow" : "red",
    overallLabel: best[1].prob >= 60 ? "Good odds!" : best[1].prob >= 30 ? "Worth exploring" : "Coverage unlikely",
  };
}

// ═══════════════════════════════════════════════════════
// QUIZ STEP DATA
// ═══════════════════════════════════════════════════════

const INSURERS = [
  "Aetna","Anthem Blue Cross Blue Shield","AvMed","Blue Cross Blue Shield (other state)","CareFirst BlueCross BlueShield",
  "Centene / WellCare","Cigna","Devoted Health","EmblemHealth","Empire Blue Cross Blue Shield",
  "Florida Blue (BCBS FL)","Geisinger","HAP","Health Net","HealthFirst",
  "Horizon BCBS NJ","Humana","Independence Blue Cross","Kaiser Permanente",
  "Medicaid","Medicare","Molina Healthcare","Oscar Health","TRICARE",
  "UnitedHealthcare","UMR","UPMC","VA Health","BCBS Federal Employee Program (FEP)","Other",
];

type SelectOption = { id: string; label: string };

const PLAN_TYPES: SelectOption[] = [
  { id: "employer", label: "Through my employer" },
  { id: "marketplace", label: "ACA Marketplace / Healthcare.gov" },
  { id: "medicaid", label: "Medicaid" },
  { id: "medicare", label: "Medicare" },
  { id: "tricare", label: "TRICARE (military)" },
  { id: "va", label: "VA Health" },
  { id: "bcbs_fep", label: "Federal Employee Program" },
];

const EMPLOYER_SIZES: SelectOption[] = [
  { id: "large_5000_plus", label: "Large (5,000+ employees)" },
  { id: "medium_500_4999", label: "Mid-size (500-4,999)" },
  { id: "small_under_500", label: "Small (under 500)" },
  { id: "government_federal", label: "Government / Federal" },
  { id: "self_employed", label: "Self-employed" },
];

const DIAGNOSES: SelectOption[] = [
  { id: "obesity", label: "Obesity (BMI 30+)" },
  { id: "t2d", label: "Type 2 Diabetes" },
  { id: "prediabetes", label: "Prediabetes / Insulin Resistance" },
  { id: "osa", label: "Sleep Apnea (OSA)" },
  { id: "cvd", label: "Heart Disease / Cardiovascular" },
  { id: "metabolic", label: "Metabolic Syndrome" },
  { id: "pcos", label: "PCOS" },
  { id: "none", label: "None / Not sure" },
];

const BMI_RANGES: SelectOption[] = [
  { id: "under_27", label: "Under 27" },
  { id: "27_29", label: "27 - 29.9" },
  { id: "30_plus", label: "30 - 34.9" },
  { id: "35_plus", label: "35 - 39.9" },
  { id: "40_plus", label: "40+" },
  { id: "not_sure", label: "Not sure" },
];

const STATES_LIST = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];
const STATE_NAMES: Record<string, string> = {"AL":"Alabama","AK":"Alaska","AZ":"Arizona","AR":"Arkansas","CA":"California","CO":"Colorado","CT":"Connecticut","DE":"Delaware","FL":"Florida","GA":"Georgia","HI":"Hawaii","ID":"Idaho","IL":"Illinois","IN":"Indiana","IA":"Iowa","KS":"Kansas","KY":"Kentucky","LA":"Louisiana","ME":"Maine","MD":"Maryland","MA":"Massachusetts","MI":"Michigan","MN":"Minnesota","MS":"Mississippi","MO":"Missouri","MT":"Montana","NE":"Nebraska","NV":"Nevada","NH":"New Hampshire","NJ":"New Jersey","NM":"New Mexico","NY":"New York","NC":"North Carolina","ND":"North Dakota","OH":"Ohio","OK":"Oklahoma","OR":"Oregon","PA":"Pennsylvania","RI":"Rhode Island","SC":"South Carolina","SD":"South Dakota","TN":"Tennessee","TX":"Texas","UT":"Utah","VT":"Vermont","VA":"Virginia","WA":"Washington","WV":"West Virginia","WI":"Wisconsin","WY":"Wyoming","DC":"Washington DC"};

const PRIOR_MEDS: SelectOption[] = [
  { id: "phentermine", label: "Phentermine" },
  { id: "contrave", label: "Contrave (naltrexone/bupropion)" },
  { id: "qsymia", label: "Qsymia (phentermine/topiramate)" },
  { id: "saxenda", label: "Saxenda (liraglutide)" },
  { id: "metformin", label: "Metformin" },
  { id: "other_rx", label: "Other prescription weight loss med" },
  { id: "otc_only", label: "OTC supplements only" },
  { id: "none", label: "None" },
];

const LIFESTYLE_OPTIONS: SelectOption[] = [
  { id: "supervised", label: "Yes — supervised program (doctor, dietitian, Weight Watchers, Noom, etc.)" },
  { id: "self", label: "Yes — on my own (diet, gym, etc.)" },
  { id: "none", label: "No / Not recently" },
];

const LAB_WORK: SelectOption[] = [
  { id: "a1c", label: "A1C or blood sugar test" },
  { id: "lipid_panel", label: "Cholesterol / lipid panel" },
  { id: "sleep_study", label: "Sleep study" },
  { id: "liver_tests", label: "Liver function tests" },
  { id: "bp_on_file", label: "Blood pressure on file" },
  { id: "none", label: "None / Not sure" },
];

const WEIGHT_DURATION: SelectOption[] = [
  { id: "less_6mo", label: "Less than 6 months" },
  { id: "6mo_1yr", label: "6 months to 1 year" },
  { id: "1_3_years", label: "1-3 years" },
  { id: "3_plus_years", label: "3+ years" },
];

const ADDITIONAL_CONDITIONS: SelectOption[] = [
  { id: "hypertension", label: "High blood pressure" },
  { id: "high_cholesterol", label: "High cholesterol" },
  { id: "insulin_resistance", label: "Pre-diabetes or insulin resistance" },
  { id: "fatty_liver", label: "Fatty liver" },
  { id: "joint_pain", label: "Joint pain from weight" },
  { id: "depression_weight", label: "Depression or anxiety related to weight" },
  { id: "snoring", label: "Snoring or breathing issues at night" },
  { id: "none", label: "None of these" },
];

const TRICARE_PLANS: SelectOption[] = [
  { id: "prime", label: "TRICARE Prime" },
  { id: "select", label: "TRICARE Select" },
  { id: "tfl", label: "TRICARE For Life (Medicare-eligible retiree)" },
  { id: "young_adult", label: "TRICARE Young Adult" },
  { id: "reserve", label: "TRICARE Reserve Select" },
  { id: "not_sure", label: "Not sure" },
];

// ═══════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════

function Pill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 18px",
      borderRadius: 50, border: `2px solid ${selected ? B.red : B.mid}`,
      backgroundColor: selected ? B.redLight : B.white, cursor: "pointer",
      fontFamily: font, fontSize: 14, fontWeight: selected ? 700 : 500, color: B.black,
      textAlign: "left", transition: "all 0.15s ease",
    }}>
      <span style={{ flex: 1 }}>{children}</span>
      {selected && <span style={{ color: B.red, fontWeight: 800, fontSize: 16 }}>&#10003;</span>}
    </button>
  );
}

function ProgressBar({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {label && <div style={{ fontFamily: font, fontSize: 11, color: B.gray, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>}
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 4,
            backgroundColor: i <= current ? B.red : B.mid,
            transition: "background-color 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

function ProbabilityBar({ prob, medName, indication, note, boosts, animate }: {
  prob: number; medName: string; indication: string; note: string;
  boosts: BoostItem[]; animate?: boolean;
}) {
  const color = prob >= 60 ? B.green : prob >= 30 ? B.amber : B.red;
  const rating = prob >= 60 ? "Good odds" : prob >= 30 ? "Worth exploring" : prob === 0 ? "Not covered" : "Low odds";
  const [displayProb, setDisplayProb] = useState(0);

  useEffect(() => {
    if (!animate) { setDisplayProb(prob); return; }
    const start = displayProb;
    const diff = prob - start;
    const duration = 800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayProb(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prob]);

  return (
    <div style={{ padding: "20px 22px", borderRadius: 14, backgroundColor: B.white, border: `1.5px solid ${B.mid}`, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: fontHead, fontSize: 17, fontWeight: 700, color: B.black }}>{medName}</div>
          <div style={{ fontFamily: font, fontSize: 12, color: B.gray, marginTop: 2 }}>{indication}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: fontHead, fontSize: 28, fontWeight: 800, color }}>{displayProb}%</div>
          <div style={{ fontFamily: font, fontSize: 11, fontWeight: 600, color }}>{rating}</div>
        </div>
      </div>
      <div style={{ height: 8, backgroundColor: B.cream, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ width: `${displayProb}%`, height: "100%", backgroundColor: color, borderRadius: 6, transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }} />
      </div>
      {boosts && boosts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {boosts.map((b, i) => (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
              borderRadius: 20, backgroundColor: B.greenLight, fontFamily: font, fontSize: 11, color: B.green, fontWeight: 600,
            }}>
              +{b.points}% {b.label}
            </span>
          ))}
        </div>
      )}
      {note && <p style={{ fontFamily: font, fontSize: 12, color: B.dark, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>{note}</p>}
    </div>
  );
}

function RoadmapSection({ items }: { items: RoadmapItem[] }) {
  if (!items || items.length === 0) return null;
  const greens = items.filter(i => i.type === "green");
  const blues = items.filter(i => i.type === "blue");
  const ambers = items.filter(i => i.type === "amber");

  const Section = ({ title, color, bgColor, itemList }: { title: string; color: string; bgColor: string; itemList: RoadmapItem[] }) =>
    itemList.length === 0 ? null : (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontFamily: fontHead, fontSize: 12, fontWeight: 600, color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
        {itemList.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", marginBottom: 4, borderRadius: 8, backgroundColor: bgColor }}>
            <span style={{ fontSize: 14 }}>{item.type === "green" ? "✓" : item.type === "blue" ? "→" : "!"}</span>
            <span style={{ fontFamily: font, fontSize: 13, color: B.dark }}>{item.label}</span>
          </div>
        ))}
      </div>
    );

  return (
    <div style={{ padding: "16px 18px", borderRadius: 14, backgroundColor: B.light, border: `1px solid ${B.mid}`, marginBottom: 14 }}>
      <div style={{ fontFamily: fontHead, fontSize: 14, fontWeight: 700, color: B.black, marginBottom: 12 }}>Your Approval Roadmap</div>
      <Section title="Working in your favor" color={B.green} bgColor={B.greenLight} itemList={greens} />
      <Section title="Our team handles" color={B.blue} bgColor={B.blueLight} itemList={blues} />
      <Section title="Could improve your odds" color={B.amber} bgColor={B.amberLight} itemList={ambers} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN QUIZ COMPONENT
// ═══════════════════════════════════════════════════════

export default function InsuranceCheckPage() {
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>("landing");
  const [quizStep, setQuizStep] = useState(0);
  const [boostStep, setBoostStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    insurer: "", planType: "", employerSize: "medium_500_4999", state: "", diagnoses: [], bmiRange: "",
  });
  const [boostAnswers, setBoostAnswers] = useState<BoostAnswers>({
    priorMeds: [], lifestyleProgram: "", labWork: [], weightDuration: "", additionalConditions: [], tricarePlan: "",
  });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [results, setResults] = useState<QuizResults | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [showCalculating, setShowCalculating] = useState(false);

  const quizSteps = [
    { id: "insurer", question: "Who is your insurance company?", subtitle: "Select your primary health insurer", type: "search" },
    { id: "planType", question: "How do you get your insurance?", subtitle: "This tells us which coverage rules apply", type: "single", options: PLAN_TYPES },
    ...(answers.planType === "employer" ? [{ id: "employerSize", question: "How big is your employer?", subtitle: "Larger employers are more likely to cover GLP-1 medications", type: "single", options: EMPLOYER_SIZES }] : []),
    { id: "state", question: "What state do you live in?", subtitle: "Some states mandate GLP-1 coverage", type: "state" },
    { id: "diagnoses", question: "Do you have any of these conditions?", subtitle: "Each diagnosis opens different coverage pathways — select all that apply", type: "multi", options: DIAGNOSES },
    { id: "bmiRange", question: "What's your approximate BMI?", subtitle: "Most plans require BMI 30+ for weight management coverage", type: "single", options: BMI_RANGES },
  ];

  const boostSteps = [
    { id: "priorMeds", question: "Have you tried any weight loss medications before?", subtitle: "Prior attempts significantly strengthen your case", type: "multi", options: PRIOR_MEDS },
    { id: "lifestyleProgram", question: "Have you been on a diet or exercise program?", subtitle: "Documented lifestyle efforts are key for most insurers", type: "single", options: LIFESTYLE_OPTIONS },
    { id: "labWork", question: "Do you have any recent lab work or medical tests?", subtitle: "Existing lab results can unlock stronger coverage pathways", type: "multi", options: LAB_WORK },
    { id: "weightDuration", question: "How long have you been managing your weight?", subtitle: "Longer history strengthens your case for medical necessity", type: "single", options: WEIGHT_DURATION },
    { id: "additionalConditions", question: "Has a doctor ever discussed any of these with you?", subtitle: "These conditions — even if mild — can strengthen your approval odds", type: "multi", options: ADDITIONAL_CONDITIONS },
    ...(answers.planType === "tricare" ? [{ id: "tricarePlan", question: "What type of TRICARE plan do you have?", subtitle: "Coverage varies significantly between TRICARE plan types", type: "single", options: TRICARE_PLANS }] : []),
  ];

  const currentQuizStep = quizSteps[quizStep];
  const currentBoostStep = boostSteps[boostStep];

  useEffect(() => {
    if (phase === "boost" || phase === "initial_results" || phase === "results") {
      setResults(calculateProbability(answers, boostAnswers));
    }
  }, [boostAnswers, phase, answers]);

  const setAnswer = (key: keyof Answers, value: string | string[]) =>
    setAnswers(prev => ({ ...prev, [key]: value }));
  const setBoost = (key: keyof BoostAnswers, value: string | string[]) =>
    setBoostAnswers(prev => ({ ...prev, [key]: value }));

  const advanceQuiz = () => {
    if (quizStep < quizSteps.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setShowCalculating(true);
      const r = calculateProbability(answers, boostAnswers);
      setTimeout(() => { setResults(r); setShowCalculating(false); setPhase("initial_results"); }, 2500);
    }
  };

  const advanceBoost = () => {
    if (boostStep < boostSteps.length - 1) setBoostStep(boostStep + 1);
    else setPhase("email");
  };

  const handleMultiToggle = (key: string, id: string, isBoost = false) => {
    if (isBoost) {
      const current = boostAnswers[key as keyof BoostAnswers] as string[];
      if (id === "none") { setBoost(key as keyof BoostAnswers, ["none"]); return; }
      const filtered = current.filter(x => x !== "none");
      setBoost(key as keyof BoostAnswers, filtered.includes(id) ? filtered.filter(x => x !== id) : [...filtered, id]);
    } else {
      const current = answers[key as keyof Answers] as string[];
      if (id === "none") { setAnswer(key as keyof Answers, ["none"]); return; }
      const filtered = current.filter(x => x !== "none");
      setAnswer(key as keyof Answers, filtered.includes(id) ? filtered.filter(x => x !== id) : [...filtered, id]);
    }
  };

  function handleEmailSubmit() {
    if (!firstName || !email) return;

    fetch("/api/quiz-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, phone: phone || null, quizOutcome: "insurance-check", locale }),
    }).catch(() => {});

    const r = calculateProbability(answers, boostAnswers);
    setResults(r);

    const score = r.bestProbability;
    fetch("/api/insurance-check-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName,
        phone: phone || null,
        score,
        carrier: answers.insurer || null,
        state: answers.state || null,
        bestMed: r.bestMedication || null,
        bestIndication: r.medications[r.bestMedication]?.indicationLabel || null,
        diagnoses: answers.diagnoses,
        bmiRange: answers.bmiRange,
        locale,
      }),
    }).catch(() => {});

    setPhase("results");
  }

  const QuizContainer = ({ children, progress, total, progressLabel }: {
    children: React.ReactNode; progress: number; total: number; progressLabel?: string;
  }) => (
    <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <ProgressBar current={progress} total={total} label={progressLabel} />
        {children}
      </div>
    </div>
  );

  // ── LANDING ──
  if (phase === "landing") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: fontHead, fontSize: 11, fontWeight: 600, color: B.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Free Tool</div>
          <h1 style={{ fontFamily: fontHead, fontSize: 28, fontWeight: 700, color: B.black, margin: "0 0 12px", lineHeight: 1.3 }}>What Are My Odds?</h1>
          <p style={{ fontFamily: font, fontSize: 15, color: B.gray, lineHeight: 1.6, margin: "0 0 8px" }}>Find out if your insurance is likely to cover GLP-1 weight loss medications like Wegovy, Zepbound, Mounjaro, and Ozempic.</p>
          <p style={{ fontFamily: font, fontSize: 13, color: B.gray, lineHeight: 1.5, margin: "0 0 28px" }}>Takes about 2 minutes. No personal health information required.</p>
          <button onClick={() => setPhase("quiz")} style={{
            width: "100%", padding: "16px 32px", borderRadius: 50, border: "none",
            backgroundColor: B.red, color: B.white, fontFamily: fontHead, fontSize: 15, fontWeight: 600,
            cursor: "pointer", transition: "opacity 0.15s",
          }}>Check My Coverage Odds &rarr;</button>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            {["Board-Certified Doctors", "Licensed in 20 States", "100% Free"].map(t => (
              <span key={t} style={{ fontFamily: font, fontSize: 11, color: B.gray }}>&#10003; {t}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── CALCULATING ANIMATION ──
  if (showCalculating) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: fontHead, fontSize: 22, fontWeight: 700, color: B.black, marginBottom: 20 }}>Analyzing your coverage...</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: "50%", backgroundColor: B.red,
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ fontFamily: font, fontSize: 13, color: B.gray }}>Checking carrier data, formulary status, and coverage pathways...</div>
          <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }`}</style>
        </div>
      </div>
    );
  }

  // ── PHASE 1: BASIC QUIZ ──
  if (phase === "quiz" && currentQuizStep) {
    const step = currentQuizStep;
    const answersAsStrings = answers as Record<string, string | string[]>;
    const boostAsStrings = boostAnswers as Record<string, string | string[]>;
    const currentVal = answersAsStrings[step.id];

    return (
      <QuizContainer progress={quizStep} total={quizSteps.length} progressLabel="Step 1 of 2 — Basic Info">
        <h2 style={{ fontFamily: fontHead, fontSize: 21, fontWeight: 700, color: B.black, margin: "0 0 6px" }}>{step.question}</h2>
        <p style={{ fontFamily: font, fontSize: 13, color: B.gray, margin: "0 0 24px" }}>{step.subtitle}</p>

        {step.type === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Type to search..."
              style={{ padding: "12px 16px", borderRadius: 50, border: `2px solid ${B.mid}`, fontFamily: font, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {INSURERS.filter(ins => !searchQ || ins.toLowerCase().includes(searchQ.toLowerCase())).map(ins => (
                <Pill key={ins} selected={answers.insurer === ins} onClick={() => {
                  setAnswer("insurer", ins); setSearchQ(""); setTimeout(advanceQuiz, 200);
                }}>{ins}</Pill>
              ))}
            </div>
          </div>
        )}

        {step.type === "single" && step.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {step.options.map((opt: SelectOption) => (
              <Pill key={opt.id} selected={currentVal === opt.id} onClick={() => {
                setAnswer(step.id as keyof Answers, opt.id); setTimeout(advanceQuiz, 200);
              }}>{opt.label}</Pill>
            ))}
          </div>
        )}

        {step.type === "multi" && step.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {step.options.map((opt: SelectOption) => (
              <Pill key={opt.id} selected={Array.isArray(currentVal) && currentVal.includes(opt.id)} onClick={() => handleMultiToggle(step.id, opt.id)}>{opt.label}</Pill>
            ))}
            {Array.isArray(currentVal) && currentVal.length > 0 && (
              <button onClick={advanceQuiz} style={{
                marginTop: 12, padding: "14px", borderRadius: 50, border: "none",
                backgroundColor: B.red, color: B.white, fontFamily: fontHead, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>Continue &rarr;</button>
            )}
          </div>
        )}

        {step.type === "state" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Type to search..."
              style={{ padding: "12px 16px", borderRadius: 50, border: `2px solid ${B.mid}`, fontFamily: font, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {STATES_LIST.filter(s => !searchQ || STATE_NAMES[s].toLowerCase().includes(searchQ.toLowerCase()) || s.toLowerCase().includes(searchQ.toLowerCase()))
                .map(s => (
                  <Pill key={s} selected={answers.state === s} onClick={() => {
                    setAnswer("state", s); setSearchQ(""); setTimeout(advanceQuiz, 200);
                  }}>{STATE_NAMES[s]}</Pill>
                ))}
            </div>
          </div>
        )}

      </QuizContainer>
    );
  }

  // ── INITIAL RESULTS (before boost) ──
  if (phase === "initial_results" && results) {
    const r = results;
    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontFamily: fontHead, fontSize: 11, fontWeight: 600, color: B.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Your Initial Results</div>
            <h2 style={{ fontFamily: fontHead, fontSize: 24, fontWeight: 700, color: B.black, margin: "0 0 8px" }}>Here&apos;s where you stand</h2>
            <p style={{ fontFamily: font, fontSize: 13, color: B.gray, margin: 0 }}>Based on your insurance, plan type, and health profile</p>
          </div>

          <ProbabilityBar prob={r.medications.wegovy.prob} medName="Wegovy®" indication={r.medications.wegovy.indicationLabel} note={r.medications.wegovy.note} boosts={[]} animate={true} />
          <ProbabilityBar prob={r.medications.zepbound.prob} medName="Zepbound®" indication={r.medications.zepbound.indicationLabel} note={r.medications.zepbound.note} boosts={[]} animate={true} />
          <ProbabilityBar prob={r.medications.mounjaro.prob} medName="Mounjaro®" indication={r.medications.mounjaro.indicationLabel} note={r.medications.mounjaro.note} boosts={[]} animate={true} />
          <ProbabilityBar prob={r.medications.ozempic.prob} medName="Ozempic®" indication={r.medications.ozempic.indicationLabel} note={r.medications.ozempic.note} boosts={[]} animate={true} />

          <div style={{
            marginTop: 20, padding: "20px 22px", borderRadius: 14,
            backgroundColor: B.amberLight, border: `1.5px solid ${B.amber}`, textAlign: "center",
          }}>
            <div style={{ fontFamily: fontHead, fontSize: 16, fontWeight: 700, color: B.black, marginBottom: 6 }}>Want to see if your odds are better?</div>
            <p style={{ fontFamily: font, fontSize: 13, color: B.dark, margin: "0 0 16px", lineHeight: 1.5 }}>
              Your history matters. A few more questions about your past weight loss efforts could significantly increase your probability.
            </p>
            <button onClick={() => setPhase("boost")} style={{
              padding: "14px 32px", borderRadius: 50, border: "none",
              backgroundColor: B.red, color: B.white, fontFamily: fontHead, fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%",
            }}>Boost My Odds &rarr;</button>
            <button onClick={() => setPhase("email")} style={{
              marginTop: 8, padding: "10px", borderRadius: 50, border: "none",
              backgroundColor: "transparent", color: B.gray, fontFamily: font, fontSize: 12, cursor: "pointer",
            }}>Skip — show me the full results</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE 2: BOOST QUESTIONS ──
  if (phase === "boost" && currentBoostStep) {
    const step = currentBoostStep;
    const boostAsStrings = boostAnswers as Record<string, string | string[]>;
    const currentVal = boostAsStrings[step.id];

    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <ProgressBar current={boostStep} total={boostSteps.length} label="Step 2 of 2 — Boost Your Odds" />

          {results && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {(["wegovy", "zepbound", "mounjaro", "ozempic"] as const).map(med => {
                const m = results.medications[med];
                const color = m.prob >= 60 ? B.green : m.prob >= 30 ? B.amber : B.red;
                return (
                  <div key={med} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, backgroundColor: B.white, border: `1px solid ${B.mid}`, textAlign: "center" }}>
                    <div style={{ fontFamily: fontHead, fontSize: 10, fontWeight: 600, color: B.gray, textTransform: "uppercase" }}>{med.charAt(0).toUpperCase() + med.slice(1)}</div>
                    <div style={{ fontFamily: fontHead, fontSize: 20, fontWeight: 800, color, transition: "color 0.3s" }}>{m.prob}%</div>
                    <div style={{ height: 3, backgroundColor: B.cream, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
                      <div style={{ width: `${m.prob}%`, height: "100%", backgroundColor: color, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.22, 1, 0.36, 1)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ fontFamily: fontHead, fontSize: 21, fontWeight: 700, color: B.black, margin: "0 0 6px" }}>{step.question}</h2>
          <p style={{ fontFamily: font, fontSize: 13, color: B.gray, margin: "0 0 24px" }}>{step.subtitle}</p>

          {step.type === "single" && step.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {step.options.map((opt: SelectOption) => (
                <Pill key={opt.id} selected={currentVal === opt.id} onClick={() => {
                  setBoost(step.id as keyof BoostAnswers, opt.id); setTimeout(advanceBoost, 400);
                }}>{opt.label}</Pill>
              ))}
            </div>
          )}

          {step.type === "multi" && step.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {step.options.map((opt: SelectOption) => (
                <Pill key={opt.id} selected={Array.isArray(currentVal) && currentVal.includes(opt.id)} onClick={() => handleMultiToggle(step.id, opt.id, true)}>{opt.label}</Pill>
              ))}
              {Array.isArray(currentVal) && currentVal.length > 0 && (
                <button onClick={advanceBoost} style={{
                  marginTop: 12, padding: "14px", borderRadius: 50, border: "none",
                  backgroundColor: B.red, color: B.white, fontFamily: fontHead, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>Continue &rarr;</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EMAIL CAPTURE ──
  if (phase === "email") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: fontHead, fontSize: 11, fontWeight: 600, color: B.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Almost There</div>
          <h2 style={{ fontFamily: fontHead, fontSize: 22, fontWeight: 700, color: B.black, margin: "0 0 8px" }}>See Your Full Results</h2>
          <p style={{ fontFamily: font, fontSize: 13, color: B.gray, margin: "0 0 24px", lineHeight: 1.5 }}>Enter your info to see your personalized coverage roadmap and next steps.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name *"
              style={{ padding: "14px 18px", borderRadius: 50, border: `2px solid ${B.mid}`, fontFamily: font, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address *" type="email"
              style={{ padding: "14px 18px", borderRadius: 50, border: `2px solid ${B.mid}`, fontFamily: font, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" type="tel"
              style={{ padding: "14px 18px", borderRadius: 50, border: `2px solid ${B.mid}`, fontFamily: font, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
            <button
              onClick={handleEmailSubmit}
              disabled={!email || !firstName}
              style={{
                marginTop: 8, padding: "16px", borderRadius: 50, border: "none",
                backgroundColor: email && firstName ? B.red : "#D1D1D1", color: B.white,
                fontFamily: fontHead, fontSize: 15, fontWeight: 600, cursor: email && firstName ? "pointer" : "not-allowed",
              }}>Show My Results &rarr;</button>
          </div>
          <p style={{ fontFamily: font, fontSize: 11, color: B.gray, marginTop: 16 }}>We respect your privacy. No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    );
  }

  // ── PHASE 3: FULL RESULTS WITH ROADMAP ──
  if (phase === "results" && results) {
    const r = results;
    const bestProb = r.bestProbability;

    let ctaTitle: string, ctaBody: string, ctaButton: string, ctaRoute: string;
    if (bestProb >= 65) {
      ctaTitle = "Your odds look strong";
      ctaBody = "Our insurance team can verify your coverage and start the approval process. We handle prior authorization, documentation, and physician advocacy.";
      ctaButton = "Confirm My Coverage — $25";
      ctaRoute = `/${locale}/intake/insurance-eligibility`;
    } else if (bestProb >= 30) {
      ctaTitle = "Worth pursuing with the right team";
      ctaBody = "Coverage is possible with proper documentation and physician advocacy. Our team specializes in building strong cases — we know exactly what your insurer needs to see.";
      ctaButton = "Let Our Team Build Your Case";
      ctaRoute = `/${locale}/intake/insurance-eligibility`;
    } else {
      ctaTitle = "Insurance coverage is unlikely";
      ctaBody = "Based on your plan, insurance approval for weight loss medications is unlikely. The good news: our self-pay compounded options start at just $139/month — same active ingredients, no insurance needed.";
      ctaButton = "Explore Self-Pay Options";
      ctaRoute = `/${locale}/quiz`;
    }

    return (
      <div style={{ minHeight: "100vh", backgroundColor: B.light, display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 520, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-block", padding: "4px 16px", borderRadius: 50, marginBottom: 12,
              backgroundColor: bestProb >= 60 ? B.greenLight : bestProb >= 30 ? B.amberLight : B.redLight,
              color: bestProb >= 60 ? B.green : bestProb >= 30 ? B.amber : B.red,
              fontFamily: fontHead, fontSize: 12, fontWeight: 700,
            }}>{r.overallLabel}</div>
            <h2 style={{ fontFamily: fontHead, fontSize: 24, fontWeight: 700, color: B.black, margin: "0 0 8px" }}>
              {firstName ? `${firstName}, here's` : "Here's"} your full coverage report
            </h2>
          </div>

          {Object.entries(r.medications)
            .sort((a, b) => b[1].prob - a[1].prob)
            .map(([med, data]) => (
              <div key={med}>
                <ProbabilityBar
                  prob={data.prob}
                  medName={med.charAt(0).toUpperCase() + med.slice(1) + "®"}
                  indication={data.indicationLabel}
                  note={data.note}
                  boosts={data.boosts}
                  animate={true}
                />
                {med === r.bestMedication && data.roadmap && data.roadmap.length > 0 && (
                  <RoadmapSection items={data.roadmap} />
                )}
              </div>
            ))}

          <div style={{
            marginTop: 20, padding: "24px", borderRadius: 14,
            backgroundColor: B.white, border: `2px solid ${B.red}`, textAlign: "center",
          }}>
            <div style={{ fontFamily: fontHead, fontSize: 18, fontWeight: 700, color: B.black, marginBottom: 8 }}>{ctaTitle}</div>
            <p style={{ fontFamily: font, fontSize: 13, color: B.dark, margin: "0 0 16px", lineHeight: 1.6 }}>{ctaBody}</p>
            <button onClick={() => window.location.href = ctaRoute} style={{
              width: "100%", padding: "16px", borderRadius: 50, border: "none",
              backgroundColor: B.red, color: B.white, fontFamily: fontHead, fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>{ctaButton} &rarr;</button>
          </div>

          <button onClick={() => {
            setPhase("landing");
            setQuizStep(0);
            setBoostStep(0);
            setAnswers({ insurer: "", planType: "", employerSize: "medium_500_4999", state: "", diagnoses: [], bmiRange: "" });
            setBoostAnswers({ priorMeds: [], lifestyleProgram: "", labWork: [], weightDuration: "", additionalConditions: [], tricarePlan: "" });
            setResults(null);
            setFirstName(""); setEmail(""); setPhone("");
          }} style={{
            display: "block", margin: "16px auto 0", padding: "10px 24px", borderRadius: 50, border: "none",
            backgroundColor: "transparent", color: B.gray, fontFamily: font, fontSize: 12, cursor: "pointer",
          }}>&#8592; Start over</button>

          <p style={{ fontFamily: font, fontSize: 10, color: B.gray, marginTop: 24, lineHeight: 1.5, textAlign: "center" }}>
            These results are estimates based on publicly available insurance formulary data as of April 2026. They are not guarantees of coverage.
            Actual coverage depends on your specific plan benefits. Body Good Studio is not an insurance company.
            Board-certified physicians licensed in 20 states.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
