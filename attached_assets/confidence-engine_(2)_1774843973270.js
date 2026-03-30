/**
 * Body Good GLP-1 Coverage Confidence Engine v1.0
 * 
 * Combines 5 data sources to produce per-medication probability scores:
 *   Source 1: Stedi 270/271 eligibility response
 *   Source 2: Body Good historical case database
 *   Source 3: Pharma coverage checker results (manual or future DoseSpot)
 *   Source 4: Real-time web search (Claude API with web_search)
 *   Source 5: BG Probability Database (carrier/state/diagnosis matrix)
 * 
 * Output: Per-medication verdict with confidence score, recommended
 *         indication pathway, required documentation, and next steps.
 */

// ============================================================
// IMPORTS - In production, these come from separate files/APIs
// ============================================================

// const probabilityDB = require('./glp1-probability-database.json');
// For now, the database is loaded at runtime from Zoho Creator or a JSON file

// ============================================================
// CORE TYPES
// ============================================================

/**
 * @typedef {Object} PatientInput
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} dob - YYYY-MM-DD
 * @property {string} state - 2-letter state code
 * @property {string} insurerName - Display name of insurance company
 * @property {string} memberId
 * @property {string} groupNumber
 * @property {string[]} diagnoses - Array of diagnosis IDs: t2d, prediabetes, obesity, overweight, osa, cvd, mash, pcos, metabolic
 * @property {string} employerSize - large_5000_plus, medium_500_4999, small_under_500, government_federal, government_state, self_employed, marketplace_aca
 * @property {string} planType - employer, marketplace, medicaid, medicare, tricare, va, bcbs_fep
 */

/**
 * @typedef {Object} StediResponse
 * @property {boolean} pharmacyBenefitActive
 * @property {string} planName - e.g., "Open Access Plus"
 * @property {string} payerName - e.g., "Cigna"
 * @property {string} payerId - e.g., "62308"
 * @property {Object} pbm - { name, phone, rxBin, rxPcn, rxGroup }
 * @property {boolean} generalPaIndicator
 * @property {Object} deductible - { individual, family, remaining }
 * @property {Object} copayStructure - parsed copay/coinsurance data
 * @property {string} specialtyNotes - any specialty drug notes
 */

/**
 * @typedef {Object} MedicationResult
 * @property {string} medication - wegovy, zepbound, mounjaro, ozempic
 * @property {string} status - eligible, pa_required, not_covered, inconclusive
 * @property {number} confidenceScore - 0-100
 * @property {string} confidenceLevel - high (80+), moderate (60-79), low (40-59), inconclusive (<40)
 * @property {string} rating - green, yellow, red
 * @property {number[]} probabilityRange - [low, high] percent
 * @property {string} recommendedIndication - weight_loss, cv, osa, t2d, prediabetes, mash
 * @property {string[]} requiredDocumentation
 * @property {string} nextStep - description of recommended action
 * @property {string} nextStepRoute - Shopify product route
 * @property {Object} sources - individual source verdicts
 * @property {string} diagnosisNote - clinical insight based on patient diagnoses
 */

// ============================================================
// CONFIDENCE ENGINE
// ============================================================

class ConfidenceEngine {
  constructor(probabilityDB) {
    this.db = probabilityDB;
  }

  /**
   * Main entry point: Calculate coverage for all 4 medications
   * @param {PatientInput} patient
   * @param {StediResponse} stediResponse
   * @param {Object} historicalData - Body Good database match (or null)
   * @param {Object} webSearchResults - Parsed web search data (or null)
   * @param {Object} pharmaCheckerResults - Manual pharma tool results (or null)
   * @returns {Object} Full coverage report
   */
  calculateCoverage(patient, stediResponse, historicalData, webSearchResults, pharmaCheckerResults) {
    const carrierKey = this.resolveCarrierKey(stediResponse, patient);
    const medications = ['wegovy', 'zepbound', 'mounjaro', 'ozempic'];
    
    const results = medications.map(med => 
      this.scoreMedication(med, patient, stediResponse, carrierKey, historicalData, webSearchResults, pharmaCheckerResults)
    );

    // Determine overall bucket
    const bucket = this.determineBucket(results);

    return {
      patient: {
        name: `${patient.firstName} ${patient.lastName}`,
        state: patient.state,
        diagnoses: patient.diagnoses,
        employerSize: patient.employerSize,
        planType: patient.planType,
      },
      insurance: {
        payer: stediResponse.payerName,
        payerId: stediResponse.payerId,
        plan: stediResponse.planName,
        pbm: stediResponse.pbm,
        pharmacyActive: stediResponse.pharmacyBenefitActive,
        deductible: stediResponse.deductible,
        pharmacyPhone: stediResponse.pbm?.phone || this.getCarrierPhone(carrierKey),
      },
      medications: results,
      bucket, // green, yellow, red
      timestamp: new Date().toISOString(),
      sourcesUsed: this.countSourcesUsed(results),
    };
  }

