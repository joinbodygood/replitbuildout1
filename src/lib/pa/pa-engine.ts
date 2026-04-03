import { db as prisma } from "@/lib/db";
import { DIAGNOSES, TREATMENTS, STATE_DOI, ROUND_CONFIG, DRUG_DISPLAY } from "./constants";
import type { LetterParams, DenialInfo, LaunchRoundResult } from "./types";
import { addNote } from "./case-service";

function dateStr(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function dxStr(dxIds: string[]): string {
  return dxIds
    .map((id) => DIAGNOSES.find((d) => d.id === id))
    .filter(Boolean)
    .map((d) => `${d!.icdCode} (${d!.label})`)
    .join("\n    ");
}

function txStr(txIds: string[]): string {
  return txIds
    .map((id) => TREATMENTS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => `  - ${t!.label}`)
    .join("\n");
}

function homaIrStr(insulin?: number, glucose?: number): string {
  if (!insulin || !glucose) return "";
  const val = ((insulin * glucose) / 405).toFixed(1);
  const elevated = parseFloat(val) > 2.5;
  return `HOMA-IR: ${val} ${elevated ? "(ELEVATED — confirms insulin resistance)" : ""}`;
}

function generateR1R2Letter(p: LetterParams): string {
  const codes = dxStr(p.diagnoses);
  const txl = txStr(p.treatments);
  const isRound2 = p.indication === "metabolic";
  const isAppeal = p.round === 3;
  const drugDisplay = DRUG_DISPLAY[p.drug] ?? p.drug;
  const denialCount = p.allDenials.filter((d) => d.denied).length;

  let prefix: string;
  if (isAppeal) {
    prefix = `FORMAL APPEAL — PRIOR AUTHORIZATION DENIAL\n*** PEER-TO-PEER REVIEW REQUESTED ***\n`;
  } else if (isRound2) {
    prefix = `LETTER OF MEDICAL NECESSITY\n*** NEW SUBMISSION — METABOLIC INDICATION ***\n`;
  } else {
    prefix = `LETTER OF MEDICAL NECESSITY\n`;
  }

  let body: string;
  if (isAppeal) {
    body = `I am formally appealing the denial of ${drugDisplay}. This patient has been denied ${denialCount} times despite ${p.diagnoses.length} documented diagnoses. I request IMMEDIATE peer-to-peer review.\n`;
  } else if (isRound2) {
    body = `This is a NEW prior authorization request under the metabolic/endocrine disease indication. This is NOT a weight management request. NOT an appeal of a previous denial.\n`;
  } else {
    body = `I am requesting prior authorization for ${drugDisplay} for my patient.\n`;
  }

  const metabolicDisclaimer = isRound2
    ? "This medication is prescribed for the management of metabolic endocrine disease — specifically prediabetes with metabolic syndrome, insulin resistance, and T2DM prevention. This is NOT weight management."
    : "This medication is NOT prescribed for cosmetic weight loss. It is clinically indicated for the treatment of serious metabolic disease.";

  const appealGuidelines = isAppeal
    ? "SUPPORTING GUIDELINES: ADA Standards of Care (2026), Endocrine Society Guidelines, SELECT Trial, SURMOUNT Trials, CMS BALANCE Model.\n\nDelaying treatment exposes this patient to preventable disease progression.\n"
    : "";

  return `${prefix}
Date: ${dateStr()}
Patient: ${p.patient.patientName || "[NAME]"} | DOB: ${p.patient.dob || "[DOB]"} | Member: ${p.patient.memberId || "[ID]"}
Medication: ${drugDisplay}
${isAppeal ? `Denial Ref: [ENTER REF NUMBER]\n` : ""}
To Whom It May Concern,

${body}
I am double board-certified in Obesity Medicine and Anesthesiology.

DIAGNOSES: ${codes}

CLINICAL DATA: BMI ${p.clinical.bmi || "___"} | A1C ${p.clinical.a1c || "___"}% | FG ${p.clinical.glucose || "___"} | Insulin ${p.clinical.insulin || "___"} | Trig ${p.clinical.triglycerides || "___"} | HDL ${p.clinical.hdl || "___"}
${homaIrStr(p.clinical.insulin, p.clinical.glucose)}

PRIOR TREATMENTS: ${txl || "[DOCUMENT]"}

${metabolicDisclaimer}

${appealGuidelines}
Sincerely,
Dr. Linda Moleon, DO | Board Certified — Obesity Medicine, Anesthesiology
NPI: 1558788851 | Body Good Studio`;
}

function generateR4Letter(p: LetterParams): string {
  const codes = dxStr(p.diagnoses);
  const txl = txStr(p.treatments);
  const denials = p.allDenials.filter((d) => d.denied);
  const denialHistory = denials
    .map((d) => `${d.drug}: Denied ${d.date || "?"} — ${d.reason || "unknown"} (Ref: ${d.ref || "?"})`)
    .join("\n    ");
  const denialCount = denials.length;
  const inconsistent = new Set(denials.map((d) => d.reason)).size > 1;

  return `REQUEST FOR EXTERNAL INDEPENDENT REVIEW
*** FORMAL REQUEST UNDER ACA SECTION 2719 / 45 CFR 147.136 ***

Date: ${dateStr()}
Patient: ${p.patient.patientName || "[PATIENT NAME]"}
DOB: ${p.patient.dob || "[DOB]"}
Member ID: ${p.patient.memberId || "[MEMBER ID]"}
Insurance: ${p.patient.carrier || "[CARRIER]"}
Plan Type: ${p.patient.insuranceType || "[PLAN TYPE]"}

To the External Review Entity / Independent Review Organization:

I am requesting an external independent review of the repeated denial of GLP-1 receptor agonist therapy for my patient pursuant to the Affordable Care Act, Section 2719, and implementing regulations at 45 CFR 147.136.

This patient has been denied medically necessary medication ${denialCount} times through the internal appeals process. All internal remedies have been exhausted.

COMPLETE DENIAL HISTORY:
    ${denialHistory}

${inconsistent ? `IMPORTANT: The insurer has provided INCONSISTENT denial reasons across these ${denialCount} denials. This pattern of shifting rationale suggests the denials are not based on consistent, evidence-based medical criteria.\n` : ""}
PATIENT CLINICAL PROFILE:
    Diagnoses (ICD-10):
    ${codes}

    Labs:
    BMI: ${p.clinical.bmi || "___"} kg/m2  |  A1C: ${p.clinical.a1c || "___"}%
    Fasting Glucose: ${p.clinical.glucose || "___"} mg/dL  |  Fasting Insulin: ${p.clinical.insulin || "___"} uIU/mL
    Triglycerides: ${p.clinical.triglycerides || "___"} mg/dL  |  HDL: ${p.clinical.hdl || "___"} mg/dL
    ${homaIrStr(p.clinical.insulin, p.clinical.glucose)}

DOCUMENTED PRIOR TREATMENTS (all insufficient):
${txl || "  [See attached medical records]"}

MEDICAL NECESSITY ARGUMENT:
This patient has ${p.diagnoses.length} documented diagnoses constituting a serious, progressive metabolic condition. The requested GLP-1 receptor agonist therapy is the standard of care per:
    - ADA Standards of Care (2026) for metabolic disease management
    - Endocrine Society Clinical Practice Guidelines
    - SELECT Trial: 20% reduction in MACE with semaglutide
    - SURMOUNT Trials: clinically significant metabolic improvement with tirzepatide
    - CMS BALANCE Model (2026): federal recognition of this patient population for GLP-1 therapy

${p.notes ? `ADDITIONAL NOTES:\n${p.notes}\n` : ""}
ATTACHMENTS:
    1. All ${denialCount} denial letters with reference numbers
    2. All prior authorization submission letters (Rounds 1-3)
    3. All appeal letters with clinical documentation
    4. Complete patient medical records and lab results
    5. Relevant clinical guidelines and trial citations
    6. Physician certification form (if required by state)

Sincerely,
Dr. Linda Moleon, DO
Board Certified — Obesity Medicine, Anesthesiology
NPI: 1558788851
Body Good Studio`;
}

function generateR5Letter(p: LetterParams): string {
  const codes = dxStr(p.diagnoses);
  const denials = p.allDenials.filter((d) => d.denied);
  const denialHistory = denials
    .map((d) => `${d.drug}: Denied ${d.date || "?"} — ${d.reason || "unknown"} (Ref: ${d.ref || "?"})`)
    .join("\n    ");
  const denialCount = denials.length;
  const reasons = [...new Set(denials.map((d) => d.reason).filter(Boolean))];
  const inconsistent = reasons.length > 1;
  const stateInfo = STATE_DOI[p.patient.state ?? ""] ?? STATE_DOI.OTHER;

  return `FORMAL COMPLAINT TO STATE DEPARTMENT OF INSURANCE
*** REQUEST FOR INVESTIGATION AND ENFORCEMENT ACTION ***

Date: ${dateStr()}
Filed with: ${stateInfo.name}

COMPLAINANT INFORMATION:
Patient: ${p.patient.patientName || "[PATIENT NAME]"}
DOB: ${p.patient.dob || "[DOB]"}
Address: [PATIENT ADDRESS]
Phone: [PATIENT PHONE]
Email: [PATIENT EMAIL]

INSURANCE COMPANY INFORMATION:
Carrier: ${p.patient.carrier || "[CARRIER NAME]"}
Plan: ${p.patient.planName || "[PLAN NAME]"}
Member ID: ${p.patient.memberId || "[MEMBER ID]"}
Group: ${p.patient.groupNumber || "[GROUP NUMBER]"}

COMPLAINT SUMMARY:
I am filing this complaint against ${p.patient.carrier || "[CARRIER]"} for the systematic and unjustified denial of medically necessary GLP-1 receptor agonist therapy. Over the course of ${denialCount} separate requests and appeals, the insurer has failed to provide coverage for treatment recognized as the standard of care by the ADA, Endocrine Society, and CMS.

${p.extReviewOutcome ? `An external independent review was also conducted, resulting in: ${p.extReviewOutcome}.\n` : ""}

SPECIFIC ALLEGATIONS:

1. DENIAL OF MEDICALLY NECESSARY TREATMENT
The patient has ${p.diagnoses.length} documented medical diagnoses:
    ${codes}

2. ${inconsistent ? `INCONSISTENT AND SHIFTING DENIAL RATIONALE
The insurer has provided different denial reasons: ${reasons.join(", ")}.` : `PATTERN OF UNREASONABLE DENIAL
The insurer has denied ${denialCount} separate requests using the rationale "${reasons[0] || "various"}."`}

3. POTENTIAL VIOLATION OF STATE INSURANCE REGULATIONS
    - State unfair claims practices act
    - ACA requirements for coverage of medically necessary medications
    - State external review compliance requirements

COMPLETE DENIAL TIMELINE:
    ${denialHistory}

RESOLUTION REQUESTED:
1. Immediate approval of GLP-1 receptor agonist therapy
2. Investigation into the insurer's pattern of GLP-1 medication denials
3. Enforcement action if violations found
4. Written explanation from the insurer justifying each denial

PRESCRIBING PHYSICIAN:
Dr. Linda Moleon, DO
Board Certified — Obesity Medicine, Anesthesiology
NPI: 1558788851
Body Good Studio | joinbodygood.com

${p.notes ? `ADDITIONAL NOTES:\n${p.notes}\n` : ""}
Filed by:
${p.patient.patientName || "[PATIENT NAME]"}
Date: ${dateStr()}

Supporting physician:
Dr. Linda Moleon, DO
NPI: 1558788851`;
}

export function generateLetter(params: LetterParams): string {
  if (params.round === 4) return generateR4Letter(params);
  if (params.round === 5) return generateR5Letter(params);
  return generateR1R2Letter(params);
}

export async function launchRound(
  caseId: string,
  round: number,
  adminId: string
): Promise<LaunchRoundResult> {
  const caseData = await prisma.insuranceCase.findUnique({
    where: { id: caseId },
    include: {
      submissions: true,
      clinicalData: true,
    },
  });
  if (!caseData) throw new Error("Case not found");

  const clinical = caseData.clinicalData;
  const config = ROUND_CONFIG[round];
  if (!config) throw new Error(`Invalid round: ${round}`);

  const allDenials: DenialInfo[] = caseData.submissions
    .filter((s) => s.status === "denied")
    .map((s) => ({
      drug: DRUG_DISPLAY[s.drug] ?? s.drug,
      denied: true,
      reason: s.denialReason ?? "",
      date: s.denialDate?.toLocaleDateString("en-US") ?? "",
      text: s.denialText ?? "",
      ref: s.denialRef ?? "",
    }));

  const letterParams: Omit<LetterParams, "drug" | "indication"> = {
    patient: {
      patientName: caseData.patientName,
      dob: caseData.patientDob ?? undefined,
      memberId: caseData.memberId ?? undefined,
      carrier: caseData.carrierName ?? undefined,
      planName: caseData.planName ?? undefined,
      groupNumber: caseData.groupNumber ?? undefined,
      state: caseData.patientState,
      insuranceType: caseData.planType ?? undefined,
    },
    clinical: {
      bmi: clinical?.bmi ?? undefined,
      a1c: clinical?.a1c ?? undefined,
      glucose: clinical?.fastingGlucose ?? undefined,
      insulin: clinical?.fastingInsulin ?? undefined,
      triglycerides: clinical?.triglycerides ?? undefined,
      hdl: clinical?.hdl ?? undefined,
    },
    diagnoses: (clinical?.diagnoses as string[]) ?? [],
    treatments: (clinical?.priorTreatments as string[]) ?? [],
    round,
    allDenials,
  };

  const submissions = [];
  for (const drugConfig of config.drugs) {
    const letterText = generateLetter({
      ...letterParams,
      drug: drugConfig.drug,
      indication: drugConfig.indication,
    });

    const submission = await prisma.pASubmission.create({
      data: {
        caseId,
        drug: drugConfig.drug,
        round,
        indication: drugConfig.indication,
        status: "drafted",
        letterText,
        letterVersion: 1,
      },
    });
    submissions.push(submission);
  }

  await prisma.insuranceCase.update({
    where: { id: caseId },
    data: { paRound: round, stage: "pa_processing" },
  });

  await addNote(
    caseId,
    adminId,
    `Round ${round} launched — ${submissions.length} submission(s) created`,
    "letter_generated",
    { round, drugs: config.drugs.map((d) => d.drug) }
  );

  return { round, submissions };
}

export async function regenerateLetter(submissionId: string) {
  const submission = await prisma.pASubmission.findUnique({
    where: { id: submissionId },
    include: {
      case: {
        include: { submissions: true, clinicalData: true },
      },
    },
  });
  if (!submission) throw new Error("Submission not found");

  const caseData = submission.case;
  const clinical = caseData.clinicalData;

  const allDenials: DenialInfo[] = caseData.submissions
    .filter((s) => s.status === "denied")
    .map((s) => ({
      drug: DRUG_DISPLAY[s.drug] ?? s.drug,
      denied: true,
      reason: s.denialReason ?? "",
      date: s.denialDate?.toLocaleDateString("en-US") ?? "",
      text: s.denialText ?? "",
      ref: s.denialRef ?? "",
    }));

  const letterText = generateLetter({
    patient: {
      patientName: caseData.patientName,
      dob: caseData.patientDob ?? undefined,
      memberId: caseData.memberId ?? undefined,
      carrier: caseData.carrierName ?? undefined,
      planName: caseData.planName ?? undefined,
      groupNumber: caseData.groupNumber ?? undefined,
      state: caseData.patientState,
      insuranceType: caseData.planType ?? undefined,
    },
    clinical: {
      bmi: clinical?.bmi ?? undefined,
      a1c: clinical?.a1c ?? undefined,
      glucose: clinical?.fastingGlucose ?? undefined,
      insulin: clinical?.fastingInsulin ?? undefined,
      triglycerides: clinical?.triglycerides ?? undefined,
      hdl: clinical?.hdl ?? undefined,
    },
    diagnoses: (clinical?.diagnoses as string[]) ?? [],
    treatments: (clinical?.priorTreatments as string[]) ?? [],
    drug: submission.drug,
    round: submission.round,
    indication: submission.indication,
    allDenials,
  });

  return prisma.pASubmission.update({
    where: { id: submissionId },
    data: { letterText, letterVersion: { increment: 1 } },
  });
}

export function getDenialRebuttal(reason: string, drug: string, diagnoses: string[]): string {
  const drugDisplay = DRUG_DISPLAY[drug] ?? drug;
  const dxCount = diagnoses.length;

  const rebuttals: Record<string, string> = {
    "Non-Formulary": `${drugDisplay} may not appear on the plan's standard formulary, but formulary exclusions do not override medical necessity. The patient has ${dxCount} documented diagnoses requiring GLP-1 therapy. The ADA Standards of Care (2026) and Endocrine Society guidelines explicitly recommend GLP-1 receptor agonists for patients with this clinical profile. Formulary placement is a cost management tool, not a clinical determination. We request a formulary exception based on medical necessity.`,
    "Not Medically Necessary": `The denial of ${drugDisplay} as "not medically necessary" is contradicted by the patient's clinical profile: ${dxCount} documented diagnoses, elevated HOMA-IR confirming insulin resistance, and failure of prior conservative treatments. The ADA Standards of Care (2026), SELECT Trial, and SURMOUNT Trials all establish GLP-1 therapy as the standard of care for this patient population. The insurer's medical director is invited to a peer-to-peer review to discuss the clinical evidence.`,
    "Step Therapy Required": `The patient has completed extensive step therapy including physician-supervised diet and exercise, lifestyle counseling, and prior pharmacotherapy. These interventions have been documented as insufficient. Requiring additional step therapy delays medically necessary treatment and exposes the patient to progressive metabolic deterioration. We request a step therapy exception based on documented prior treatment failure.`,
    "Weight Loss Excluded": `This medication is NOT prescribed for cosmetic weight loss. It is prescribed for the treatment of serious metabolic endocrine disease — specifically prediabetes with metabolic syndrome, insulin resistance, and obesity-related comorbidities. The patient has ${dxCount} documented ICD-10 diagnoses. Blanket "weight loss exclusion" policies do not apply to the treatment of metabolic disease with FDA-approved medications.`,
    "Missing Documentation": `All required documentation has been provided with this submission, including: complete medical records, lab results with metabolic panel, documented prior treatment history, ICD-10 diagnosis codes, and physician certification of medical necessity. If specific additional documentation is required, please specify exactly what is needed so we can provide it immediately.`,
    "Off-Label": `${drugDisplay} is FDA-approved for the treatment of obesity and/or type 2 diabetes. This patient's documented diagnoses fall within the FDA-approved indications. This is NOT off-label use. If the insurer is classifying this as off-label, we request clarification on which specific indication they consider off-label, as the patient's clinical profile aligns with approved indications.`,
    "Quantity Limit": `The prescribed dosage follows the manufacturer's recommended titration schedule and FDA-approved dosing guidelines. The quantity requested is clinically appropriate for this patient's treatment plan. We request a quantity limit exception based on the prescribing physician's clinical judgment and established dosing protocols.`,
  };

  return rebuttals[reason] ?? `The denial of ${drugDisplay} for "${reason}" is not supported by the patient's clinical profile. The patient has ${dxCount} documented diagnoses requiring GLP-1 therapy per ADA Standards of Care (2026). We request reconsideration with peer-to-peer review.`;
}

export function analyzeBestPathway(denials: { drug: string; status: string; round: number; indication: string }[]): { drug: string; indication: string; reasoning: string } {
  // Metabolic-indication drugs (Ozempic/Mounjaro) have 93-94% approval rates
  // Weight-indication drugs (Wegovy/Zepbound) have 8-16% approval rates
  // Prefer the drug with the fewest denials under the metabolic indication

  const metabolicDenials = denials.filter(d => d.indication === "metabolic" && d.status === "denied");
  const weightDenials = denials.filter(d => (d.indication === "weight_cv" || d.indication === "weight_osa") && d.status === "denied");

  // If any metabolic drug was approved, use that
  const metabolicApproved = denials.find(d => d.indication === "metabolic" && d.status === "approved");
  if (metabolicApproved) {
    return { drug: metabolicApproved.drug, indication: "metabolic", reasoning: `${DRUG_DISPLAY[metabolicApproved.drug]} was already approved under metabolic indication.` };
  }

  // Prefer Mounjaro (93% approval) over Ozempic (94%) for external review — tirzepatide is dual-agonist
  const mourjaroDenied = metabolicDenials.find(d => d.drug === "mounjaro");
  const ozempicDenied = metabolicDenials.find(d => d.drug === "ozempic");

  if (mourjaroDenied && ozempicDenied) {
    // Both denied — use Mounjaro for external review (stronger clinical argument with dual GIP/GLP-1 mechanism)
    return { drug: "mounjaro", indication: "metabolic", reasoning: "Mounjaro (tirzepatide) selected for external review — dual GIP/GLP-1 agonist provides stronger clinical argument for metabolic disease treatment." };
  }

  if (ozempicDenied) {
    return { drug: "ozempic", indication: "metabolic", reasoning: "Ozempic (semaglutide) selected — denied under metabolic indication, strong evidence base from SELECT Trial." };
  }

  if (mourjaroDenied) {
    return { drug: "mounjaro", indication: "metabolic", reasoning: "Mounjaro (tirzepatide) selected — denied under metabolic indication, SURMOUNT Trial evidence." };
  }

  // Fallback: if only weight-indication denials exist, use the weight drug with most evidence
  if (weightDenials.length > 0) {
    return { drug: "wegovy", indication: "weight_cv", reasoning: "Wegovy (semaglutide) selected — weight/CV indication with SELECT Trial cardiovascular benefit data." };
  }

  // Default
  return { drug: "mounjaro", indication: "metabolic", reasoning: "Default selection — Mounjaro (tirzepatide) under metabolic indication has highest approval rate (93%)." };
}
