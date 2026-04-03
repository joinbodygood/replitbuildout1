import type { InsuranceCase, PASubmission, PatientClinicalData, CaseNote, AdminUser } from "@prisma/client";

// Re-exports
export type { InsuranceCase, PASubmission, PatientClinicalData, CaseNote };

export type CaseWithRelations = InsuranceCase & {
  submissions: PASubmission[];
  clinicalData: PatientClinicalData | null;
  notes: CaseNote[];
  assignedTo: Pick<AdminUser, "id" | "name" | "email"> | null;
};

export type InsuranceCaseSummary = InsuranceCase & {
  assignedTo: Pick<AdminUser, "id" | "name"> | null;
  _count: { submissions: number };
};

export interface CreateCaseInput {
  patientEmail: string;
  patientName: string;
  patientDob?: string;
  patientPhone?: string;
  patientState: string;
  carrierId?: string;
  carrierName?: string;
  memberId?: string;
  groupNumber?: string;
  planName?: string;
  planType?: string;
  subscriberName?: string;
  subscriberDob?: string;
  subscriberRelation?: string;
  insuranceCardFrontUrl?: string;
  insuranceCardBackUrl?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  probabilityScore?: number;
  probabilityBucket?: string;
  eligibilityData?: unknown;
  orderId?: string;
  quizLeadId?: string;
  stage?: string;
}

export interface UpdateCaseInput {
  patientName?: string;
  patientDob?: string;
  patientPhone?: string;
  patientState?: string;
  carrierId?: string;
  carrierName?: string;
  memberId?: string;
  groupNumber?: string;
  planName?: string;
  planType?: string;
  subscriberName?: string;
  subscriberDob?: string;
  subscriberRelation?: string;
  insuranceCardFrontUrl?: string;
  insuranceCardBackUrl?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  stage?: string;
  paRound?: number;
  assignedToId?: string;
}

export interface ClinicalInput {
  bmi?: number;
  a1c?: number;
  fastingGlucose?: number;
  fastingInsulin?: number;
  triglycerides?: number;
  hdl?: number;
  diagnoses?: string[];
  priorTreatments?: string[];
  clinicalNotes?: string;
}

export interface CaseFilters {
  stage?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Diagnosis {
  id: string;
  label: string;
  icdCode: string;
}

export interface Treatment {
  id: string;
  label: string;
}

export interface StateDOI {
  name: string;
  phone: string;
  url: string;
  method: string;
  extReview: string;
}

export interface RoundDrugConfig {
  drug: string;
  indication: string;
}

export interface RoundConfig {
  drugs: RoundDrugConfig[];
  strategy: string;
  isAppeal: boolean;
}

export interface LetterParams {
  patient: {
    patientName: string;
    dob?: string;
    memberId?: string;
    carrier?: string;
    planName?: string;
    groupNumber?: string;
    state?: string;
    insuranceType?: string;
  };
  clinical: {
    bmi?: number;
    a1c?: number;
    glucose?: number;
    insulin?: number;
    triglycerides?: number;
    hdl?: number;
  };
  diagnoses: string[];
  treatments: string[];
  drug: string;
  round: number;
  indication: string;
  allDenials: DenialInfo[];
  notes?: string;
  extReviewOutcome?: string;
}

export interface DenialInfo {
  drug: string;
  denied: boolean;
  reason: string;
  date: string;
  text: string;
  ref: string;
}

export interface LaunchRoundResult {
  round: number;
  submissions: PASubmission[];
}

export interface CaseStats {
  byStage: Record<string, number>;
  approvalRates: Record<string, { approved: number; denied: number; total: number; rate: number }>;
  avgProcessingDays: number;
  teamWorkload: { adminId: string; name: string; activeCases: number }[];
  totalCases: number;
}

export interface PublicCaseStatus {
  stage: string;
  stageFriendly: string;
  medications: { drug: string; status: string }[];
  nextStep: string;
}

export interface PAEvent {
  type: string;
  caseId: string;
  patientEmail: string;
  patientName: string;
  data: Record<string, unknown>;
  timestamp: string;
}
