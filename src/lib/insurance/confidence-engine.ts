import probabilityDB from './glp1-probability-database.json';

export interface PatientInput {
  firstName: string;
  lastName: string;
  dob: string;
  state: string;
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  diagnoses: string[];
  employerSize: string;
  planType: string;
}

export interface StediData {
  pharmacyBenefitActive: boolean;
  planName: string | null;
  payerName: string | null;
  payerId: string | null;
  pbm: { name: string; phone: string | null } | null;
  generalPaIndicator: boolean;
  deductible: { amount?: number; remaining?: number } | null;
  specialtyNotes: string | null;
  error?: string;
}

export interface WebSearchData {
  summary: string;
  verdict: 'eligible' | 'pa_required' | 'not_covered' | 'inconclusive';
  confidence: number;
  details: string;
}

export interface SourceVerdict {
  source: 'stedi' | 'historical' | 'pharmaChecker' | 'webSearch' | 'probabilityDB';
  verdict: 'eligible' | 'pa_required' | 'not_covered' | 'inconclusive' | null;
  confidence: number;
  probabilityRange: [number, number] | null;
  notes: string;
}

export interface MedicationResult {
  medication: string;
  displayName: string;
  generic: string;
  manufacturer: string;
  fdaIndication: string;
  status: 'eligible' | 'pa_required' | 'not_covered' | 'inconclusive';
  confidenceScore: number;
  confidenceLevel: 'high' | 'moderate' | 'low' | 'inconclusive';
  probability: number;
  probabilityLow: number;
  probabilityHigh: number;
  probabilityDisplay: string;
  paRequired: boolean;
  recommendedIndication: string;
  diagnosisNote: string | null;
  requiredDocumentation: string[];
  nextStep: { label: string; route: string; price: string };
  sourcesAgreeing: number;
  sourcesTotal: number;
  sources: Record<string, SourceVerdict>;
}

export interface CoverageResult {
  bucket: 'green' | 'yellow' | 'red' | 'processing';
  medications: MedicationResult[];
  insurance: {
    payer: string;
    plan: string | null;
    pbm: string | null;
    pbmPhone: string | null;
    memberId: string;
  };
  sourcesUsed: number;
  checkTimestamp: string;
  carrierKey: string | null;
}

type DB = typeof probabilityDB;
type Carriers = (DB & { carriers: Record<string, CarrierEntry> })['carriers'];
interface CarrierEntry {
  display_name?: string;
  pbm?: string;
  phone?: string;
  payer_ids?: string[];
  states: Record<string, Record<string, { prob: [number, number]; rating: string; pa: boolean; notes: string }>>;
}

const MEDICATIONS = ['wegovy', 'zepbound', 'mounjaro', 'ozempic'] as const;
type MedKey = (typeof MEDICATIONS)[number];

export class ConfidenceEngine {
  private db: DB;

  constructor() {
    this.db = probabilityDB;
  }

  async calculateCoverage(
    patient: PatientInput,
    stediData: StediData | null,
    webSearchData: WebSearchData | null
  ): Promise<CoverageResult> {
    const carrierKey = this.resolveCarrierKey(stediData, patient);
    const results: MedicationResult[] = [];

    for (const med of MEDICATIONS) {
      const result = this.scoreMedication(med, patient, stediData, webSearchData, carrierKey);
      results.push(result);
    }

    const bucket = this.determineBucket(results);
    const carrierEntry = carrierKey ? (this.db as unknown as { carriers: Record<string, CarrierEntry> }).carriers[carrierKey] : null;

    return {
      bucket,
      medications: results,
      insurance: {
        payer: stediData?.payerName || patient.insurerName || 'Unknown',
        plan: stediData?.planName || null,
        pbm: carrierEntry?.pbm || stediData?.pbm?.name || null,
        pbmPhone: carrierEntry?.phone || stediData?.pbm?.phone || null,
        memberId: patient.memberId,
      },
      sourcesUsed: this.countSourcesUsed(results),
      checkTimestamp: new Date().toISOString(),
      carrierKey,
    };
  }

