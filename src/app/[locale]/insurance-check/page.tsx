"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { useLocale } from "next-intl";

// ─────────────────────────────────────────────
// EMBEDDED PROBABILITY DATABASE (client-side only)
// ─────────────────────────────────────────────
const MANDATE_STATES = ["CT", "DE", "MD", "NJ", "VT", "WV"];
const RESTRICTED_STATES = ["MA", "MI", "CA", "PA"];

type IndicationData = { prob: [number, number]; rating: string; pa: boolean; notes: string };
type CarrierStates = Record<string, Record<string, IndicationData>>;

const CARRIERS_DB: Record<string, { states: CarrierStates }> = {
  cigna: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [30, 45], rating: "yellow", pa: true, notes: "Strict PA. Requires documented step therapy. Express Scripts PBM." },
        wegovy_cv: { prob: [55, 65], rating: "yellow", pa: true, notes: "Much better odds if patient has documented CVD." },
        zepbound_weight_loss: { prob: [30, 45], rating: "yellow", pa: true, notes: "Same as Wegovy weight loss pathway." },
        zepbound_osa: { prob: [45, 55], rating: "yellow", pa: true, notes: "If patient has diagnosed moderate-severe OSA (AHI 15+) and BMI 30+." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      _default: {
        wegovy_weight_loss: { prob: [30, 45], rating: "yellow", pa: true, notes: "Strict PA. Express Scripts PBM. Plan-dependent." },
        wegovy_cv: { prob: [55, 65], rating: "yellow", pa: true, notes: "CV indication stronger pathway." },
        zepbound_weight_loss: { prob: [30, 45], rating: "yellow", pa: true, notes: "PA required. Plan-dependent." },
        zepbound_osa: { prob: [45, 55], rating: "yellow", pa: true, notes: "OSA pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  bcbs_fl: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [35, 45], rating: "yellow", pa: true, notes: "No mandate. Employer must opt in. CVS Caremark PBM prefers Wegovy." },
        wegovy_cv: { prob: [55, 65], rating: "yellow", pa: true, notes: "Much better odds with documented CVD." },
        zepbound_weight_loss: { prob: [20, 30], rating: "red", pa: true, notes: "CVS Caremark removed Zepbound from most formularies July 2025." },
        zepbound_osa: { prob: [45, 55], rating: "yellow", pa: true, notes: "OSA pathway may still work with formulary changes." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "CVS Caremark requires step therapy (try metformin first)." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Tier 2/3. No PA for standard doses." },
      },
    },
  },
  aetna: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [40, 55], rating: "yellow", pa: true, notes: "Employer-elected. CVS Caremark PBM gives Wegovy preferred status." },
        wegovy_cv: { prob: [55, 65], rating: "yellow", pa: true, notes: "CV indication strengthens approval." },
        zepbound_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "CVS Caremark removed Zepbound from most formularies." },
        zepbound_osa: { prob: [40, 55], rating: "yellow", pa: true, notes: "OSA pathway still viable." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      CT: {
        wegovy_weight_loss: { prob: [50, 60], rating: "yellow", pa: true, notes: "Mandate state. Employer-elected benefit with strong approval rates." },
        zepbound_weight_loss: { prob: [50, 60], rating: "yellow", pa: true, notes: "Mandate state. Employer-elected." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      _default: {
        wegovy_weight_loss: { prob: [40, 55], rating: "yellow", pa: true, notes: "Employer-elected. CVS Caremark PBM." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV pathway available." },
        zepbound_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "Restricted formulary." },
        zepbound_osa: { prob: [40, 50], rating: "yellow", pa: true, notes: "OSA pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  uhc: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [30, 40], rating: "yellow", pa: true, notes: "Restrictive for weight loss. Use metabolic pathway if possible." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV pathway is stronger." },
        zepbound_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "Restrictive. Consider alternative meds." },
        zepbound_osa: { prob: [40, 50], rating: "yellow", pa: true, notes: "OSA pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      NY: {
        wegovy_weight_loss: { prob: [40, 50], rating: "yellow", pa: true, notes: "Self-funded plans at major NYC employers sometimes include." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      _default: {
        wegovy_weight_loss: { prob: [30, 40], rating: "yellow", pa: true, notes: "Restrictive for weight loss." },
        wegovy_cv: { prob: [45, 55], rating: "yellow", pa: true, notes: "CV pathway available." },
        zepbound_weight_loss: { prob: [20, 30], rating: "red", pa: true, notes: "Restrictive formulary." },
        zepbound_osa: { prob: [35, 45], rating: "yellow", pa: true, notes: "OSA pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  humana: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [35, 45], rating: "yellow", pa: true, notes: "Significant FL presence. Variable by employer plan." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
      _default: {
        wegovy_weight_loss: { prob: [35, 45], rating: "yellow", pa: true, notes: "Variable by employer plan." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV pathway available." },
        zepbound_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "Plan-dependent." },
        zepbound_osa: { prob: [40, 50], rating: "yellow", pa: true, notes: "OSA pathway available." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  tricare: {
    states: {
      _default: {
        wegovy_weight_loss: { prob: [15, 25], rating: "red", pa: true, notes: "Generally excluded. Exception requests required." },
        wegovy_cv: { prob: [50, 65], rating: "yellow", pa: true, notes: "CV indication is a stronger pathway for TRICARE." },
        zepbound_osa: { prob: [40, 55], rating: "yellow", pa: true, notes: "OSA pathway may be viable." },
        mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered for diabetes with PA." },
        ozempic_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered for diabetes with PA." },
      },
    },
  },
  bcbs_fep: {
    states: {
      _default: {
        wegovy_weight_loss: { prob: [60, 70], rating: "green", pa: true, notes: "One of the strongest federal programs for GLP-1 access." },
        zepbound_weight_loss: { prob: [55, 65], rating: "yellow", pa: true, notes: "Coverage expanding." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  va: {
    states: {
      _default: {
        wegovy_weight_loss: { prob: [20, 30], rating: "red", pa: true, notes: "Non-formulary. Exception request required. Document comorbidities heavily." },
        wegovy_cv: { prob: [40, 55], rating: "yellow", pa: true, notes: "CV indication has better chances." },
        mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered on formulary for diabetes." },
        ozempic_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered on formulary for diabetes." },
      },
    },
  },
  medicare: {
    states: {
      _default: {
        wegovy_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "Statutory exclusion. Cannot cover weight-loss-only indication." },
        wegovy_cv: { prob: [45, 60], rating: "yellow", pa: true, notes: "If patient has prior MI, stroke, PAD, or CAD + BMI 27+." },
        zepbound_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "Statutory exclusion." },
        zepbound_osa: { prob: [40, 55], rating: "yellow", pa: true, notes: "If patient has moderate-severe OSA (AHI 15+) + BMI 30+." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Fully covered for diabetes." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Fully covered for diabetes." },
      },
    },
  },
  medicaid_fl: {
    states: {
      FL: {
        wegovy_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "Weight control meds explicitly non-covered under FL Medicaid." },
        zepbound_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "Not covered." },
        mounjaro_t2d: { prob: [75, 85], rating: "green", pa: true, notes: "Covered for T2D only through MCO." },
        ozempic_t2d: { prob: [75, 85], rating: "green", pa: true, notes: "Covered for T2D only through MCO." },
      },
    },
  },
  medicaid_ny: {
    states: {
      NY: {
        wegovy_weight_loss: { prob: [80, 90], rating: "green", pa: false, notes: "MOST GENEROUS STATE. No PA required. Meds on formulary." },
        zepbound_weight_loss: { prob: [80, 90], rating: "green", pa: false, notes: "Same generous coverage as Wegovy." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  medicaid_il: {
    states: {
      IL: {
        wegovy_weight_loss: { prob: [65, 75], rating: "green", pa: true, notes: "Simple criteria: BMI 30+ with PA. No diet documentation required." },
        zepbound_weight_loss: { prob: [65, 75], rating: "green", pa: true, notes: "Same simple criteria as Wegovy." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
      },
    },
  },
  medi_cal: {
    states: {
      CA: {
        wegovy_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "ELIMINATED Jan 2026. OSA/CV indications still covered." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV indication still covered." },
        zepbound_weight_loss: { prob: [0, 0], rating: "red", pa: false, notes: "Not covered for weight loss." },
        zepbound_osa: { prob: [40, 55], rating: "yellow", pa: true, notes: "OSA indication may still be covered." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  bcbs_ma: {
    states: {
      MA: {
        wegovy_weight_loss: { prob: [5, 10], rating: "red", pa: true, notes: "DROPPED coverage Jan 2026. Only covered if employer purchased rider (20% did)." },
        zepbound_weight_loss: { prob: [5, 10], rating: "red", pa: true, notes: "Same — dropped unless employer rider." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Still fully covered for diabetes." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Still fully covered for diabetes." },
      },
    },
  },
  bcbs_mi: {
    states: {
      MI: {
        wegovy_weight_loss: { prob: [5, 10], rating: "red", pa: true, notes: "DROPPED for fully-insured large groups. Requires BMI 35+ if any coverage remains." },
        zepbound_weight_loss: { prob: [5, 10], rating: "red", pa: true, notes: "Same — dropped." },
        mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Still covered for diabetes." },
        ozempic_t2d: { prob: [80, 90], rating: "green", pa: false, notes: "Still covered for diabetes." },
      },
    },
  },
  blue_shield_ca: {
    states: {
      CA: {
        wegovy_weight_loss: { prob: [20, 30], rating: "red", pa: true, notes: "Requires BMI 40+ AND participation in comprehensive weight loss program." },
        wegovy_cv: { prob: [50, 60], rating: "yellow", pa: true, notes: "CV indication pathway much better." },
        mounjaro_t2d: { prob: [85, 95], rating: "green", pa: true, notes: "Standard diabetes coverage." },
        ozempic_t2d: { prob: [85, 95], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
  kaiser: {
    states: {
      CA: {
        wegovy_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "Restrictive. Internal formulary management. Better via diabetes pathway." },
        wegovy_cv: { prob: [45, 55], rating: "yellow", pa: true, notes: "CV pathway available." },
        mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered via internal formulary." },
        ozempic_t2d: { prob: [80, 90], rating: "green", pa: false, notes: "Covered via internal formulary." },
      },
      _default: {
        wegovy_weight_loss: { prob: [25, 35], rating: "red", pa: true, notes: "Restrictive internal formulary." },
        wegovy_cv: { prob: [45, 55], rating: "yellow", pa: true, notes: "CV pathway available." },
        mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Covered via internal formulary." },
        ozempic_t2d: { prob: [80, 90], rating: "green", pa: false, notes: "Standard diabetes coverage." },
      },
    },
  },
};

// Generic fallback for unknown carriers
const GENERIC_DB: Record<string, CarrierStates> = {
  employer_large: {
    _default: {
      wegovy_weight_loss: { prob: [35, 50], rating: "yellow", pa: true, notes: "Large employer — about 43% of firms 5000+ cover GLP-1s." },
      wegovy_cv: { prob: [50, 65], rating: "yellow", pa: true, notes: "CV pathway available." },
      zepbound_weight_loss: { prob: [30, 45], rating: "yellow", pa: true, notes: "Coverage varies by plan design." },
      zepbound_osa: { prob: [40, 55], rating: "yellow", pa: true, notes: "OSA pathway available." },
      mounjaro_t2d: { prob: [80, 90], rating: "green", pa: true, notes: "Near-universal for T2D." },
      ozempic_t2d: { prob: [80, 90], rating: "green", pa: false, notes: "Near-universal for T2D." },
    },
  },
  employer_small: {
    _default: {
      wegovy_weight_loss: { prob: [10, 20], rating: "red", pa: true, notes: "Small employers rarely cover GLP-1s for weight loss." },
      wegovy_cv: { prob: [40, 55], rating: "yellow", pa: true, notes: "CV pathway may be available." },
      zepbound_weight_loss: { prob: [8, 18], rating: "red", pa: true, notes: "Low probability on small employer plans." },
      zepbound_osa: { prob: [30, 45], rating: "yellow", pa: true, notes: "OSA pathway may be available." },
      mounjaro_t2d: { prob: [75, 85], rating: "green", pa: true, notes: "Diabetes coverage more common." },
      ozempic_t2d: { prob: [75, 85], rating: "green", pa: false, notes: "Diabetes coverage more common." },
    },
  },
  aca_marketplace: {
    _default: {
      wegovy_weight_loss: { prob: [5, 15], rating: "red", pa: true, notes: "ACA marketplace plans rarely cover GLP-1s for weight loss." },
      wegovy_cv: { prob: [30, 45], rating: "yellow", pa: true, notes: "CV pathway may be available." },
      zepbound_weight_loss: { prob: [5, 15], rating: "red", pa: true, notes: "Very low probability on marketplace." },
      mounjaro_t2d: { prob: [70, 80], rating: "green", pa: true, notes: "Diabetes coverage varies by plan." },
      ozempic_t2d: { prob: [70, 80], rating: "green", pa: false, notes: "Diabetes coverage varies by plan." },
    },
  },
};

// ─────────────────────────────────────────────
// CARRIER LIST (60+ carriers with search)
// ─────────────────────────────────────────────
type CarrierOption = { label: string; key: string };

const CARRIER_OPTIONS: CarrierOption[] = [
  { label: "UnitedHealthcare", key: "uhc" },
  { label: "Blue Cross Blue Shield (General)", key: "bcbs_generic" },
  { label: "Florida Blue (BCBS FL)", key: "bcbs_fl" },
  { label: "BCBS Massachusetts", key: "bcbs_ma" },
  { label: "BCBS Michigan", key: "bcbs_mi" },
  { label: "Anthem Blue Cross Blue Shield", key: "bcbs_generic" },
  { label: "Highmark Blue Cross Blue Shield", key: "bcbs_generic" },
  { label: "Independence Blue Cross", key: "bcbs_generic" },
  { label: "CareFirst BlueCross BlueShield", key: "bcbs_generic" },
  { label: "Premera Blue Cross", key: "bcbs_generic" },
  { label: "Regence BlueCross BlueShield", key: "bcbs_generic" },
  { label: "BCBS of Texas", key: "bcbs_generic" },
  { label: "BCBS of Illinois", key: "bcbs_generic" },
  { label: "BCBS of North Carolina", key: "bcbs_generic" },
  { label: "BCBS of Georgia", key: "bcbs_generic" },
  { label: "BCBS of Alabama", key: "bcbs_generic" },
  { label: "BCBS of South Carolina", key: "bcbs_generic" },
  { label: "BCBS of Tennessee", key: "bcbs_generic" },
  { label: "BCBS of Arkansas", key: "bcbs_generic" },
  { label: "BCBS of Colorado", key: "bcbs_generic" },
  { label: "BCBS of Arizona", key: "bcbs_generic" },
  { label: "BCBS of Minnesota (MN)", key: "bcbs_generic" },
  { label: "BCBS of Nebraska", key: "bcbs_generic" },
  { label: "BCBS of Kansas City", key: "bcbs_generic" },
  { label: "BCBS of Western New York", key: "bcbs_generic" },
  { label: "BCBS of Vermont", key: "bcbs_generic" },
  { label: "BCBS of Delaware", key: "bcbs_generic" },
  { label: "Aetna", key: "aetna" },
  { label: "Cigna / Evernorth", key: "cigna" },
  { label: "Humana", key: "humana" },
  { label: "Kaiser Permanente", key: "kaiser" },
  { label: "Blue Shield of California", key: "blue_shield_ca" },
  { label: "Medi-Cal (California Medicaid)", key: "medi_cal" },
  { label: "Centene / Ambetter", key: "uhc" },
  { label: "Molina Healthcare", key: "uhc" },
  { label: "WellCare", key: "uhc" },
  { label: "Oscar Health", key: "aetna" },
  { label: "Bright Health", key: "aetna" },
  { label: "Community Health Plan", key: "uhc" },
  { label: "Health Net", key: "aetna" },
  { label: "Tufts Health Plan", key: "uhc" },
  { label: "Harvard Pilgrim Health Care", key: "uhc" },
  { label: "Point32Health", key: "uhc" },
  { label: "Geisinger Health Plan", key: "uhc" },
  { label: "UPMC Health Plan", key: "aetna" },
  { label: "Presbyterian Health Plan", key: "uhc" },
  { label: "Medica", key: "uhc" },
  { label: "Sanford Health", key: "uhc" },
  { label: "CHRISTUS Health Plan", key: "uhc" },
  { label: "Scott & White Health Plan", key: "uhc" },
  { label: "Baylor Scott & White Health Plan", key: "aetna" },
  { label: "CareSource", key: "uhc" },
  { label: "Medical Mutual", key: "uhc" },
  { label: "SummaCare", key: "uhc" },
  { label: "Aultcare", key: "uhc" },
  { label: "Capital BlueCross", key: "bcbs_generic" },
  { label: "Excellus BlueCross BlueShield (NY)", key: "bcbs_generic" },
  { label: "Horizon Blue Cross Blue Shield (NJ)", key: "bcbs_generic" },
  { label: "BCBS of Rhode Island", key: "bcbs_generic" },
  { label: "BCBS of Hawaii", key: "bcbs_generic" },
  { label: "BCBS of Wyoming", key: "bcbs_generic" },
  { label: "TRICARE", key: "tricare" },
  { label: "VA Health", key: "va" },
  { label: "BCBS Federal Employee Program (FEP)", key: "bcbs_fep" },
  { label: "Medicare Part D", key: "medicare" },
  { label: "Medicaid", key: "medicaid" },
  { label: "Other / Not listed", key: "other" },
];

// ─────────────────────────────────────────────
// STATE DATA
// ─────────────────────────────────────────────
const STATE_NAMES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa",
  KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland",
  MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri",
  MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey",
  NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio",
  OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming", DC:"Washington D.C.",
};

// ─────────────────────────────────────────────
// PROBABILITY ENGINE
// ─────────────────────────────────────────────
type QuizAnswers = {
  carrier: CarrierOption | null;
  planSource: string;
  employerSize: string;
  state: string;
  diagnoses: string[];
  bmiRange: string;
};

type MedResult = {
  name: string;
  generic: string;
  manufacturer: string;
  prob: number;
  indicationLabel: string;
  notes: string;
  pa: boolean;
  rating: "green" | "yellow" | "red";
};

function resolveCarrierDbKey(answers: QuizAnswers): string {
  const { carrier, planSource, state } = answers;
  if (planSource === "medicare") return "medicare";
  if (planSource === "tricare") return "tricare";
  if (planSource === "va") return "va";
  if (planSource === "bcbs_fep") return "bcbs_fep";
  if (planSource === "medicaid") {
    if (state === "FL") return "medicaid_fl";
    if (state === "NY") return "medicaid_ny";
    if (state === "IL") return "medicaid_il";
    if (state === "CA") return "medi_cal";
    return "medicaid_generic";
  }

  const key = carrier?.key || "other";

  // Handle BCBS generic with state specifics
  if (key === "bcbs_generic") {
    if (state === "FL") return "bcbs_fl";
    if (state === "MA") return "bcbs_ma";
    if (state === "MI") return "bcbs_mi";
    return "bcbs_generic";
  }

  return key;
}

function getIndicationKey(med: string, diagnoses: string[]): string | null {
  switch (med) {
    case "wegovy":
      if (diagnoses.includes("cvd")) return "wegovy_cv";
      return "wegovy_weight_loss";
    case "zepbound":
      if (diagnoses.includes("osa")) return "zepbound_osa";
      return "zepbound_weight_loss";
    case "mounjaro":
      if (diagnoses.includes("t2d")) return "mounjaro_t2d";
      return null;
    case "ozempic":
      if (diagnoses.includes("t2d")) return "ozempic_t2d";
      return null;
    default:
      return null;
  }
}

function getIndicationLabel(indicationKey: string | null, diagnoses: string[]): string {
  if (!indicationKey) {
    if (diagnoses.includes("t2d")) return "Type 2 Diabetes";
    return "Weight Management (no approved indication)";
  }
  const labels: Record<string, string> = {
    wegovy_weight_loss: "Chronic Weight Management",
    wegovy_cv: "CV Risk Reduction",
    zepbound_weight_loss: "Chronic Weight Management",
    zepbound_osa: "Obstructive Sleep Apnea",
    mounjaro_t2d: "Type 2 Diabetes",
    ozempic_t2d: "Type 2 Diabetes",
  };
  return labels[indicationKey] || "Weight Management";
}

function calculateMedProb(
  med: string,
  dbKey: string,
  state: string,
  answers: QuizAnswers
): MedResult {
  const { diagnoses, employerSize, planSource, bmiRange } = answers;
  const indicationKey = getIndicationKey(med, diagnoses);

  const META: Record<string, { name: string; generic: string; manufacturer: string }> = {
    wegovy: { name: "Wegovy", generic: "semaglutide", manufacturer: "Novo Nordisk" },
    zepbound: { name: "Zepbound", generic: "tirzepatide", manufacturer: "Eli Lilly" },
    mounjaro: { name: "Mounjaro", generic: "tirzepatide", manufacturer: "Eli Lilly" },
    ozempic: { name: "Ozempic", generic: "semaglutide", manufacturer: "Novo Nordisk" },
  };

  if (!indicationKey) {
    return {
      ...META[med],
      prob: med === "mounjaro" ? 5 : 3,
      indicationLabel: "Not approved for weight loss",
      notes:
        med === "ozempic"
          ? "Ozempic is approved for T2D, not weight loss. A diabetes diagnosis would change this."
          : "No covered indication pathway found for your profile.",
      pa: false,
      rating: "red",
    };
  }

  // Look up base probability
  let baseProbRange: [number, number] = [20, 35];
  let notes = "";
  let pa = true;

  const carrierData = CARRIERS_DB[dbKey];
  if (carrierData) {
    const stateData = carrierData.states[state] || carrierData.states["_default"];
    const indication = stateData?.[indicationKey] || carrierData.states["_default"]?.[indicationKey];
    if (indication) {
      baseProbRange = indication.prob;
      notes = indication.notes;
      pa = indication.pa;
    }
  } else {
    // Generic fallback
    const genericKey =
      planSource === "aca" ? "aca_marketplace" :
      employerSize === "large_5000" || employerSize === "gov_federal" ? "employer_large" :
      "employer_small";
    const generic = GENERIC_DB[genericKey];
    const fallback = generic?._default?.[indicationKey];
    if (fallback) {
      baseProbRange = fallback.prob;
      notes = fallback.notes;
      pa = fallback.pa;
    }
  }

  let prob = (baseProbRange[0] + baseProbRange[1]) / 2;

  // Employer size modifier
  const sizeModifiers: Record<string, number> = {
    large_5000: 1.15,
    mid_500: 1.0,
    small: 0.7,
    gov_federal: 1.2,
    gov_state: 0.9,
    self_employed: 0.6,
    not_sure: 0.95,
  };
  if (planSource === "employer") {
    prob *= sizeModifiers[employerSize] || 1.0;
  } else if (planSource === "aca") {
    prob *= 0.5;
  }

  // Diagnosis boosts (scaled 0.3 to avoid double-counting primary)
  const diagBoosts: Record<string, number> = {
    t2d: 30, cvd: 15, osa: 15, prediabetes: 10, mash: 10, metabolic: 8, obesity: 5, pcos: 3,
  };
  let totalBoost = 0;
  for (const d of diagnoses) {
    if (diagBoosts[d]) totalBoost += diagBoosts[d] * 0.3;
  }
  prob += totalBoost;

  // Mandate state bonus
  if (MANDATE_STATES.includes(state) && planSource === "employer") {
    prob += 8;
  }

  // BMI adjustments
  if (bmiRange === "under27") {
    prob -= 15;
  } else if (bmiRange === "27to30" && !diagnoses.some((d) => ["t2d", "cvd", "osa", "metabolic", "mash", "obesity"].includes(d))) {
    prob -= 10;
  } else if (bmiRange === "40plus") {
    prob += 5;
  }

  prob = Math.min(95, Math.max(0, Math.round(prob)));

  const rating: "green" | "yellow" | "red" =
    prob >= 60 ? "green" : prob >= 30 ? "yellow" : "red";

  return {
    ...META[med],
    prob,
    indicationLabel: getIndicationLabel(indicationKey, diagnoses),
    notes,
    pa,
    rating,
  };
}

function calculateAllMeds(answers: QuizAnswers): MedResult[] {
  const dbKey = resolveCarrierDbKey(answers);
  const meds = ["wegovy", "zepbound", "mounjaro", "ozempic"];
  return meds.map((med) => calculateMedProb(med, dbKey, answers.state, answers));
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
type Step = "landing" | 1 | 2 | 3 | 4 | 5 | 6 | "email" | "calculating" | "results";

const TOTAL_QUIZ_STEPS = 6;

function StepWrapper({
  children,
  title,
  subtitle,
  progressPct,
  currentStep,
  totalSteps,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  progressPct: number;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div style={{ fontFamily: "var(--font-body)" }} className="min-h-screen bg-white">
      <div className="w-full h-1 bg-gray-100">
        <div
          className="h-1 bg-[#ed1b1b] transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="mb-2 text-xs text-gray-400 font-heading">
          Step {currentStep} of {totalSteps}
        </div>
        <h2
          style={{ fontFamily: "var(--font-heading)" }}
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-2"
        >
          {title}
        </h2>
        {subtitle && <p className="text-gray-500 text-sm mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default function InsuranceCheckPage() {
  const locale = useLocale();
  const [step, setStep] = useState<Step>("landing");
  const [answers, setAnswers] = useState<QuizAnswers>({
    carrier: null,
    planSource: "",
    employerSize: "",
    state: "",
    diagnoses: [],
    bmiRange: "",
  });
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [calcProgress, setCalcProgress] = useState(0);
  const [results, setResults] = useState<MedResult[]>([]);
  const [carrierSearch, setCarrierSearch] = useState("");
  const [carrierOpen, setCarrierOpen] = useState(false);
  const carrierRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (carrierRef.current && !carrierRef.current.contains(e.target as Node)) {
        setCarrierOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function startCalculating() {
    setStep("calculating");
    setCalcProgress(0);
    const interval = setInterval(() => {
      setCalcProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const meds = calculateAllMeds(answers);
          setResults(meds);
          setStep("results");
          return 100;
        }
        return p + 4;
      });
    }, 100);
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName || !email) return;
    // Fire-and-forget lead capture
    fetch("/api/quiz-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, quizOutcome: "insurance-check", locale, firstName }),
    }).catch(() => {});
    startCalculating();
  }

  const filteredCarriers = CARRIER_OPTIONS.filter((c) =>
    c.label.toLowerCase().includes(carrierSearch.toLowerCase())
  );

  const bestProb = results.length > 0 ? Math.max(...results.map((r) => r.prob)) : 0;
  const bestMed = results.find((r) => r.prob === bestProb);
  const overallRating = bestProb >= 75 ? "green" : bestProb >= 30 ? "yellow" : "red";

  const stateName = answers.state ? STATE_NAMES[answers.state] || answers.state : "";
  const isMandateState = MANDATE_STATES.includes(answers.state);
  const isRestrictedState = RESTRICTED_STATES.includes(answers.state);

  // ── STYLES ──
  const pillBtn =
    "w-full py-4 px-8 rounded-full font-heading font-semibold text-base transition-all duration-200 cursor-pointer text-left";
  const pillBtnSelected =
    "bg-[#ed1b1b] text-white shadow-[0_4px_12px_rgba(237,27,27,0.3)]";
  const pillBtnUnselected =
    "bg-white text-gray-800 border border-gray-200 hover:border-[#ed1b1b] hover:shadow-md";
  const primaryBtn =
    "w-full bg-[#ed1b1b] text-white font-heading font-bold py-4 px-8 rounded-full shadow-[0_4px_12px_rgba(237,27,27,0.2)] hover:bg-[#d01818] hover:shadow-[0_6px_16px_rgba(237,27,27,0.3)] transition-all duration-200 text-lg";
  const outlineBtn =
    "w-full bg-white text-[#ed1b1b] border-2 border-[#ed1b1b] font-heading font-semibold py-3 px-8 rounded-full hover:bg-[#fde7e7] transition-all duration-200";

  const currentStepNum = typeof step === "number" ? step : 0;
  const progressPct =
    typeof step === "number"
      ? Math.round((currentStepNum / (TOTAL_QUIZ_STEPS + (answers.planSource === "employer" ? 1 : 0))) * 100)
      : 0;

  // ── RENDER ──

  // LANDING
  if (step === "landing") {
    return (
      <div style={{ fontFamily: "var(--font-body)" }} className="min-h-screen bg-[#fde7e7]">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="inline-block bg-[#ed1b1b] text-white text-xs font-heading font-bold px-4 py-1 rounded-full mb-6 tracking-wide">
            FREE — NO INSURANCE CARD NEEDED
          </div>
          <h1
            style={{ fontFamily: "var(--font-heading)" }}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            What Are Your Odds of Getting GLP-1 Covered?
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Find out in 2 minutes. Based on your insurer, state, and health profile — no plan
            documents needed.
          </p>
          <p className="text-gray-500 text-sm mb-8 italic">
            This tool provides estimated probabilities only. It does not verify your actual
            insurance benefits or guarantee coverage.
          </p>
          <button onClick={() => setStep(1)} className={primaryBtn} style={{ maxWidth: 400 }}>
            Check My Coverage Odds — Free →
          </button>
          <p className="text-gray-400 text-xs mt-4">
            Created by Dr. Linda Moleon, MD · Double board-certified · No PHI collected
          </p>
        </div>
      </div>
    );
  }

  // STEP 1 — Carrier search
  if (step === 1) {
    return (
      <StepWrapper title="Who is your insurance carrier?" subtitle="Start typing to search — select your insurer from the list." progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        <div ref={carrierRef} className="relative mb-6">
          <input
            type="text"
            value={carrierSearch}
            onChange={(e) => { setCarrierSearch(e.target.value); setCarrierOpen(true); }}
            onFocus={() => setCarrierOpen(true)}
            placeholder="Search insurance company..."
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#ed1b1b] outline-none text-gray-800 text-base transition-colors"
          />
          {carrierOpen && filteredCarriers.length > 0 && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl shadow-xl mt-1 max-h-64 overflow-y-auto">
              {filteredCarriers.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setAnswers((a) => ({ ...a, carrier: c }));
                    setCarrierSearch(c.label);
                    setCarrierOpen(false);
                    setTimeout(() => setStep(2), 200);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-[#fde7e7] text-gray-800 text-sm transition-colors border-b border-gray-50 last:border-0"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {answers.carrier && (
          <div className="bg-[#fde7e7] rounded-2xl p-3 flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700 font-medium">
              Selected: <strong>{answers.carrier.label}</strong>
            </span>
            <button
              onClick={() => { setAnswers((a) => ({ ...a, carrier: null })); setCarrierSearch(""); }}
              className="text-gray-400 hover:text-[#ed1b1b] text-xs"
            >
              Clear
            </button>
          </div>
        )}
        {answers.carrier && (
          <button onClick={() => setStep(2)} className={primaryBtn}>
            Continue →
          </button>
        )}
      </StepWrapper>
    );
  }

  // STEP 2 — How do you get insurance?
  if (step === 2) {
    const options = [
      { value: "employer", label: "Through my employer" },
      { value: "aca", label: "ACA Marketplace (Healthcare.gov)" },
      { value: "medicaid", label: "Medicaid" },
      { value: "medicare", label: "Medicare" },
      { value: "tricare", label: "TRICARE (military)" },
      { value: "va", label: "VA Health" },
      { value: "bcbs_fep", label: "BCBS Federal Employee Program" },
    ];
    return (
      <StepWrapper title="How do you get your insurance?" progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        <div className="space-y-3">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, planSource: o.value }));
                if (o.value === "employer") {
                  setStep(3);
                } else {
                  setStep(4);
                }
              }}
              className={`${pillBtn} ${answers.planSource === o.value ? pillBtnSelected : pillBtnUnselected}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </StepWrapper>
    );
  }

  // STEP 3 — Employer size (conditional)
  if (step === 3) {
    const options = [
      { value: "large_5000", label: "Large (5,000+ employees)" },
      { value: "mid_500", label: "Mid-size (500–4,999 employees)" },
      { value: "small", label: "Small (under 500 employees)" },
      { value: "gov_federal", label: "Government / Federal" },
      { value: "gov_state", label: "Government / State or Local" },
      { value: "self_employed", label: "Self-employed" },
      { value: "not_sure", label: "Not sure" },
    ];
    return (
      <StepWrapper title="How large is your employer?" subtitle="This affects which benefits your plan likely offers." progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        <div className="space-y-3">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, employerSize: o.value }));
                setStep(4);
              }}
              className={`${pillBtn} ${answers.employerSize === o.value ? pillBtnSelected : pillBtnUnselected}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </StepWrapper>
    );
  }

  // STEP 4 — State
  if (step === 4) {
    const stateList = Object.entries(STATE_NAMES);
    return (
      <StepWrapper title="What state are you in?" subtitle="Coverage rules vary significantly by state." progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        {answers.state && isMandateState && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
            ✓ Your state requires fully-insured plans to cover weight loss medication.
          </div>
        )}
        {answers.state && isRestrictedState && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
            ⚠ Some insurers in your state have recently limited GLP-1 coverage.
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
          {stateList.map(([abbr]) => (
            <button
              key={abbr}
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, state: abbr }));
                setTimeout(() => setStep(5), 150);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-heading font-semibold transition-all duration-150 border
                ${answers.state === abbr
                  ? "bg-[#ed1b1b] text-white border-[#ed1b1b]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#ed1b1b] hover:text-[#ed1b1b]"
                }`}
            >
              {abbr}
            </button>
          ))}
        </div>
        {answers.state && (
          <button onClick={() => setStep(5)} className={primaryBtn}>
            Continue with {stateName} →
          </button>
        )}
      </StepWrapper>
    );
  }

  // STEP 5 — Health conditions
  if (step === 5) {
    const options = [
      { value: "t2d", label: "Type 2 Diabetes" },
      { value: "prediabetes", label: "Prediabetes / Insulin Resistance" },
      { value: "obesity", label: "Obesity (BMI 30+)" },
      { value: "osa", label: "Sleep Apnea (OSA)" },
      { value: "cvd", label: "Heart Disease / Cardiovascular" },
      { value: "metabolic", label: "Metabolic Syndrome" },
      { value: "pcos", label: "PCOS" },
      { value: "mash", label: "MASH / Fatty Liver Disease" },
      { value: "none", label: "None / Not sure" },
    ];
    function toggleDiagnosis(val: string) {
      if (val === "none") {
        setAnswers((a) => ({ ...a, diagnoses: ["none"] }));
        return;
      }
      setAnswers((a) => {
        const current = a.diagnoses.filter((d) => d !== "none");
        if (current.includes(val)) {
          return { ...a, diagnoses: current.filter((d) => d !== val) };
        }
        return { ...a, diagnoses: [...current, val] };
      });
    }
    return (
      <StepWrapper title="Do you have any of these health conditions?" subtitle="Select all that apply. This helps find your best covered pathway." progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        <div className="space-y-3 mb-6">
          {options.map((o) => {
            const isSelected = answers.diagnoses.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggleDiagnosis(o.value)}
                className={`${pillBtn} flex items-center justify-between ${isSelected ? pillBtnSelected : pillBtnUnselected}`}
              >
                <span>{o.label}</span>
                {isSelected && <span className="text-lg">✓</span>}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setStep(6)}
          disabled={answers.diagnoses.length === 0}
          className={`${primaryBtn} disabled:opacity-40`}
        >
          Continue →
        </button>
      </StepWrapper>
    );
  }

  // STEP 6 — BMI range
  if (step === 6) {
    const options = [
      { value: "under27", label: "Under 27" },
      { value: "27to30", label: "27–29.9" },
      { value: "30to35", label: "30–34.9" },
      { value: "35to40", label: "35–39.9" },
      { value: "40plus", label: "40+" },
      { value: "not_sure", label: "Not sure" },
    ];
    return (
      <StepWrapper title="What is your approximate BMI range?" subtitle="Most plans require BMI 30+ (or 27+ with a comorbidity)." progressPct={progressPct} currentStep={currentStepNum} totalSteps={TOTAL_QUIZ_STEPS}>
        <div className="space-y-3">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setAnswers((a) => ({ ...a, bmiRange: o.value }));
                setStep("email");
              }}
              className={`${pillBtn} ${answers.bmiRange === o.value ? pillBtnSelected : pillBtnUnselected}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </StepWrapper>
    );
  }

  // EMAIL CAPTURE
  if (step === "email") {
    return (
      <div style={{ fontFamily: "var(--font-body)" }} className="min-h-screen bg-[#fde7e7] flex items-center">
        <div className="max-w-md mx-auto px-4 py-12 w-full">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#fde7e7] flex items-center justify-center mx-auto mb-4 text-2xl">
                🎯
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)" }} className="text-2xl font-bold text-gray-900 mb-2">
                Your results are ready!
              </h2>
              <p className="text-gray-500 text-sm">
                Enter your info to see your personalized coverage probability report.
              </p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name *"
                required
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ed1b1b] outline-none text-gray-800 transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address *"
                required
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ed1b1b] outline-none text-gray-800 transition-colors"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional — for text updates)"
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-[#ed1b1b] outline-none text-gray-800 transition-colors"
              />
              <button type="submit" className={primaryBtn}>
                Show My Results →
              </button>
              <p className="text-gray-400 text-xs text-center">
                We&apos;ll send your results + coverage tips. No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // CALCULATING ANIMATION
  if (step === "calculating") {
    return (
      <div style={{ fontFamily: "var(--font-body)" }} className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4 max-w-sm">
          <div className="w-20 h-20 rounded-full border-4 border-[#fde7e7] border-t-[#ed1b1b] animate-spin mx-auto mb-6" />
          <h2 style={{ fontFamily: "var(--font-heading)" }} className="text-2xl font-bold text-gray-900 mb-3">
            Analyzing your profile...
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Cross-referencing your insurer, state, and health profile against coverage data
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#ed1b1b] rounded-full transition-all duration-100"
              style={{ width: `${calcProgress}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-3">{calcProgress}% complete</p>
        </div>
      </div>
    );
  }

  // RESULTS
  if (step === "results" && results.length > 0) {
    const ratingColors = {
      green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", bar: "bg-green-500", hero: "#f0fdf4", num: "#15803d" },
      yellow: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "bg-amber-400", hero: "#fffbeb", num: "#b45309" },
      red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", bar: "bg-red-400", hero: "#fff1f2", num: "#b91c1c" },
    };
    const heroColor = ratingColors[overallRating];
    const ratingLabel = overallRating === "green" ? "Good odds!" : overallRating === "yellow" ? "Worth exploring" : "Coverage unlikely";
    const sortedResults = [...results].sort((a, b) => b.prob - a.prob);

    return (
      <div style={{ fontFamily: "var(--font-body)" }} className="min-h-screen bg-white">
        {/* Hero score */}
        <div style={{ backgroundColor: heroColor.hero }} className="px-4 pt-10 pb-8">
          <div className="max-w-lg mx-auto text-center">
            <div className={`inline-block text-xs font-heading font-bold px-4 py-1 rounded-full mb-3 ${heroColor.text} ${heroColor.bg} border ${heroColor.border}`}>
              {ratingLabel}
            </div>
            <div style={{ color: heroColor.num, fontFamily: "var(--font-heading)" }} className="text-7xl font-black mb-1">
              {bestProb}%
            </div>
            <p className="text-gray-700 text-base mb-2">
              <strong>{firstName || "Your profile"}</strong>, based on your{" "}
              <strong>{answers.carrier?.label || "insurance plan"}</strong> in{" "}
              <strong>{stateName}</strong>
            </p>
            {bestMed && (
              <p className="text-gray-500 text-sm">
                Best pathway: <strong>{bestMed.name}</strong> via {bestMed.indicationLabel}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pb-16">
          {/* Inline disclaimer — non-dismissible */}
          <div className="my-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
            <strong>⚠ Important:</strong> These estimates are based on published formulary data and carrier policies as of March 2026.{" "}
            <strong>This is not a guarantee of coverage.</strong> Body Good does not determine your insurance coverage at any point. Your actual coverage depends on your specific plan details, which can only be verified by checking your real benefits.
          </div>

          {/* Per-medication cards */}
          <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-lg font-bold text-gray-900 mb-4">
            Your est. coverage probability by medication
          </h3>
          <div className="space-y-4 mb-8">
            {sortedResults.map((med) => {
              const c = ratingColors[med.rating];
              const ratingText = med.rating === "green" ? "Good odds" : med.rating === "yellow" ? "Worth exploring" : "Low odds";
              return (
                <div
                  key={med.name}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-5 hover:scale-[1.01] transition-transform duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div style={{ fontFamily: "var(--font-heading)" }} className="text-lg font-bold text-gray-900">
                        {med.name}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {med.generic} · {med.manufacturer}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontFamily: "var(--font-heading)", color: c.num }} className="text-2xl font-black">
                        {med.prob}%
                      </div>
                      <div className={`text-xs font-semibold ${c.text}`}>{ratingText}</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                    <div
                      className={`h-2 rounded-full ${c.bar} transition-all duration-700`}
                      style={{ width: `${med.prob}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    <strong>Pathway:</strong> {med.indicationLabel}
                    {med.pa && <span className="ml-2 text-amber-600">· Prior auth required</span>}
                  </div>
                  {med.notes && (
                    <p className="text-xs text-gray-400 italic">{med.notes}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    ↑ Est. approval probability — not a guarantee of coverage
                  </div>
                </div>
              );
            })}
          </div>

          {/* $25 UPSELL BLOCK */}
          {overallRating === "green" && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="text-green-700 text-xs font-heading font-bold mb-1">GREAT NEWS — YOUR ODDS LOOK STRONG</div>
              <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-xl font-bold text-gray-900 mb-2">
                Want to know for sure?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For $25, we verify your actual insurance benefits in real-time and tell you exactly
                what&apos;s covered, what needs prior authorization, and your exact next steps.
              </p>
              <a
                href={`/${locale}/products/insurance-eligibility-check`}
                className="block w-full bg-[#ed1b1b] text-white text-center font-heading font-bold py-4 px-8 rounded-full shadow-[0_4px_12px_rgba(237,27,27,0.2)] hover:bg-[#d01818] transition-all duration-200 mb-3"
              >
                Confirm My Coverage — $25 →
              </a>
              <p className="text-gray-400 text-xs text-center">
                This is a one-time, non-refundable eligibility verification fee. We check your actual benefits — not an estimate.
              </p>
            </div>
          )}

          {overallRating === "yellow" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
              <div className="text-amber-700 text-xs font-heading font-bold mb-1">COVERAGE IS POSSIBLE — LET&apos;S FIND OUT</div>
              <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-xl font-bold text-gray-900 mb-2">
                Your odds depend on your specific plan details
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For $25, we&apos;ll check your actual benefits and find the strongest pathway for
                your situation — so you don&apos;t leave coverage on the table.
              </p>
              <a
                href={`/${locale}/products/insurance-eligibility-check`}
                className="block w-full bg-[#ed1b1b] text-white text-center font-heading font-bold py-4 px-8 rounded-full shadow-[0_4px_12px_rgba(237,27,27,0.2)] hover:bg-[#d01818] transition-all duration-200 mb-3"
              >
                Check My Real Coverage — $25 →
              </a>
              <p className="text-gray-400 text-xs text-center">
                This is a one-time, non-refundable eligibility verification fee.
              </p>
            </div>
          )}

          {overallRating === "red" && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="text-gray-500 text-xs font-heading font-bold mb-1">INSURANCE COVERAGE IS UNLIKELY FOR WEIGHT LOSS</div>
              <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-xl font-bold text-gray-900 mb-2">
                Your plan may not cover GLP-1 medications for weight loss
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Based on your insurer and profile, coverage for weight management is low. However,
                you can still access effective GLP-1 treatment through our self-pay program — no
                insurance battles, no delays.
              </p>
              <a
                href={`/${locale}/programs`}
                className="block w-full bg-[#ed1b1b] text-white text-center font-heading font-bold py-4 px-8 rounded-full shadow-[0_4px_12px_rgba(237,27,27,0.2)] hover:bg-[#d01818] transition-all duration-200 mb-3"
              >
                Start Self-Pay — from $169/mo →
              </a>
              <button
                onClick={() => setStep("landing")}
                className={outlineBtn}
              >
                Have a diagnosis we didn&apos;t capture? Retake the quiz →
              </button>
            </div>
          )}

          {/* Self-pay fallback (always visible) */}
          {overallRating !== "red" && (
            <div className="bg-[#fde7e7] rounded-2xl p-4 mb-6 text-center">
              <p className="text-gray-600 text-sm">
                Don&apos;t want to deal with insurance?{" "}
                <a href={`/${locale}/programs`} className="text-[#ed1b1b] font-semibold hover:underline">
                  Start self-pay from $169/mo →
                </a>
              </p>
            </div>
          )}

          {/* Retake */}
          <div className="text-center mb-8">
            <button
              onClick={() => {
                setStep("landing");
                setAnswers({ carrier: null, planSource: "", employerSize: "", state: "", diagnoses: [], bmiRange: "" });
                setCarrierSearch("");
                setResults([]);
              }}
              className="text-gray-400 text-sm hover:text-[#ed1b1b] transition-colors"
            >
              ← Start over
            </button>
          </div>

          {/* Footer disclaimer */}
          <div className="border-t border-gray-100 pt-6 text-xs text-gray-400 leading-relaxed">
            Probability estimates based on published carrier formularies, state mandates, and Body Good clinical data as of March 2026. This tool provides estimates only — not guarantees. Body Good does not determine insurance coverage at any point. Insurance policies change frequently. Individual results depend on specific plan details. Created by Dr. Linda Moleon, MD — double board-certified in obesity medicine and anesthesiology.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
