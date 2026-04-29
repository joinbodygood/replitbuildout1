export type MedicationKey = "wegovy" | "zepbound" | "mounjaro" | "ozempic" | "foundayo";
export type IndicationKey = "weight_loss" | "t2d" | "cv" | "osa" | "mash";

export interface Medication {
  key: MedicationKey;
  brand: string;
  generic: string;
  manufacturer: "Novo Nordisk" | "Eli Lilly";
  form: "injection" | "oral";
  rxcui: string | null;
  ndcs: string[];
  fdaIndications: IndicationKey[];
  primaryIndication: IndicationKey;
  fdaIndicationLabel: string;
}

export const MEDICATIONS: Medication[] = [
  { key: "wegovy", brand: "Wegovy", generic: "semaglutide 2.4mg", manufacturer: "Novo Nordisk", form: "injection",
    rxcui: null, ndcs: ["00169-4525-13","00169-4524-13","00169-4523-13","00169-4522-13","00169-4521-13"],
    fdaIndications: ["weight_loss","cv","mash"], primaryIndication: "weight_loss",
    fdaIndicationLabel: "Weight loss, CV risk reduction, MASH" },
  { key: "zepbound", brand: "Zepbound", generic: "tirzepatide", manufacturer: "Eli Lilly", form: "injection",
    rxcui: null, ndcs: ["00002-2506-80","00002-2471-80","00002-2472-80","00002-2473-80","00002-2474-80"],
    fdaIndications: ["weight_loss","osa"], primaryIndication: "weight_loss",
    fdaIndicationLabel: "Weight loss, obstructive sleep apnea" },
  { key: "mounjaro", brand: "Mounjaro", generic: "tirzepatide", manufacturer: "Eli Lilly", form: "injection",
    rxcui: null, ndcs: ["00002-1495-80","00002-1496-80","00002-1497-80","00002-1498-80","00002-1499-80"],
    fdaIndications: ["t2d"], primaryIndication: "t2d", fdaIndicationLabel: "Type 2 diabetes" },
  { key: "ozempic", brand: "Ozempic", generic: "semaglutide 0.5/1/2mg", manufacturer: "Novo Nordisk", form: "injection",
    rxcui: null, ndcs: ["00169-4130-13","00169-4132-13","00169-4772-13"],
    fdaIndications: ["t2d","cv"], primaryIndication: "t2d", fdaIndicationLabel: "Type 2 diabetes, CV protection" },
  { key: "foundayo", brand: "Foundayo", generic: "orforglipron", manufacturer: "Eli Lilly", form: "oral",
    rxcui: null, ndcs: [],
    fdaIndications: ["weight_loss"], primaryIndication: "weight_loss",
    fdaIndicationLabel: "Weight loss (oral GLP-1, FDA approved April 2026)" },
];

const BY_KEY = Object.fromEntries(MEDICATIONS.map(m => [m.key, m])) as Record<MedicationKey, Medication>;
const WL = new Set<MedicationKey>(["wegovy","zepbound","foundayo"]);
const DM = new Set<MedicationKey>(["ozempic","mounjaro"]);

export function getMedicationByKey(key: string): Medication | undefined { return BY_KEY[key as MedicationKey]; }
export function isWeightLossMed(key: string): boolean { return WL.has(key as MedicationKey); }
export function isDiabetesMed(key: string): boolean { return DM.has(key as MedicationKey); }