  private scoreMedication(
    medication: MedKey,
    patient: PatientInput,
    stediData: StediData | null,
    webSearchData: WebSearchData | null,
    carrierKey: string | null
  ): MedicationResult {
    const verdicts: SourceVerdict[] = [];
    const bestIndication = this.findBestIndication(medication, patient);
    const indicationKey = this.getIndicationKey(medication, bestIndication.indication);

    const stediVerdict = this.evaluateStedi(stediData, medication, patient);
    if (stediVerdict) verdicts.push(stediVerdict);

    const dbVerdict = this.evaluateProbabilityDB(carrierKey, patient.state, indicationKey, patient);
    if (dbVerdict) verdicts.push(dbVerdict);

    const wsVerdict = this.evaluateWebSearch(webSearchData, medication);
    if (wsVerdict) verdicts.push(wsVerdict);

    const historicalVerdict = this.evaluateHistorical(patient, medication, carrierKey);
    if (historicalVerdict) verdicts.push(historicalVerdict);

    const combined = this.calculateCombinedScore(verdicts, patient, carrierKey, bestIndication);
    const status = this.determineStatus(combined, verdicts, medication, patient);
    const confidenceLevel = this.getConfidenceLevel(combined.confidence);

    const agreeing = verdicts.filter(v => v.verdict === status).length;

    return {
      medication,
      displayName: this.getMedDisplayName(medication),
      generic: this.getMedGeneric(medication),
      manufacturer: this.getMedManufacturer(medication),
      fdaIndication: this.getMedFdaIndication(medication),
      status,
      confidenceScore: combined.confidence,
      confidenceLevel,
      probability: combined.probability,
      probabilityLow: combined.probabilityLow,
      probabilityHigh: combined.probabilityHigh,
      probabilityDisplay:
        combined.probability === 0
          ? 'Unlikely'
          : `${combined.probabilityLow}–${combined.probabilityHigh}%`,
      paRequired: verdicts.some(v => v.notes?.toLowerCase().includes('pa')) || status === 'pa_required',
      recommendedIndication: bestIndication.label,
      diagnosisNote: this.getDiagnosisNote(medication, patient, bestIndication),
      requiredDocumentation: this.getRequiredDocumentation(medication, bestIndication, carrierKey, patient),
      nextStep: this.getNextStep(status, medication, combined),
      sourcesAgreeing: agreeing,
      sourcesTotal: verdicts.length,
      sources: Object.fromEntries(verdicts.map(v => [v.source, v])),
    };
  }

  private evaluateStedi(
    stedi: StediData | null,
    medication: MedKey,
    patient: PatientInput
  ): SourceVerdict | null {
    if (!stedi || stedi.error) return null;

    if (!stedi.pharmacyBenefitActive) {
      return {
        source: 'stedi',
        verdict: 'not_covered',
        confidence: 90,
        probabilityRange: [0, 0],
        notes: 'No active pharmacy benefit found via real-time eligibility check.',
      };
    }

    const isDiabetesMed = medication === 'mounjaro' || medication === 'ozempic';
    const hasT2D = patient.diagnoses.includes('t2d');

    if (isDiabetesMed && hasT2D) {
      return {
        source: 'stedi',
        verdict: 'pa_required',
        confidence: 70,
        probabilityRange: [75, 90],
        notes: `Active pharmacy benefit confirmed. T2D diagnosis aligns with formulary indication. PA likely required.`,
      };
    }

    return {
      source: 'stedi',
      verdict: 'pa_required',
      confidence: 55,
      probabilityRange: [40, 65],
      notes: `Active pharmacy benefit confirmed. Coverage determination requires formulary review.`,
    };
  }

  private evaluateProbabilityDB(
    carrierKey: string | null,
    state: string,
    indicationKey: string,
    patient: PatientInput
  ): SourceVerdict | null {
    const carriers = (this.db as unknown as { carriers: Record<string, CarrierEntry> }).carriers;

    if (!carrierKey || !carriers[carrierKey]) {
      return {
        source: 'probabilityDB',
        verdict: 'inconclusive',
        confidence: 20,
        probabilityRange: [25, 45],
        notes: 'Carrier not in database. Using national average estimates.',
      };
    }

    const carrier = carriers[carrierKey];
    const stateData = carrier.states[state] || carrier.states['_default'];
    if (!stateData) {
      return {
        source: 'probabilityDB',
        verdict: 'inconclusive',
        confidence: 25,
        probabilityRange: [30, 45],
        notes: 'No state-specific data available. Check carrier formulary directly.',
      };
    }

    const entry = stateData[indicationKey];
    if (!entry) {
      return {
        source: 'probabilityDB',
        verdict: 'inconclusive',
        confidence: 20,
        probabilityRange: [20, 40],
        notes: `No data for this specific indication (${indicationKey}) at this carrier.`,
      };
    }

    const [lo, hi] = entry.prob;
    let verdict: SourceVerdict['verdict'] = 'pa_required';
    if (lo === 0 && hi === 0) verdict = 'not_covered';
    else if (lo >= 65 && !entry.pa) verdict = 'eligible';
    else if (lo >= 50) verdict = 'pa_required';
    else verdict = 'pa_required';

    const confidence = lo === 0 ? 85 : lo >= 70 ? 80 : 65;

    const sizeModifiers = (this.db as unknown as { employer_size_modifiers: Record<string, { modifier: number }> }).employer_size_modifiers;
    const sizeMod = sizeModifiers[patient.employerSize]?.modifier || 1.0;
    const adjustedLo = Math.min(99, Math.round(lo * sizeMod));
    const adjustedHi = Math.min(99, Math.round(hi * sizeMod));

    return {
      source: 'probabilityDB',
      verdict,
      confidence,
      probabilityRange: [adjustedLo, adjustedHi],
      notes: entry.notes,
    };
  }

