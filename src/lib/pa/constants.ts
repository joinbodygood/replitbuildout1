import type { Diagnosis, Treatment, StateDOI, RoundConfig } from "./types";

export const DIAGNOSES: Diagnosis[] = [
  { id: "obesity_c1", label: "Obesity, Class 1 (BMI 30-34.9)", icdCode: "E66.811" },
  { id: "obesity_c2", label: "Obesity, Class 2 (BMI 35-39.9)", icdCode: "E66.812" },
  { id: "obesity_c3", label: "Obesity, Class 3 / Morbid (BMI 40+)", icdCode: "E66.813" },
  { id: "t2dm", label: "Type 2 Diabetes Mellitus", icdCode: "E11.9" },
  { id: "prediabetes", label: "Prediabetes", icdCode: "R73.03" },
  { id: "metabolic_syn", label: "Metabolic Syndrome", icdCode: "E88.81" },
  { id: "hyperinsulinemia", label: "Hyperinsulinemia", icdCode: "E16.1" },
  { id: "hypertension", label: "Hypertension", icdCode: "I10" },
  { id: "dyslipidemia", label: "Dyslipidemia", icdCode: "E78.5" },
  { id: "high_trig", label: "Hypertriglyceridemia (>150)", icdCode: "E78.1" },
  { id: "low_hdl", label: "Low HDL (<50F/<40M)", icdCode: "E78.6" },
  { id: "cvd", label: "Established CVD", icdCode: "I25.10" },
  { id: "pcos", label: "PCOS", icdCode: "E28.2" },
  { id: "osa", label: "Obstructive Sleep Apnea", icdCode: "G47.33" },
  { id: "nafld", label: "NAFLD", icdCode: "K76.0" },
  { id: "mash", label: "MASH (F2-F3)", icdCode: "K75.81" },
  { id: "ckd", label: "Chronic Kidney Disease", icdCode: "N18.x" },
  { id: "joint_pain", label: "Obesity-related Joint Pain", icdCode: "M19.90" },
];

export const TREATMENTS: Treatment[] = [
  { id: "metformin", label: "Metformin" },
  { id: "metformin_fail", label: "Metformin — inadequate response" },
  { id: "metformin_intol", label: "Metformin — intolerance" },
  { id: "diet_exercise", label: "Physician-supervised diet + exercise" },
  { id: "dietitian", label: "Registered Dietitian" },
  { id: "structured_program", label: "Structured program (WW, Noom)" },
  { id: "lifestyle_chart", label: "Lifestyle counseling in chart" },
  { id: "orlistat", label: "Orlistat / Alli" },
  { id: "contrave", label: "Contrave" },
  { id: "phentermine", label: "Phentermine" },
  { id: "saxenda_prior", label: "Prior GLP-1 (Saxenda, Victoza)" },
  { id: "bariatric_consult", label: "Bariatric surgery consultation" },
];

export const DENIAL_REASONS = [
  "Non-Formulary",
  "Not Medically Necessary",
  "Step Therapy Required",
  "Weight Loss Excluded",
  "Missing Documentation",
  "Off-Label",
  "Quantity Limit",
  "Other",
] as const;

export const STAGES = [
  "probability",
  "eligibility_review",
  "pending_pa_purchase",
  "pa_processing",
  "pending_activation",
  "active_management",
  "closed_approved",
  "closed_exhausted",
  "closed_ineligible",
  "closed_cancelled",
] as const;

export type Stage = (typeof STAGES)[number];

export const STAGE_LABELS: Record<string, string> = {
  probability: "Probability Check",
  eligibility_review: "Eligibility Review",
  pending_pa_purchase: "Pending PA Purchase",
  pa_processing: "PA Processing",
  pending_activation: "Pending Activation",
  active_management: "Active Management",
  closed_approved: "Closed — Approved",
  closed_exhausted: "Closed — Exhausted",
  closed_ineligible: "Closed — Ineligible",
  closed_cancelled: "Closed — Cancelled",
};

export const STAGE_FRIENDLY: Record<string, string> = {
  probability: "We scored your coverage odds.",
  eligibility_review: "We're reviewing your insurance coverage. You'll hear from us within 24-48 hours.",
  pending_pa_purchase: "Great news — you're eligible! Complete your PA purchase to proceed.",
  pa_processing: "Your prior authorization is being processed.",
  pending_activation: "Your PA was approved! Complete activation to start your medication.",
  active_management: "You're all set. Your medication is covered by insurance.",
  closed_approved: "Your case is complete. Insurance is covering your medication.",
  closed_exhausted: "We've exhausted all insurance options. Contact us about our cash-pay program.",
  closed_ineligible: "Unfortunately, your insurance doesn't cover GLP-1 medications. Contact us about our cash-pay program.",
  closed_cancelled: "This case has been cancelled.",
};

export const DRUGS = ["wegovy", "zepbound", "ozempic", "mounjaro"] as const;

export const DRUG_DISPLAY: Record<string, string> = {
  wegovy: "Wegovy (semaglutide)",
  zepbound: "Zepbound (tirzepatide)",
  ozempic: "Ozempic (semaglutide)",
  mounjaro: "Mounjaro (tirzepatide)",
};