  /**
   * Score a single medication across all 5 sources
   */
  scoreMedication(medication, patient, stedi, carrierKey, historical, webSearch, pharmaChecker) {
    const sources = {};
    let verdicts = [];

    // ── Source 1: Stedi 271 ──
    sources.stedi = this.evaluateStedi(stedi);
    if (sources.stedi.verdict) verdicts.push(sources.stedi);

    // ── Source 2: Body Good Historical Database ──
    sources.historical = this.evaluateHistorical(medication, historical);
    if (sources.historical.verdict) verdicts.push(sources.historical);

    // ── Source 3: Pharma Coverage Checker ──
    sources.pharmaChecker = this.evaluatePharmaChecker(medication, pharmaChecker);
    if (sources.pharmaChecker.verdict) verdicts.push(sources.pharmaChecker);

    // ── Source 4: Real-Time Web Search ──
    sources.webSearch = this.evaluateWebSearch(medication, webSearch);
    if (sources.webSearch.verdict) verdicts.push(sources.webSearch);

    // ── Source 5: BG Probability Database ──
    sources.probabilityDB = this.evaluateProbabilityDB(medication, patient, carrierKey);
    if (sources.probabilityDB.verdict) verdicts.push(sources.probabilityDB);

    // ── Calculate Combined Score ──
    const bestIndication = this.findBestIndication(medication, patient);
    const combinedScore = this.calculateCombinedScore(verdicts, patient, carrierKey, bestIndication);
    
    // ── Determine Status ──
    const status = this.determineStatus(combinedScore, verdicts, medication, patient);
    const rating = combinedScore.probability >= 60 ? 'green' : combinedScore.probability >= 30 ? 'yellow' : 'red';

    // ── Build Required Documentation ──
    const docs = this.getRequiredDocumentation(medication, bestIndication, carrierKey, patient);

    // ── Build Next Step ──
    const nextStep = this.getNextStep(status, medication, combinedScore);

    // ── Build Diagnosis Note ──
    const diagnosisNote = this.getDiagnosisNote(medication, patient, bestIndication);

    return {
      medication,
      displayName: this.getMedDisplayName(medication),
      generic: this.getMedGeneric(medication),
      manufacturer: this.getMedManufacturer(medication),
      fdaIndication: this.getMedFdaIndication(medication),
      status,
      confidenceScore: combinedScore.confidence,
      confidenceLevel: combinedScore.confidence >= 80 ? 'high' : combinedScore.confidence >= 60 ? 'moderate' : combinedScore.confidence >= 40 ? 'low' : 'inconclusive',
      rating,
      probabilityRange: [combinedScore.probabilityLow, combinedScore.probabilityHigh],
      probabilityDisplay: `${combinedScore.probabilityLow}-${combinedScore.probabilityHigh}%`,
      recommendedIndication: bestIndication.indication,
      requiredDocumentation: docs,
      paRequired: status === 'pa_required',
      nextStep: nextStep.label,
      nextStepRoute: nextStep.route,
      nextStepPrice: nextStep.price,
      sources,
      sourcesAgreeing: verdicts.filter(v => v.verdict === status).length,
      sourcesTotal: verdicts.length,
      diagnosisNote,
    };
  }

  // ── Source Evaluators ──

  evaluateStedi(stedi) {
    if (!stedi || !stedi.pharmacyBenefitActive) {
      return { source: 'stedi', verdict: 'not_covered', confidence: 90, note: 'No active pharmacy benefits' };
    }
    return { 
      source: 'stedi', 
      verdict: stedi.generalPaIndicator ? 'pa_required' : 'eligible',
      confidence: 70,
      note: `Active pharmacy benefits. Plan: ${stedi.planName}. PA indicator: ${stedi.generalPaIndicator ? 'Yes' : 'No'}.`
    };
  }

  evaluateHistorical(medication, historical) {
    if (!historical || !historical.medications || !historical.medications[medication]) {
      return { source: 'historical', verdict: null, confidence: 0, note: 'No historical data for this plan.' };
    }
    const h = historical.medications[medication];
    return {
      source: 'historical',
      verdict: h.status,
      confidence: Math.min(95, 50 + (historical.caseCount * 3)), // More cases = higher confidence, capped at 95
      note: `${historical.caseCount} previous cases. Approval rate: ${h.approvalRate}. Last verified: ${historical.lastVerified}.`,
      approvalRate: h.approvalRate,
      caseCount: historical.caseCount,
    };
  }