  private evaluateWebSearch(
    wsData: WebSearchData | null,
    medication: MedKey
  ): SourceVerdict | null {
    if (!wsData) return null;

    return {
      source: 'webSearch',
      verdict: wsData.verdict,
      confidence: wsData.confidence,
      probabilityRange: null,
      notes: wsData.details,
    };
  }

  private evaluateHistorical(
    patient: PatientInput,
    medication: MedKey,
    carrierKey: string | null
  ): SourceVerdict | null {
    if (!carrierKey) return null;

    const knownCarriers = ['cigna', 'bcbs_fl', 'aetna', 'uhc', 'humana', 'bcbs_fep', 'medicare', 'medicaid_fl', 'medicaid_ny'];
    if (!knownCarriers.includes(carrierKey)) return null;

    const isDiabetesMed = medication === 'mounjaro' || medication === 'ozempic';
    const hasT2D = patient.diagnoses.includes('t2d');

    if (isDiabetesMed && hasT2D) {
      return {
        source: 'historical',
        verdict: 'pa_required',
        confidence: 72,
        probabilityRange: [75, 88],
        notes: 'Historical: T2D-indication cases at this carrier show strong approval rates.',
      };
    }

    const isWeightLossMed = medication === 'wegovy' || medication === 'zepbound';
    if (isWeightLossMed) {
      const hasBoostDx = patient.diagnoses.some(d => ['cvd', 'osa', 'mash'].includes(d));
      if (hasBoostDx) {
        return {
          source: 'historical',
          verdict: 'pa_required',
          confidence: 65,
          probabilityRange: [55, 72],
          notes: 'Historical: Specialty indication (CV/OSA/MASH) cases show improved PA approval.',
        };
      }

      return {
        source: 'historical',
        verdict: 'pa_required',
        confidence: 50,
        probabilityRange: [35, 55],
        notes: 'Historical: Weight-loss indication cases have variable outcomes at this carrier.',
      };
    }

    return null;
  }

  private calculateCombinedScore(
    verdicts: SourceVerdict[],
    patient: PatientInput,
    carrierKey: string | null,
    bestIndication: { indication: string }
  ) {
    if (verdicts.length === 0) {
      return { confidence: 10, probability: 0, probabilityLow: 0, probabilityHigh: 0 };
    }

    const weights: Record<string, number> = {
      stedi: 20,
      probabilityDB: 35,
      historical: 25,
      webSearch: 20,
    };

    let totalWeight = 0;
    let weightedConfidence = 0;
    const probLows: number[] = [];
    const probHighs: number[] = [];

    verdicts.forEach(v => {
      const w = weights[v.source] || 10;
      totalWeight += w;
      weightedConfidence += v.confidence * w;
      if (v.probabilityRange) {
        probLows.push(v.probabilityRange[0]);
        probHighs.push(v.probabilityRange[1]);
      }
    });

    const confidence = Math.round(weightedConfidence / totalWeight);

    const probSource = verdicts.find(v => v.source === 'probabilityDB');
    const probabilityLow =
      probSource?.probabilityRange?.[0] ??
      (probLows.length > 0 ? Math.round(probLows.reduce((a, b) => a + b, 0) / probLows.length) : 0);
    const probabilityHigh =
      probSource?.probabilityRange?.[1] ??
      (probHighs.length > 0 ? Math.round(probHighs.reduce((a, b) => a + b, 0) / probHighs.length) : 0);
    const probability = Math.round((probabilityLow + probabilityHigh) / 2);

    const uniqueVerdicts = [...new Set(verdicts.map(v => v.verdict).filter(Boolean))];
    const agreementBonus = uniqueVerdicts.length === 1 ? 15 : uniqueVerdicts.length === 2 ? 5 : 0;

    return {
      confidence: Math.min(95, confidence + agreementBonus),
      probability,
      probabilityLow,
      probabilityHigh,
    };
  }