export const ROUND_CONFIG: Record<number, RoundConfig> = {
  1: {
    drugs: [
      { drug: "wegovy", indication: "weight_cv" },
      { drug: "zepbound", indication: "weight_osa" },
    ],
    strategy: "Standard PA — weight/CV and weight/OSA indications. Submit both simultaneously via CoverMyMeds.",
    isAppeal: false,
  },
  2: {
    drugs: [
      { drug: "ozempic", indication: "metabolic" },
      { drug: "mounjaro", indication: "metabolic" },
    ],
    strategy: "THE PIVOT — NEW PAs under metabolic/endocrine indication. NOT appeals. Different drug, different indication.",
    isAppeal: false,
  },
  3: {
    drugs: [
      { drug: "wegovy", indication: "appeal" },
      { drug: "zepbound", indication: "appeal" },
      { drug: "ozempic", indication: "appeal" },
      { drug: "mounjaro", indication: "appeal" },
    ],
    strategy: "FULL APPEAL — all 4 denials. Every letter demands peer-to-peer review.",
    isAppeal: true,
  },
  4: {
    drugs: [
      { drug: "best_candidate", indication: "external_review" },
    ],
    strategy: "EXTERNAL INDEPENDENT REVIEW — under ACA Section 2719 / 45 CFR 147.136.",
    isAppeal: false,
  },
  5: {
    drugs: [
      { drug: "all", indication: "state_complaint" },
    ],
    strategy: "STATE INSURANCE COMMISSIONER COMPLAINT — regulatory pressure.",
    isAppeal: false,
  },
};

export const STATE_DOI: Record<string, StateDOI> = {
  FL: { name: "Florida Dept. of Financial Services", phone: "877-693-5236", url: "myfloridacfo.com/division/consumers/needourhelp", method: "Online portal, phone, or mail", extReview: "State process via FL DOI" },
  TX: { name: "Texas Dept. of Insurance", phone: "800-252-3439", url: "tdi.texas.gov/consumer/get-help-with-an-insurance-complaint.html", method: "Online portal, phone, fax, or mail", extReview: "HHS/DOL administered (most plans)" },
  NY: { name: "NY Dept. of Financial Services", phone: "800-342-3736", url: "dfs.ny.gov/complaint", method: "Online DFS Portal", extReview: "State process via DFS external appeal" },
  CA: { name: "CA Dept. of Insurance / DMHC", phone: "800-927-4357", url: "insurance.ca.gov / dmhc.ca.gov", method: "Online portal or mail", extReview: "Independent Medical Review via DMHC or CDI" },
  GA: { name: "GA Office of Insurance Commissioner", phone: "404-656-2070", url: "oci.georgia.gov/file-consumer-insurance-complaint", method: "Online portal", extReview: "State process" },
  OH: { name: "Ohio Dept. of Insurance", phone: "800-686-1526", url: "insurance.ohio.gov", method: "Online portal", extReview: "State process" },
  VA: { name: "VA State Corporation Commission", phone: "804-371-9741", url: "scc.virginia.gov/pages/Bureau-of-Insurance", method: "Online or mail", extReview: "State process" },
  NC: { name: "NC Dept. of Insurance", phone: "855-408-1212", url: "ncdoi.gov", method: "Online portal", extReview: "State process" },
  NJ: { name: "NJ Dept. of Banking and Insurance", phone: "800-446-7467", url: "state.nj.us/dobi/consumer.htm", method: "Online or mail", extReview: "State IURO process" },
  PA: { name: "PA Dept. of Insurance", phone: "877-881-6388", url: "pa.gov/agencies/insurance", method: "Online CSO portal", extReview: "State Independent External Review" },
  IL: { name: "Illinois Dept. of Insurance", phone: "866-445-5364", url: "insurance.illinois.gov", method: "Online, email, fax, or mail", extReview: "State process via IDOI" },
  MA: { name: "MA Division of Insurance", phone: "877-563-4467", url: "mass.gov/orgs/division-of-insurance", method: "Online or mail", extReview: "State process" },
  MD: { name: "Maryland Insurance Administration", phone: "800-492-6116", url: "insurance.maryland.gov", method: "Online portal", extReview: "State process" },
  SC: { name: "SC Dept. of Insurance", phone: "803-737-6180", url: "doi.sc.gov", method: "Online or mail", extReview: "State process" },
  CT: { name: "CT Insurance Dept.", phone: "860-297-3900", url: "portal.ct.gov/cid", method: "Online or mail", extReview: "State process" },
  AZ: { name: "AZ Dept. of Insurance", phone: "602-364-2499", url: "difi.az.gov", method: "Online portal", extReview: "State process" },
  TN: { name: "TN Dept. of Commerce and Insurance", phone: "615-741-2218", url: "tn.gov/commerce", method: "Online or mail", extReview: "State process" },
  CO: { name: "CO Division of Insurance", phone: "303-894-7490", url: "dora.colorado.gov/insurance", method: "Online portal", extReview: "State process" },
  MI: { name: "MI Dept. of Insurance", phone: "877-999-6442", url: "michigan.gov/difs", method: "Online portal", extReview: "State process" },
  WI: { name: "WI Office of Commissioner of Insurance", phone: "800-236-8517", url: "oci.wi.gov", method: "Online portal", extReview: "State process" },
  OTHER: { name: "Find your state at naic.org", phone: "See naic.org", url: "content.naic.org/state-insurance-departments", method: "Varies by state", extReview: "State or HHS-administered" },
};

export const SUBMISSION_STATUSES = [
  "drafted",
  "submitted",
  "pending_response",
  "approved",
  "denied",
  "appeal_filed",
  "external_review",
  "state_complaint",
] as const;
