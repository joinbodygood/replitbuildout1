export interface Dose {
  mg: string;
  tier: string;
  label: string;
  tag?: string;
}

export interface TierPricing {
  [tierName: string]: {
    [duration: number]: number;
  };
}

export interface BGSProduct {
  sku: string;
  name: string;
  program: string;
  type: "compounded" | "pharmacy_only" | "both" | "service";
  description: string;
  bestFor: string;
  slug?: string;
  prices?: Record<number, number>;
  doses?: Dose[];
  tierPricing?: TierPricing;
  pharmacyFee?: number;
  pharmacyDescription?: string;
  ongoingFee?: number;
  servicePrice?: number;
  serviceLabel?: string;
  onetimePrice?: number;
  isAcute?: boolean;
}

export const BGS_PRODUCTS: Record<string, BGSProduct> = {
  // ── WEIGHT LOSS — SELF PAY INJECTABLES ──
  "WM-TIR-INJ": {
    sku: "WM-TIR-INJ",
    name: "Tirzepatide Injection",
    program: "Weight Loss — Self Pay",
    type: "compounded",
    description: "Compounded Tirzepatide / B6 (Pyridoxine) Injectable",
    bestFor: "Most effective GLP-1 — dual action (GLP-1 + GIP)",
    slug: "tirzepatide",
    onetimePrice: 315,
    doses: [
      { mg: "2.5mg",   tier: "starter",     label: "2.5mg",   tag: "Starting dose" },
      { mg: "5mg",     tier: "starter",     label: "5mg" },
      { mg: "7.5mg",   tier: "starter",     label: "7.5mg" },
      { mg: "9mg",     tier: "starter",     label: "9mg",     tag: "Starter max" },
      { mg: "10mg",    tier: "maintenance", label: "10mg" },
      { mg: "11.25mg", tier: "maintenance", label: "11.25mg" },
      { mg: "12.5mg",  tier: "maintenance", label: "12.5mg" },
      { mg: "13.5mg",  tier: "maintenance", label: "13.5mg" },
      { mg: "14.75mg", tier: "maintenance", label: "14.75mg", tag: "Max dose" },
    ],
    tierPricing: {
      starter:     { 1: 299, 3: 279, 6: 259 },
      maintenance: { 1: 349, 3: 329, 6: 319 },
    },
  },

  "WM-SEM-INJ": {
    sku: "WM-SEM-INJ",
    name: "Semaglutide Injection",
    program: "Weight Loss — Self Pay",
    type: "compounded",
    description: "Compounded Semaglutide / B6 (Pyridoxine) Injectable",
    bestFor: "Proven GLP-1 for steady, sustainable weight loss",
    slug: "semaglutide",
    onetimePrice: 179,
    doses: [
      { mg: "0.25mg", tier: "flat", label: "0.25mg", tag: "Starting dose" },
      { mg: "0.5mg",  tier: "flat", label: "0.5mg" },
      { mg: "1mg",    tier: "flat", label: "1mg" },
      { mg: "1.7mg",  tier: "flat", label: "1.7mg" },
      { mg: "2.4mg",  tier: "flat", label: "2.4mg", tag: "Max dose" },
    ],
    tierPricing: {
      flat: { 1: 169, 3: 149, 6: 139 },
    },
  },

  // ── WEIGHT LOSS — ORAL ──
  "WM-ORAL-SEM": {
    sku: "WM-ORAL-SEM",
    name: "Glow Rx — Oral Semaglutide",
    program: "Weight Loss — Oral",
    type: "compounded",
    description: "Sublingual Semaglutide Tablets · 28ct · No needles",
    bestFor: "Needle-free GLP-1 weight loss",
    slug: "semaglutide",
    onetimePrice: 149,
    prices: { 1: 129, 3: 119, 6: 109 },
  },

  "WM-ORAL-TIR": {
    sku: "WM-ORAL-TIR",
    name: "Glow Rx — Oral Tirzepatide",
    program: "Weight Loss — Oral",
    type: "compounded",
    description: "Sublingual Tirzepatide Tablets · No needles",
    bestFor: "Most effective GLP-1 without injections",
    slug: "tirzepatide",
    prices: { 1: 129, 3: 119, 6: 109 },
  },

  "WM-ORAL-METCOMBO": {
    sku: "WM-ORAL-METCOMBO",
    name: "Metformin + Topiramate Combo",
    program: "Weight Loss — Oral",
    type: "compounded",
    description: "Compounded capsules — insulin resistance + appetite control",
    bestFor: "PCOS, pre-diabetes, or insulin resistance",
    prices: { 1: 129, 3: 119, 6: 109 },
  },

  "WM-ORAL-LDN": {
    sku: "WM-ORAL-LDN",
    name: "Low-Dose Naltrexone",
    program: "Weight Loss — Oral",
    type: "compounded",
    description: "LDN 4.5mg capsules — cravings & inflammation",
    bestFor: "Emotional eating and food cravings",
    prices: { 1: 129, 3: 119 },
  },

  // ── WEIGHT LOSS — BRANDED RX ──
  "WM-BRAND-MGMT": {
    sku: "WM-BRAND-MGMT",
    name: "Branded Rx Management (Wegovy/Zepbound)",
    program: "Weight Loss — Branded Rx",
    type: "pharmacy_only",
    description: "Prescription for Wegovy or Zepbound sent to your pharmacy",
    bestFor: "Patients who want brand-name medication",
    slug: "wegovy",
    pharmacyFee: 55,
    ongoingFee: 45,
  },

  // ── WEIGHT LOSS — ADD-ONS ──
  "WM-ADDON-ZOFRAN": {
    sku: "WM-ADDON-ZOFRAN",
    name: "Ondansetron 4mg (Anti-Nausea)",
    program: "Weight Loss — Add-On",
    type: "both",
    description: "Dissolving tablets — stops GLP-1 nausea",
    bestFor: "GLP-1 nausea relief",
    slug: "ondansetron",
    prices: { 1: 29 },
    pharmacyFee: 25,
  },

  "WM-ADDON-BUPNAL": {
    sku: "WM-ADDON-BUPNAL",
    name: "Bupropion + Naltrexone + Chromium",
    program: "Weight Loss — Add-On",
    type: "compounded",
    description: "Appetite + cravings combo capsules",
    bestFor: "Weight loss plateaus",
    prices: { 1: 69 },
  },

  // ── WEIGHT LOSS — INSURANCE SERVICES ──
  "INS-ELIG": {
    sku: "INS-ELIG",
    name: "Insurance Eligibility Check",
    program: "Weight Loss — Insurance",
    type: "service",
    description: "Verify your insurance GLP-1 coverage",
    bestFor: "Patients with insurance",
    servicePrice: 25,
    serviceLabel: "One-time eligibility check",
  },

  "INS-PA": {
    sku: "INS-PA",
    name: "Prior Authorization Processing",
    program: "Weight Loss — Insurance",
    type: "service",
    description: "PA submission + one appeal",
    bestFor: "Patients needing prior auth",
    servicePrice: 50,
    serviceLabel: "One-time PA processing",
  },

  "INS-APPROVE": {
    sku: "INS-APPROVE",
    name: "Insurance Approval Activation",
    program: "Weight Loss — Insurance",
    type: "service",
    description: "Activation upon approval",
    bestFor: "Newly approved patients",
    servicePrice: 85,
    serviceLabel: "One-time activation",
  },

  "INS-ONGOING": {
    sku: "INS-ONGOING",
    name: "Insurance Ongoing Management",
    program: "Weight Loss — Insurance",
    type: "service",
    description: "Monthly support, refills, appeals",
    bestFor: "Approved patients needing management",
    servicePrice: 75,
    serviceLabel: "Monthly management",
  },

  // ── WELLNESS INJECTIONS ──
  "WI-B12": {
    sku: "WI-B12",
    name: "Vitamin B12 Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "Cyanocobalamin 1000mcg/mL · 10mL",
    bestFor: "Energy, fatigue, GLP-1 support",
    prices: { 1: 49 },
  },

  "WI-LIPOC": {
    sku: "WI-LIPOC",
    name: "Lipo-C Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "Methionine · Inositol · Choline · B12 · 10mL",
    bestFor: "Fat metabolism and energy",
    prices: { 1: 99 },
  },

  "WI-LSB": {
    sku: "WI-LSB",
    name: "Lipotropic Super B",
    program: "Wellness Injections",
    type: "compounded",
    description: "11-ingredient energy + fat-burning shot",
    bestFor: "Energy, fat-burning, metabolism",
    prices: { 1: 99, 3: 89 },
  },

  "WI-LCAR": {
    sku: "WI-LCAR",
    name: "L-Carnitine Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "L-Carnitine 200mg/mL · 10mL",
    bestFor: "Fat burning, muscle preservation",
    prices: { 1: 99 },
  },

  "WI-GLUT": {
    sku: "WI-GLUT",
    name: "Glutathione Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "200mg/mL · 30mL · Master antioxidant",
    bestFor: "Detox, skin, cellular health",
    prices: { 1: 149 },
  },

  "WI-NAD": {
    sku: "WI-NAD",
    name: "NAD+ Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "100mg/mL · 10mL",
    bestFor: "Anti-aging, brain, longevity",
    prices: { 1: 199 },
  },

  "WI-SERM": {
    sku: "WI-SERM",
    name: "Sermorelin Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "3mg/mL · 6mL · GH peptide",
    bestFor: "Muscle, sleep, recovery",
    prices: { 1: 179, 3: 149, 6: 129 },
  },

  "WI-PA": {
    sku: "WI-PA",
    name: "Pentadeca Arginate Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "Peptide for tissue repair, recovery & performance",
    bestFor: "Athletic recovery & tissue repair",
    prices: { 1: 179, 3: 149, 6: 129 },
  },

  "WI-VitC": {
    sku: "WI-VitC",
    name: "Ascorbic Acid Injection",
    program: "Wellness Injections",
    type: "compounded",
    description: "High-dose injectable Vitamin C · 500mg/mL · 30mL",
    bestFor: "Immune support & antioxidant protection",
    prices: { 1: 79, 3: 65, 6: 55 },
  },

  // ── HAIR LOSS ──
  "HL-W-STARTER": {
    sku: "HL-W-STARTER",
    name: "Hair Restore Starter (Women)",
    program: "Hair Loss",
    type: "both",
    description: "Compounded Minoxidil 5% topical — entry-level formula · 30mL shipped to door",
    bestFor: "Early-stage or recently-noticed hair thinning",
    slug: "hair-restore-starter-women",
    prices: { 1: 49, 3: 117 },
    pharmacyFee: 25,
    pharmacyDescription: "Plain Minoxidil Rx sent to your local pharmacy",
  },

  "HL-W-TOPICAL": {
    sku: "HL-W-TOPICAL",
    name: "Hair Restore Topical (Women)",
    program: "Hair Loss",
    type: "both",
    description: "Compounded Minoxidil + Tretinoin + Vit E + Melatonin · 30mL shipped to door",
    bestFor: "Moderate thinning & diffuse hair loss",
    slug: "hair-restore-topical-women",
    prices: { 1: 59, 3: 147 },
    pharmacyFee: 25,
    pharmacyDescription: "Plain Minoxidil Rx sent to your local pharmacy",
  },

  "HL-W-PLUS": {
    sku: "HL-W-PLUS",
    name: "Hair Restore Plus (Women)",
    program: "Hair Loss",
    type: "both",
    description: "Oral Minoxidil 2.5mg + Scalp Peptide Serum — dual-action combo shipped to door",
    bestFor: "Persistent thinning, patches, or hormonal hair loss",
    slug: "hair-restore-plus-women",
    prices: { 1: 99, 3: 237, 6: 414 },
    pharmacyFee: 25,
    pharmacyDescription: "Plain Minoxidil Rx sent to your local pharmacy",
  },

  "HL-W-MINOX": {
    sku: "HL-W-MINOX",
    name: "Compounded Minoxidil (Women)",
    program: "Hair Loss",
    type: "both",
    description: "Compounded Minoxidil + Tretinoin + Vit E + Melatonin · 30mL — shipped to door",
    bestFor: "Thinning hair & diffuse hair loss",
    slug: "minoxidil",
    prices: { 1: 59, 3: 54, 6: 49 },
    pharmacyFee: 25,
    pharmacyDescription: "Plain Minoxidil Rx sent to your local pharmacy",
  },

  "HL-W-PEPTIDE": {
    sku: "HL-W-PEPTIDE",
    name: "Scalp Peptide Serum (Women)",
    program: "Hair Loss",
    type: "compounded",
    description: "GHK-Cu + Biotin topical serum · 30mL",
    bestFor: "Thinning hair & early-stage hair loss",
    prices: { 1: 79, 3: 72, 6: 65 },
  },

  "HL-ORAL-MINOX": {
    sku: "HL-ORAL-MINOX",
    name: "Oral Minoxidil 2.5mg",
    program: "Hair Loss",
    type: "pharmacy_only",
    description: "Oral tablet · 30-day supply — Rx sent to your local pharmacy",
    bestFor: "Thinning hair & early-stage hair loss",
    slug: "minoxidil",
    prices: { 1: 35 },
    pharmacyFee: 25,
  },

  "HL-M-FIN": {
    sku: "HL-M-FIN",
    name: "Finasteride 1mg",
    program: "Hair Loss",
    type: "both",
    description: "Oral capsules · 30ct · DHT blocker",
    bestFor: "Pattern hair loss & receding hairline",
    slug: "finasteride",
    prices: { 1: 35 },
    pharmacyFee: 25,
  },

  "HL-M-COMBO": {
    sku: "HL-M-COMBO",
    name: "Compounded Minoxidil Combo Spray",
    program: "Hair Loss",
    type: "both",
    description: "Compounded Minoxidil 7% + Finasteride + Arginine + Biotin · 30mL — shipped to door",
    bestFor: "Moderate hair loss & thinning temples",
    slug: "minoxidil",
    prices: { 1: 59, 3: 162, 6: 294 },
    pharmacyFee: 25,
    pharmacyDescription: "Plain Minoxidil Rx sent to your local pharmacy",
  },

  "HL-M-MAX": {
    sku: "HL-M-MAX",
    name: "Hair Restore Max — 7-Ingredient Formula",
    program: "Hair Loss",
    type: "compounded",
    description: "Compounded Minoxidil 10% + 6 active boosters · Most powerful formula — shipped to door",
    bestFor: "Aggressive or long-standing hair loss",
    prices: { 1: 79, 3: 216, 6: 390 },
  },

  "HL-DUTAST": {
    sku: "HL-DUTAST",
    name: "Dutasteride 0.5mg",
    program: "Hair Loss",
    type: "both",
    description: "Oral capsule · 30ct · Blocks 99% DHT",
    bestFor: "Advanced hair loss unresponsive to finasteride",
    slug: "dutasteride",
    prices: { 1: 49 },
    pharmacyFee: 25,
  },

  // ── SKINCARE ──
  "SK-GLOW": {
    sku: "SK-GLOW",
    name: "Glow Cream",
    program: "Skincare",
    type: "both",
    description: "Azelaic + Tretinoin + Niacinamide · 30g",
    bestFor: "Anti-aging, acne, uneven skin tone",
    slug: "tretinoin",
    prices: { 1: 69 },
    pharmacyFee: 25,
  },

  "SK-BRIGHT": {
    sku: "SK-BRIGHT",
    name: "Bright Cream",
    program: "Skincare",
    type: "both",
    description: "Hydroquinone 8% + 4 actives · 30g",
    bestFor: "Melasma, dark spots, hyperpigmentation",
    slug: "hydroquinone",
    prices: { 1: 89 },
    pharmacyFee: 25,
  },

  "SK-EVEN": {
    sku: "SK-EVEN",
    name: "Even Tone Cream",
    program: "Skincare",
    type: "both",
    description: "Hydroquinone 4% + Kojic Acid + Vitamin C · 30g",
    bestFor: "Mild hyperpigmentation & uneven skin tone",
    slug: "hydroquinone",
    prices: { 1: 85 },
    pharmacyFee: 25,
  },

  "SK-CLEAR": {
    sku: "SK-CLEAR",
    name: "Clear Skin Combo",
    program: "Skincare",
    type: "both",
    description: "Spironolactone + Tretinoin · Hormonal acne",
    bestFor: "Hormonal acne & cystic breakouts",
    slug: "spironolactone",
    prices: { 1: 69 },
    pharmacyFee: 25,
  },

  "SK-ROSACEA": {
    sku: "SK-ROSACEA",
    name: "Rosacea Calm Cream",
    program: "Skincare",
    type: "both",
    description: "Metronidazole + Azelaic Acid · 30g",
    bestFor: "Rosacea, redness, skin sensitivity",
    slug: "metronidazole",
    prices: { 1: 55 },
    pharmacyFee: 25,
  },

  "SK-ANTIAGE": {
    sku: "SK-ANTIAGE",
    name: "Age-Defying Cream",
    program: "Skincare",
    type: "compounded",
    description: "Tretinoin + Vitamin C + Peptides · 30g",
    bestFor: "Fine lines, wrinkles, skin firmness",
    prices: { 1: 79 },
  },

  // ── FEMININE HEALTH ──
  "FH-UTI": {
    sku: "FH-UTI",
    name: "UTI Treatment",
    program: "Feminine Health",
    type: "pharmacy_only",
    description: "Nitrofurantoin Rx sent to your pharmacy",
    bestFor: "Active UTI symptoms",
    slug: "nitrofurantoin",
    pharmacyFee: 35,
    isAcute: true,
  },

  "FH-YEAST": {
    sku: "FH-YEAST",
    name: "Yeast Infection Treatment",
    program: "Feminine Health",
    type: "pharmacy_only",
    description: "Fluconazole Rx sent to your pharmacy",
    bestFor: "Yeast infection relief",
    slug: "fluconazole",
    pharmacyFee: 35,
    isAcute: true,
  },

  "FH-BV": {
    sku: "FH-BV",
    name: "BV Treatment",
    program: "Feminine Health",
    type: "pharmacy_only",
    description: "Metronidazole Rx sent to your pharmacy",
    bestFor: "Bacterial vaginosis relief",
    slug: "metronidazole",
    pharmacyFee: 35,
    isAcute: true,
  },

  "FH-VAGDRY": {
    sku: "FH-VAGDRY",
    name: "Vaginal Dryness Rx",
    program: "Feminine Health",
    type: "both",
    description: "Estradiol cream Rx — hormone support",
    bestFor: "Vaginal dryness & discomfort",
    slug: "estradiol",
    prices: { 1: 65 },
    pharmacyFee: 25,
  },

  "FH-SCREAM1": {
    sku: "FH-SCREAM1",
    name: "Intimate Wellness Cream",
    program: "Feminine Health",
    type: "compounded",
    description: "Sildenafil + Arginine + Papaverine · 30g",
    bestFor: "Arousal & sensitivity",
    prices: { 1: 65 },
  },

  "FH-SCREAM2": {
    sku: "FH-SCREAM2",
    name: "Intimate Wellness Plus",
    program: "Feminine Health",
    type: "compounded",
    description: "Enhanced formula with additional actives · 30g",
    bestFor: "Enhanced arousal & natural lubrication",
    prices: { 1: 75 },
  },

  "FH-OXYTOCIN": {
    sku: "FH-OXYTOCIN",
    name: "Connection Rx (Oxytocin)",
    program: "Feminine Health",
    type: "compounded",
    description: "Oxytocin nasal spray · 10mL",
    bestFor: "Intimacy, bonding, emotional connection",
    prices: { 1: 79 },
  },

  // ── MENTAL HEALTH ──
  "MW-ANXIETY": {
    sku: "MW-ANXIETY",
    name: "Calm Rx (Buspirone)",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Buspirone sent to your pharmacy",
    bestFor: "Generalized anxiety",
    slug: "buspirone",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-STAGE": {
    sku: "MW-STAGE",
    name: "Stage Ready (Propranolol)",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Propranolol sent to your pharmacy",
    bestFor: "Performance anxiety & situational stress",
    slug: "propranolol",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-SLEEP": {
    sku: "MW-SLEEP",
    name: "Sleep Rx",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Trazodone sent to your pharmacy",
    bestFor: "Insomnia & sleep disruption",
    slug: "trazodone",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-LIFT-SSRI": {
    sku: "MW-LIFT-SSRI",
    name: "Lift Rx (SSRI)",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Sertraline sent to your pharmacy",
    bestFor: "Depression & mood support",
    slug: "sertraline",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-LIFT-SNRI": {
    sku: "MW-LIFT-SNRI",
    name: "Lift Rx Plus (SNRI)",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Venlafaxine sent to your pharmacy",
    bestFor: "Depression + anxiety combined",
    slug: "venlafaxine",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-MOMENTUM": {
    sku: "MW-MOMENTUM",
    name: "Momentum Rx (Bupropion)",
    program: "Mental Health",
    type: "pharmacy_only",
    description: "Rx: Bupropion sent to your pharmacy",
    bestFor: "Depression, low energy & focus",
    slug: "bupropion",
    pharmacyFee: 25,
    ongoingFee: 25,
  },

  "MW-SELANK": {
    sku: "MW-SELANK",
    name: "Selank Nasal Spray",
    program: "Mental Health",
    type: "compounded",
    description: "Peptide anti-anxiety · 6mL nasal spray",
    bestFor: "Fast anxiety relief without pills",
    prices: { 1: 129 },
  },
};