  private determineStatus(
    combinedScore: ReturnType<typeof this.calculateCombinedScore>,
    verdicts: SourceVerdict[],
    medication: MedKey,
    patient: PatientInput
  ): MedicationResult['status'] {
    const highConfDenials = verdicts.filter(v => v.verdict === 'not_covered' && v.confidence >= 80);
    if (highConfDenials.length > 0) return 'not_covered';

    if (combinedScore.probability === 0) return 'not_covered';

    const counts: Record<string, number> = {};
    verdicts.forEach(v => {
      if (v.verdict) counts[v.verdict] = (counts[v.verdict] || 0) + 1;
    });

    if ((counts['eligible'] || 0) > (counts['pa_required'] || 0) && (counts['eligible'] || 0) > (counts['not_covered'] || 0)) {
      return 'eligible';
    }
    if ((counts['pa_required'] || 0) >= 1) return 'pa_required';
    if ((counts['not_covered'] || 0) >= 1) return 'not_covered';

    return 'inconclusive';
  }

  private getConfidenceLevel(score: number): MedicationResult['confidenceLevel'] {
    if (score >= 75) return 'high';
    if (score >= 55) return 'moderate';
    if (score >= 35) return 'low';
    return 'inconclusive';
  }

  private findBestIndication(
    medication: MedKey,
    patient: PatientInput
  ): { indication: string; label: string; note: string } {
    const hasDx = (dx: string) => patient.diagnoses.includes(dx);

    switch (medication) {
      case 'wegovy':
        if (hasDx('cvd')) return { indication: 'cv', label: 'CV Risk Reduction', note: 'Your cardiovascular history creates the strongest coverage pathway.' };
        if (hasDx('mash')) return { indication: 'mash', label: 'MASH Treatment', note: 'FDA-approved for MASH (Aug 2025).' };
        return { indication: 'weight_loss', label: 'Weight Management', note: 'Standard weight management indication.' };
      case 'zepbound':
        if (hasDx('osa')) return { indication: 'osa', label: 'Obstructive Sleep Apnea', note: 'Your OSA diagnosis creates an FDA-approved coverage pathway.' };
        return { indication: 'weight_loss', label: 'Weight Management', note: 'Standard weight management indication.' };
      case 'mounjaro':
        if (hasDx('t2d')) return { indication: 't2d', label: 'Type 2 Diabetes', note: 'FDA-approved indication. Highest approval probability.' };
        if (hasDx('prediabetes') || hasDx('metabolic')) return { indication: 'prediabetes', label: 'Metabolic/Prediabetes', note: 'Dr. Linda can advocate with medical documentation. PA required.' };
        return { indication: 'weight_loss', label: 'Weight Management', note: 'Not FDA-approved for weight management. Coverage unlikely without T2D/metabolic diagnosis.' };
      case 'ozempic':
        if (hasDx('t2d')) return { indication: 't2d', label: 'Type 2 Diabetes', note: 'FDA-approved. Near-universal coverage with T2D diagnosis.' };
        return { indication: 'weight_loss', label: 'Off-label Weight Loss', note: 'Only FDA-approved for T2D. Insurance will not cover for weight loss.' };
    }
  }

  private getIndicationKey(medication: MedKey, indication: string): string {
    const map: Record<string, string> = {
      'wegovy|weight_loss': 'wegovy_weight_loss',
      'wegovy|cv': 'wegovy_cv',
      'wegovy|mash': 'wegovy_weight_loss',
      'zepbound|weight_loss': 'zepbound_weight_loss',
      'zepbound|osa': 'zepbound_osa',
      'mounjaro|t2d': 'mounjaro_t2d',
      'mounjaro|prediabetes': 'mounjaro_t2d',
      'mounjaro|weight_loss': 'mounjaro_t2d',
      'ozempic|t2d': 'ozempic_t2d',
      'ozempic|weight_loss': 'ozempic_t2d',
    };
    return map[`${medication}|${indication}`] || `${medication}_weight_loss`;
  }