  evaluatePharmaChecker(medication, pharmaResults) {
    if (!pharmaResults || !pharmaResults[medication]) {
      return { source: 'pharmaChecker', verdict: null, confidence: 0, note: 'Not yet checked.' };
    }
    const p = pharmaResults[medication];
    return {
      source: 'pharmaChecker',
      verdict: p.status, // eligible, pa_required, not_covered
      confidence: 85, // Pharma tools are high accuracy
      note: p.notes || `Result from ${p.tool}: ${p.status}`,
      tier: p.tier,
      estimatedCopay: p.estimatedCopay,
    };
  }

  evaluateWebSearch(medication, webResults) {
    if (!webResults || !webResults[medication]) {
      return { source: 'webSearch', verdict: null, confidence: 0, note: 'Web search not performed or no results.' };
    }
    const w = webResults[medication];
    return {
      source: 'webSearch',
      verdict: w.status,
      confidence: w.confidence || 60,
      note: w.summary || 'Web search data available.',
      policyUrl: w.policyUrl,
    };
  }

  evaluateProbabilityDB(medication, patient, carrierKey) {
    if (!this.db || !this.db.carriers || !this.db.carriers[carrierKey]) {
      return { source: 'probabilityDB', verdict: null, confidence: 0, note: 'Carrier not in probability database.' };
    }

    const carrier = this.db.carriers[carrierKey];
    const stateData = carrier.states[patient.state] || carrier.states['_default'];
    if (!stateData) {
      return { source: 'probabilityDB', verdict: null, confidence: 0, note: 'No state data available.' };
    }

    // Find the best indication key for this medication + patient diagnoses
    const bestIndication = this.findBestIndication(medication, patient);
    const indicationKey = this.getIndicationKey(medication, bestIndication.indication);
    const data = stateData[indicationKey];

    if (!data) {
      return { source: 'probabilityDB', verdict: null, confidence: 0, note: `No data for ${indicationKey} in this state.` };
    }

    // Apply employer size modifier
    const modifier = this.db.employer_size_modifiers?.[patient.employerSize]?.modifier || 1.0;
    const adjustedLow = Math.min(95, Math.round(data.prob[0] * modifier));
    const adjustedHigh = Math.min(95, Math.round(data.prob[1] * modifier));

    // Apply diagnosis boosts
    let boost = 0;
    patient.diagnoses.forEach(dx => {
      if (this.db.diagnosis_boosts?.[dx]) {
        boost += this.db.diagnosis_boosts[dx].boost_percent;
      }
    });
    // Don't double-count the primary indication boost
    const finalLow = Math.min(95, adjustedLow + Math.round(boost * 0.3));
    const finalHigh = Math.min(95, adjustedHigh + Math.round(boost * 0.3));

    const avgProb = (finalLow + finalHigh) / 2;
    let verdict = 'inconclusive';
    if (data.prob[0] === 0 && data.prob[1] === 0) verdict = 'not_covered';
    else if (data.pa) verdict = 'pa_required';
    else if (avgProb >= 70) verdict = 'eligible';
    else verdict = 'pa_required';

    return {
      source: 'probabilityDB',
      verdict,
      confidence: 75,
      note: data.notes,
      probabilityRange: [finalLow, finalHigh],
      rating: data.rating,
      paRequired: data.pa,
      paCriteria: carrier.pa_criteria,
    };
  }

  // ── Combination Logic ──

  calculateCombinedScore(verdicts, patient, carrierKey, bestIndication) {
    if (verdicts.length === 0) {
      return { confidence: 10, probability: 0, probabilityLow: 0, probabilityHigh: 0 };
    }

    // Weight each source
    const weights = {
      stedi: 15,
      historical: 25,
      pharmaChecker: 30,
      webSearch: 15,
      probabilityDB: 15,
    };

    let totalWeight = 0;
    let weightedConfidence = 0;
    let probLows = [];
    let probHighs = [];

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

    // Get probability from the probability DB source if available
    const probSource = verdicts.find(v => v.source === 'probabilityDB');
    const probabilityLow = probSource?.probabilityRange?.[0] || (probLows.length > 0 ? Math.round(probLows.reduce((a,b) => a+b, 0) / probLows.length) : 0);
    const probabilityHigh = probSource?.probabilityRange?.[1] || (probHighs.length > 0 ? Math.round(probHighs.reduce((a,b) => a+b, 0) / probHighs.length) : 0);
    const probability = Math.round((probabilityLow + probabilityHigh) / 2);

    // Agreement bonus: if all sources agree, boost confidence
    const uniqueVerdicts = [...new Set(verdicts.map(v => v.verdict).filter(Boolean))];
    const agreementBonus = uniqueVerdicts.length === 1 ? 15 : uniqueVerdicts.length === 2 ? 5 : 0;

    return {
      confidence: Math.min(95, confidence + agreementBonus),
      probability,
      probabilityLow,
      probabilityHigh,
    };
  }