  private getRequiredDocumentation(
    medication: MedKey,
    bestIndication: { indication: string },
    carrierKey: string | null,
    patient: PatientInput
  ): string[] {
    const docs: string[] = [];
    docs.push('Current BMI documentation');
    docs.push('Patient demographics and insurance verification');

    switch (bestIndication.indication) {
      case 't2d':
        docs.push('A1C lab result (must be 6.5+)');
        docs.push('Current diabetes treatment history');
        break;
      case 'prediabetes':
        docs.push('A1C lab result (5.7–6.4) or fasting glucose (100–125)');
        docs.push('Documentation of metformin trial and failure/intolerance');
        docs.push('Letter of medical necessity from Dr. Linda');
        break;
      case 'cv':
        docs.push('Documentation of prior MI, stroke, PAD, or CAD');
        docs.push('Cardiologist records or hospital discharge summary');
        docs.push('BMI 27+ documented');
        break;
      case 'osa':
        docs.push('Sleep study results showing AHI 15+ (moderate-severe OSA)');
        docs.push('BMI 30+ documented');
        docs.push('PAP therapy documentation (if applicable)');
        break;
      case 'weight_loss':
      default:
        docs.push('3+ months documented lifestyle modification (diet and exercise)');
        docs.push('Documented prior weight loss attempts');
        if (patient.diagnoses.some(d => ['obesity', 'overweight'].includes(d))) {
          docs.push('Comorbidity documentation (hypertension, dyslipidemia, etc.)');
        }
        docs.push('Letter of medical necessity');
        break;
    }

    return docs;
  }

  private getNextStep(
    status: MedicationResult['status'],
    medication: MedKey,
    combinedScore: { probability: number; probabilityLow: number; probabilityHigh: number }
  ): { label: string; route: string; price: string } {
    switch (status) {
      case 'eligible':
        return { label: 'Start your medical review', route: 'branded-rx', price: '$45/mo program fee' };
      case 'pa_required':
        if (combinedScore.probability >= 60) {
          return {
            label: `We handle your PA — high approval likelihood (${combinedScore.probabilityLow}–${combinedScore.probabilityHigh}%)`,
            route: 'insurance-tier-2',
            price: '$50 one-time',
          };
        }
        return {
          label: `PA submission with physician advocacy (${combinedScore.probabilityLow}–${combinedScore.probabilityHigh}% est.)`,
          route: 'insurance-tier-2',
          price: '$50 one-time',
        };
      case 'not_covered':
        if (medication === 'mounjaro' || medication === 'zepbound') {
          return { label: 'Self-pay: $299/mo', route: 'self-pay-tirzepatide', price: '$299/mo' };
        }
        return { label: 'Self-pay: $169/mo', route: 'self-pay-semaglutide', price: '$169/mo' };
      default:
        return { label: 'Needs manual verification', route: 'contact', price: 'Included in $25 check' };
    }
  }

  private getDiagnosisNote(
    medication: MedKey,
    patient: PatientInput,
    bestIndication: { indication: string }
  ): string | null {
    const hasDx = (dx: string) => patient.diagnoses.includes(dx);
    if (medication === 'zepbound' && hasDx('osa')) {
      return 'Your OSA diagnosis creates an FDA-approved coverage pathway for Zepbound. Sleep study documentation will significantly strengthen your PA.';
    }
    if (medication === 'wegovy' && hasDx('cvd')) {
      return 'Your cardiovascular history qualifies you for the CV risk reduction indication — this works even on plans that exclude weight-loss-only coverage.';
    }
    if (medication === 'mounjaro' && hasDx('prediabetes') && !hasDx('t2d')) {
      return 'Your prediabetes/metabolic diagnosis opens a possible PA pathway. Dr. Linda can advocate with A1C and fasting glucose documentation. Not guaranteed but worth pursuing.';
    }
    if (medication === 'mounjaro' && hasDx('t2d')) {
      return 'Your T2D diagnosis qualifies you for the FDA-approved indication. This is the highest-probability coverage path.';
    }
    if (medication === 'ozempic' && !hasDx('t2d')) {
      return 'Ozempic is only FDA-approved for Type 2 Diabetes. Without a T2D diagnosis, consider Wegovy (same active ingredient, approved for weight management).';
    }
    if (medication === 'ozempic' && hasDx('t2d')) {
      return 'Your T2D diagnosis qualifies you for formulary coverage. Ozempic is widely covered with minimal barriers.';
    }
    return null;
  }

  private determineBucket(results: MedicationResult[]): CoverageResult['bucket'] {
    const highConfCount = results.filter(r => r.confidenceLevel === 'high' || r.confidenceLevel === 'moderate').length;
    const inconclusiveCount = results.filter(r => r.confidenceLevel === 'inconclusive' || r.confidenceLevel === 'low').length;
    if (highConfCount >= 3 && inconclusiveCount <= 1) return 'green';
    if (inconclusiveCount >= 2) return 'yellow';
    const allDenied = results.every(r => r.status === 'not_covered');
    if (allDenied) return 'red';
    return 'yellow';
  }

  private resolveCarrierKey(stedi: StediData | null, patient: PatientInput): string | null {
    const payerIdMap: Record<string, string> = {
      '62308': 'cigna',
      '00590': 'bcbs_fl',
      '60054': 'aetna',
      '87726': 'uhc',
      '61101': 'humana',
      '99726': 'tricare',
      'CMS': 'medicare',
      'ANTHEM1': 'anthem',
      'ANTM1': 'anthem',
      '00620': 'anthem',
      'OSCAR1': 'oscar',
      'MOLINA1': 'molina',
    };
    if (stedi?.payerId && payerIdMap[stedi.payerId]) return payerIdMap[stedi.payerId];

    const name = (stedi?.payerName || patient.insurerName || '').toLowerCase();
    const st = patient.state;

    // ── Medicare / Medicaid — check early, before BCBS catches them ─────────
    if (name.includes('medicare advantage') || name.includes('mapd')) {
      if (name.includes('united') || name.includes('uhc') || name.includes('aarp')) return 'uhc_medicare';
      if (name.includes('humana')) return 'humana_medicare';
      if (name.includes('aetna')) return 'aetna_medicare';
      if (name.includes('devoted')) return 'devoted_health';
      return 'medicare';
    }
    if (name.includes('medicare part d') || name.includes('medicare prescription')) return 'medicare';
    if (name.includes('medicare')) {
      if (name.includes('united') || name.includes('uhc') || name.includes('aarp')) return 'uhc_medicare';
      if (name.includes('humana')) return 'humana_medicare';
      if (name.includes('aetna')) return 'aetna_medicare';
      if (name.includes('devoted')) return 'devoted_health';
      return 'medicare';
    }
    if (name.includes('medi-cal')) return 'medi_cal';
    if (name.includes('apple health') || (name.includes('medicaid') && st === 'WA')) return 'medicaid_wa';
    if (name.includes('tenncare') || (name.includes('medicaid') && st === 'TN')) return 'medicaid_tn';
    if (name.includes('colorado medicaid') || name.includes('health first colorado') || (name.includes('medicaid') && st === 'CO')) return 'medicaid_co';
    if (name.includes('medicaid') && st === 'FL') return 'medicaid_fl';
    if (name.includes('medicaid') && st === 'NY') return 'medicaid_ny';
    if (name.includes('medicaid') && st === 'IL') return 'medicaid_il';
    if (name.includes('medicaid') && st === 'CA') return 'medi_cal';
    if (name.includes('medicaid') && st === 'TX') return 'medicaid_tx';
    if (name.includes('medicaid') && st === 'OH') return 'medicaid_oh';
    if (name.includes('medicaid') && st === 'GA') return 'medicaid_ga';
    if (name.includes('medicaid') && st === 'PA') return 'medicaid_pa';
    if (name.includes('medicaid') && st === 'NC') return 'medicaid_nc';

    // ── Cigna / Evernorth ────────────────────────────────────────────────────
    if (name.includes('cigna') || name.includes('evernorth')) return 'cigna';

    // ── Aetna / CVS ──────────────────────────────────────────────────────────
    if (name.includes('aetna') || name.includes('cvs health plan')) return 'aetna';

    // ── UnitedHealthcare ──────────────────────────────────────────────────────
    if (name.includes('unitedhealthcare') || name.includes('united health') || name.includes('uhc') || name.includes('optumhealth')) return 'uhc';

    // ── Humana ────────────────────────────────────────────────────────────────
    if (name.includes('humana') || name.includes('centerwell')) return 'humana';

    // ── TRICARE ───────────────────────────────────────────────────────────────
    if (name.includes('tricare')) return 'tricare';

    // ── VA ────────────────────────────────────────────────────────────────────
    if (name.includes('veterans affairs') || name.includes('va health') || name.includes(' va ') || name === 'va') return 'va';

    // ── Kaiser Permanente ─────────────────────────────────────────────────────
    if (name.includes('kaiser')) return 'kaiser';

    // ── Oscar ─────────────────────────────────────────────────────────────────
    if (name.includes('oscar health') || name.includes('oscar insurance')) return 'oscar';

    // ── Molina ────────────────────────────────────────────────────────────────
    if (name.includes('molina')) return 'molina';

    // ── WellCare / Centene ────────────────────────────────────────────────────
    if (name.includes('wellcare')) return 'wellcare';
    if (name.includes('ambetter')) return 'ambetter';
    if (name.includes('health net') || name.includes('healthnet')) return 'health_net';

    // ── CareSource ────────────────────────────────────────────────────────────
    if (name.includes('caresource')) return 'caresource';

    // ── Devoted Health ────────────────────────────────────────────────────────
    if (name.includes('devoted')) return 'devoted_health';

    // ── BCBS — FEP first (before generic BCBS match) ─────────────────────────
    if (name.includes('fep') || name.includes('federal employee') || name.includes('fehb')) return 'bcbs_fep';

    // ── Anthem / Elevance ─────────────────────────────────────────────────────
    if (name.includes('anthem') || name.includes('elevance')) return 'anthem';

    // ── Highmark ──────────────────────────────────────────────────────────────
    if (name.includes('highmark')) return 'highmark';

    // ── CareFirst ─────────────────────────────────────────────────────────────
    if (name.includes('carefirst')) return 'carefirst';

    // ── Horizon BCBS NJ ───────────────────────────────────────────────────────
    if (name.includes('horizon') && (name.includes('bcbs') || name.includes('blue cross') || st === 'NJ')) return 'horizon_bcbs_nj';

    // ── Independence Blue Cross (PA) ──────────────────────────────────────────
    if (name.includes('independence blue') || (name.includes('ibx') && st === 'PA')) return 'independence_bcbs';

    // ── Premera ───────────────────────────────────────────────────────────────
    if (name.includes('premera')) return 'premera';

    // ── Regence ───────────────────────────────────────────────────────────────
    if (name.includes('regence')) return 'regence';

    // ── Harvard Pilgrim ───────────────────────────────────────────────────────
    if (name.includes('harvard pilgrim')) return 'harvard_pilgrim';

    // ── Tufts / Point32Health ─────────────────────────────────────────────────
    if (name.includes('tufts health') || name.includes('point32')) return 'tufts_health';

    // ── AllWays Health Partners ───────────────────────────────────────────────
    if (name.includes('allways') || name.includes('all ways health')) return 'allways_health';

    // ── Excellus BCBS (NY Rochester area) ────────────────────────────────────
    if (name.includes('excellus')) return 'excellus_bcbs';

    // ── EmblemHealth / GHI / HIP (NY NYC area) ───────────────────────────────
    if (name.includes('emblemhealth') || name.includes('emblem health') || (name.includes('ghi') && st === 'NY') || (name.includes('hip') && st === 'NY')) return 'emblemhealth';

    // ── Medica ────────────────────────────────────────────────────────────────
    if (name.includes('medica health') || (name.includes('medica') && !name.includes('medicaid') && !name.includes('medi-cal'))) return 'medica';

    // ── HealthPartners ────────────────────────────────────────────────────────
    if (name.includes('healthpartners') || name.includes('health partners')) return 'healthpartners';

    // ── UCare ─────────────────────────────────────────────────────────────────
    if (name.includes('ucare')) return 'ucare';

    // ── Sanford Health Plan ────────────────────────────────────────────────────
    if (name.includes('sanford health plan')) return 'sanford_health';

    // ── SelectHealth ──────────────────────────────────────────────────────────
    if (name.includes('selecthealth') || name.includes('select health') || name.includes('intermountain')) return 'select_health';

    // ── Geisinger ─────────────────────────────────────────────────────────────
    if (name.includes('geisinger')) return 'geisinger';

    // ── UPMC ──────────────────────────────────────────────────────────────────
    if (name.includes('upmc')) return 'upmc_health';

    // ── Medical Mutual of Ohio ────────────────────────────────────────────────
    if (name.includes('medical mutual')) return 'medical_mutual_oh';

    // ── Community Health Plan of Washington ───────────────────────────────────
    if (name.includes('community health plan') && st === 'WA') return 'community_health_wa';

    // ── Providence Health Plan ────────────────────────────────────────────────
    if (name.includes('providence health plan')) return 'providence_health';

    // ── Moda Health ───────────────────────────────────────────────────────────
    if (name.includes('moda health') || name.includes('moda ')) return 'moda_health';

    // ── PacificSource ─────────────────────────────────────────────────────────
    if (name.includes('pacificsource') || name.includes('pacific source')) return 'pacific_source';

    // ── Quartz ────────────────────────────────────────────────────────────────
    if (name.includes('quartz')) return 'quartz_wi';

    // ── Dean Health / SSM ─────────────────────────────────────────────────────
    if (name.includes('dean health') || name.includes('ssm health')) return 'dean_health';

    // ── Wellmark ──────────────────────────────────────────────────────────────
    if (name.includes('wellmark')) return 'wellmark';

    // ── BCBS state plans — resolved by state ──────────────────────────────────
    const isBCBS = name.includes('bcbs') || name.includes('blue cross') || name.includes('bluecross') || name.includes('blue shield') || name.includes('blueshield');
    if (isBCBS) {
      if (st === 'FL' || name.includes('florida blue') || name.includes('florida bcbs')) return 'bcbs_fl';
      if (st === 'MA' || name.includes('massachusetts')) return 'bcbs_ma';
      if (st === 'MI' || name.includes('michigan')) return 'bcbs_mi';
      if (st === 'CA' && name.includes('blue shield')) return 'blue_shield_ca';
      if (st === 'TX' || name.includes('texas')) return 'bcbs_tx';
      if (st === 'NC' || name.includes('north carolina') || name.includes('nc')) return 'bcbs_nc';
      if (st === 'TN' || name.includes('tennessee')) return 'bcbs_tn';
      if (st === 'AL' || name.includes('alabama')) return 'bcbs_al';
      if (st === 'IL' || name.includes('illinois')) return 'bcbs_il';
      if (st === 'SC' || name.includes('south carolina')) return 'bcbs_sc';
      if (st === 'AZ' || name.includes('arizona')) return 'bcbs_az';
      if (st === 'KS' || name.includes('kansas')) return 'bcbs_ks';
      if (st === 'OK' || name.includes('oklahoma')) return 'bcbs_ok';
      if (st === 'MT' || name.includes('montana')) return 'bcbs_mt';
      if (st === 'NM' || name.includes('new mexico')) return 'bcbs_nm';
      if (st === 'PA' && (name.includes('capital') || name.includes('capital blue'))) return 'independence_bcbs';
      if (st === 'NJ' || name.includes('new jersey')) return 'horizon_bcbs_nj';
      if (st === 'DC' || st === 'MD' || name.includes('carefirst')) return 'carefirst';
      if (st === 'WA' && name.includes('premera')) return 'premera';
      if (name.includes('regence')) return 'regence';
      if (st === 'NY' && name.includes('excellus')) return 'excellus_bcbs';
    }

    return null;
  }