  determineStatus(combinedScore, verdicts, medication, patient) {
    // If any high-confidence source says not covered, it's likely not covered
    const highConfDenials = verdicts.filter(v => v.verdict === 'not_covered' && v.confidence >= 80);
    if (highConfDenials.length > 0) return 'not_covered';

    // If no active pharmacy benefits, not covered
    const stedi = verdicts.find(v => v.source === 'stedi');
    if (stedi && stedi.verdict === 'not_covered') return 'not_covered';

    // If probability is 0, not covered
    if (combinedScore.probability === 0) return 'not_covered';

    // Count verdicts
    const counts = {};
    verdicts.forEach(v => {
      if (v.verdict) counts[v.verdict] = (counts[v.verdict] || 0) + 1;
    });

    // Majority rules
    if ((counts['eligible'] || 0) > (counts['pa_required'] || 0) && (counts['eligible'] || 0) > (counts['not_covered'] || 0)) {
      return 'eligible';
    }
    if ((counts['pa_required'] || 0) >= 1) return 'pa_required';
    if ((counts['not_covered'] || 0) >= 1) return 'not_covered';

    return 'inconclusive';
  }

  // ── Indication Routing ──

  findBestIndication(medication, patient) {
    const hasDx = (dx) => patient.diagnoses.includes(dx);

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
      
      default:
        return { indication: 'unknown', label: 'Unknown', note: '' };
    }
  }

  getIndicationKey(medication, indication) {
    const map = {
      'wegovy|weight_loss': 'wegovy_weight_loss',
      'wegovy|cv': 'wegovy_cv',
      'wegovy|mash': 'wegovy_weight_loss', // fallback
      'zepbound|weight_loss': 'zepbound_weight_loss',
      'zepbound|osa': 'zepbound_osa',
      'mounjaro|t2d': 'mounjaro_t2d',
      'mounjaro|prediabetes': 'mounjaro_t2d', // closest match
      'mounjaro|weight_loss': 'mounjaro_t2d', // not covered, but use T2D key for lookup
      'ozempic|t2d': 'ozempic_t2d',
      'ozempic|weight_loss': 'ozempic_t2d', // not covered for WL
    };
    return map[`${medication}|${indication}`] || `${medication}_weight_loss`;
  }

  // ── Documentation Requirements ──

  getRequiredDocumentation(medication, bestIndication, carrierKey, patient) {
    const docs = [];
    
    // Base docs always needed
    docs.push('Current BMI documentation');
    docs.push('Patient demographics and insurance verification');

    switch (bestIndication.indication) {
      case 't2d':
        docs.push('A1C lab result (must be 6.5+)');
        docs.push('Current diabetes treatment history');
        break;
      case 'prediabetes':
        docs.push('A1C lab result (5.7-6.4) or fasting glucose (100-125)');
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

  // ── Next Steps ──

  getNextStep(status, medication, combinedScore) {
    switch (status) {
      case 'eligible':
        return { 
          label: 'Start your medical review', 
          route: 'branded-rx', 
          price: '$45/mo program fee' 
        };
      case 'pa_required':
        if (combinedScore.probability >= 60) {
          return { 
            label: `We handle your PA — high approval likelihood (${combinedScore.probabilityLow}-${combinedScore.probabilityHigh}%)`, 
            route: 'insurance-tier-2', 
            price: '$50 one-time' 
          };
        }
        return { 
          label: `PA submission with physician advocacy (${combinedScore.probabilityLow}-${combinedScore.probabilityHigh}% est.)`, 
          route: 'insurance-tier-2', 
          price: '$50 one-time' 
        };
      case 'not_covered':
        if (medication === 'mounjaro' || medication === 'zepbound') {
          return { label: `Self-pay: $299/mo`, route: 'self-pay-tirzepatide', price: '$299/mo' };
        }
        return { label: `Self-pay: $169/mo`, route: 'self-pay-semaglutide', price: '$169/mo' };
      default:
        return { label: 'Needs manual verification', route: 'contact', price: 'Included in $25 check' };
    }
  }

  // ── Diagnosis Notes ──

  getDiagnosisNote(medication, patient, bestIndication) {
    const hasDx = (dx) => patient.diagnoses.includes(dx);
    
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

  // ── Bucket Determination ──

  determineBucket(results) {
    const highConfidenceCount = results.filter(r => r.confidenceLevel === 'high' || r.confidenceLevel === 'moderate').length;
    const inconclusiveCount = results.filter(r => r.confidenceLevel === 'inconclusive' || r.confidenceLevel === 'low').length;
    
    // If most results are high/moderate confidence, it's Green
    if (highConfidenceCount >= 3 && inconclusiveCount <= 1) return 'green';
    
    // If there are inconclusive results or disagreements, it's Yellow
    if (inconclusiveCount >= 2) return 'yellow';
    
    // If all denied with high confidence, it's Red
    const allDenied = results.every(r => r.status === 'not_covered');
    if (allDenied) return 'red';

    return 'yellow'; // Default to yellow (needs review)
  }

  // ── Helpers ──

  resolveCarrierKey(stedi, patient) {
    // Map payer ID or name to our database key
    const payerIdMap = {
      '62308': 'cigna',
      '00590': 'bcbs_fl',
      '60054': 'aetna',
      '87726': 'uhc',
      '61101': 'humana',
      '99726': 'tricare',
      'CMS': 'medicare',
    };

    if (stedi?.payerId && payerIdMap[stedi.payerId]) {
      return payerIdMap[stedi.payerId];
    }

    // Fuzzy match on name
    const name = (stedi?.payerName || patient.insurerName || '').toLowerCase();
    if (name.includes('cigna')) return 'cigna';
    if (name.includes('florida blue') || (name.includes('bcbs') && patient.state === 'FL')) return 'bcbs_fl';
    if (name.includes('aetna')) return 'aetna';
    if (name.includes('united') || name.includes('uhc')) return 'uhc';
    if (name.includes('humana')) return 'humana';
    if (name.includes('tricare')) return 'tricare';
    if (name.includes('kaiser')) return 'kaiser';
    if (name.includes('bcbs') && name.includes('fep')) return 'bcbs_fep';
    if (name.includes('medicare')) return 'medicare';
    if (name.includes('medicaid') && patient.state === 'FL') return 'medicaid_fl';
    if (name.includes('medicaid') && patient.state === 'NY') return 'medicaid_ny';
    if (name.includes('medicaid') && patient.state === 'IL') return 'medicaid_il';
    if (name.includes('medi-cal') || (name.includes('medicaid') && patient.state === 'CA')) return 'medi_cal';
    if (name.includes('bcbs') && name.includes('mass')) return 'bcbs_ma';
    if (name.includes('bcbs') && name.includes('mich')) return 'bcbs_mi';

    return null; // Unknown carrier
  }

  getCarrierPhone(carrierKey) {
    return this.db?.carriers?.[carrierKey]?.phone || null;
  }

  countSourcesUsed(results) {
    const sourceSet = new Set();
    results.forEach(r => {
      Object.values(r.sources).forEach(s => {
        if (s.verdict) sourceSet.add(s.source);
      });
    });
    return sourceSet.size;
  }

  getMedDisplayName(med) {
    const names = { wegovy: 'Wegovy®', zepbound: 'Zepbound®', mounjaro: 'Mounjaro®', ozempic: 'Ozempic®' };
    return names[med] || med;
  }

  getMedGeneric(med) {
    const generics = { wegovy: 'semaglutide 2.4mg', zepbound: 'tirzepatide', mounjaro: 'tirzepatide', ozempic: 'semaglutide 0.5/1/2mg' };
    return generics[med] || '';
  }

  getMedManufacturer(med) {
    const mfrs = { wegovy: 'Novo Nordisk', zepbound: 'Eli Lilly', mounjaro: 'Eli Lilly', ozempic: 'Novo Nordisk' };
    return mfrs[med] || '';
  }

  getMedFdaIndication(med) {
    const indications = {
      wegovy: 'Weight management + CV risk reduction + MASH',
      zepbound: 'Weight management + Obstructive sleep apnea',
      mounjaro: 'Type 2 Diabetes',
      ozempic: 'Type 2 Diabetes + CV/renal protection',
    };
    return indications[med] || '';
  }
}

// ============================================================
// EXPORT
// ============================================================

// For Node.js / Cloudflare Worker
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfidenceEngine };
}

// For browser / React
if (typeof window !== 'undefined') {
  window.ConfidenceEngine = ConfidenceEngine;
}