  private countSourcesUsed(results: MedicationResult[]): number {
    const sourceSet = new Set<string>();
    results.forEach(r => {
      Object.values(r.sources).forEach(s => { if (s.verdict) sourceSet.add(s.source); });
    });
    return sourceSet.size;
  }

  getMedDisplayName(med: string): string {
    const names: Record<string, string> = { wegovy: 'Wegovy®', zepbound: 'Zepbound®', mounjaro: 'Mounjaro®', ozempic: 'Ozempic®' };
    return names[med] || med;
  }

  getMedGeneric(med: string): string {
    const generics: Record<string, string> = { wegovy: 'semaglutide 2.4mg', zepbound: 'tirzepatide', mounjaro: 'tirzepatide', ozempic: 'semaglutide 0.5/1/2mg' };
    return generics[med] || '';
  }

  getMedManufacturer(med: string): string {
    const mfrs: Record<string, string> = { wegovy: 'Novo Nordisk', zepbound: 'Eli Lilly', mounjaro: 'Eli Lilly', ozempic: 'Novo Nordisk' };
    return mfrs[med] || '';
  }

  getMedFdaIndication(med: string): string {
    const indications: Record<string, string> = {
      wegovy: 'Weight management + CV risk reduction + MASH',
      zepbound: 'Weight management + Obstructive sleep apnea',
      mounjaro: 'Type 2 Diabetes',
      ozempic: 'Type 2 Diabetes + CV/renal protection',
    };
    return indications[med] || '';
  }
}
