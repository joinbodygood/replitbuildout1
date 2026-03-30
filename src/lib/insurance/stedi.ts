/**
 * Real-time insurance eligibility via Stedi Healthcare Eligibility v3 API
 *
 * ─── HOW TO ACTIVATE ─────────────────────────────────────────────────────────
 * You already have an account at portal.stedi.com!
 *
 * 1. Go to:  https://www.stedi.com/app/settings/api-keys
 * 2. Click "Create API Key" → Production → name it "body-good-eligibility"
 * 3. Copy the key (you only see it once)
 * 4. Add to Replit Secrets:  STEDI_API_KEY = <your key>
 * 5. The integration activates automatically — no code changes needed.
 *
 * ─── PRICING ─────────────────────────────────────────────────────────────────
 * FREE Basic plan: 100 eligibility checks/month (you're already on it)
 * Paid Developer plan: pay-as-you-go per check (no $500 commitment)
 * Contact: portal.stedi.com → Settings → Billing to upgrade when ready
 *
 * ─── API REFERENCE ───────────────────────────────────────────────────────────
 * POST https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3
 * Auth: Authorization: Key <API_KEY>
 * Docs: https://www.stedi.com/docs/healthcare/send-eligibility-checks
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── FUTURE ALTERNATIVE ──────────────────────────────────────────────────────
 * Eligible.com: ~$0.05/check, requires BAA (HIPAA). Code in eligible.ts.
 * Endpoint: GET https://gds.eligibleapi.com/v1.5/coverage/all?api_key=…
 * Contact sales at eligible.com → sign BAA → add ELIGIBLE_API_KEY secret.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { StediData } from './confidence-engine';

const STEDI_API_KEY = process.env.STEDI_API_KEY;
const STEDI_ENDPOINT = 'https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3';
const PROVIDER_NPI = process.env.PROVIDER_NPI || '1558788851';
const PROVIDER_NAME = process.env.PROVIDER_NAME || 'Body Good Studio';

const PAYER_ID_MAP: Record<string, string> = {
  'cigna': 'CIGNA', 'evernorth': 'CIGNA',
  'aetna': '60054', 'cvs health': '60054',
  'unitedhealthcare': '87726', 'united health': '87726', 'uhc': '87726', 'optum': '87726',
  'humana': '61101', 'centerwell': '61101',
  'florida blue': '00590', 'bcbs of florida': '00590', 'bcbs fl': '00590', 'blue cross florida': '00590',
  'anthem': 'ANTHEM1', 'elevance': 'ANTHEM1', 'wellpoint': 'ANTHEM1',
  'tricare': '99726', 'champus': '99726',
  'medicare': 'MDCR', 'cms': 'MDCR', 'medicare advantage': 'MDCR',
  'oscar': '11303', 'oscar health': '11303',
  'kaiser': 'KPSA0', 'kaiser permanente': 'KPSA0',
  'molina': 'MHHI0', 'molina healthcare': 'MHHI0',
  'wellcare': 'WCA01',
  'bcbs fep': 'BCBSF', 'federal employee': 'BCBSF', 'fep': 'BCBSF', 'federal employees': 'BCBSF',
  'highmark': '00033',
  'carefirst': '00380',
  'horizon': 'HBCBS', 'horizon bcbs': 'HBCBS',
  'bcbs of nc': '00544', 'blue cross nc': '00544',
  'bcbs of texas': '00901', 'bcbs texas': '00901',
  'bcbs of illinois': '00111', 'bcbs illinois': '00111',
  'bcbs of alabama': '00020', 'bcbs alabama': '00020',
  'premera': 'PRMR0', 'premera blue cross': 'PRMR0',
  'regence': 'REGCE', 'regence blueshield': 'REGCE',
  'health net': 'HealthNet', 'healthnet': 'HealthNet',
  'emblemhealth': 'GHIBS',
  'medica': 'MDCAI',
  'select health': 'SLHLT', 'selecthealth': 'SLHLT',
  'geisinger': 'GEISG',
  'upmc': 'UPMCP', 'upmc health plan': 'UPMCP',
  'harvard pilgrim': 'HARVP',
  'tufts health': 'TUFT0', 'tufts': 'TUFT0',
  'va': '12115', 'veterans affairs': '12115', 'va health': '12115',
};

export function resolveStediPayerId(insurerName: string): string {
  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(PAYER_ID_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return normalized.replace(/[^a-z0-9]/g, '').slice(0, 10).toUpperCase();
}

interface BenefitInfo {
  code?: string;
  name?: string;
  serviceTypeCodes?: string[];
  serviceTypes?: string[];
  benefitAmount?: string;
  benefitPercent?: string;
  coverageLevelCode?: string;
  coverageLevel?: string;
  timePeriodQualifier?: string;
  timePeriodQualifierCode?: string;
  inPlanNetworkIndicatorCode?: string;
  inPlanNetworkIndicator?: string;
  planCoverage?: string;
  description?: string;
  relatedEntity?: {
    entityIdentifier?: string;
    entityName?: string;
    contactInformations?: Array<{ communicationMode?: string; communicationNumber?: string }>;
  };
}

interface StediResponse {
  id?: string;
  controlNumber?: string;
  tradingPartnerServiceId?: string;
  payer?: { payerName?: string; payerId?: string; entityIdentifier?: string };
  subscriber?: {
    firstName?: string;
    lastName?: string;
    memberId?: string;
    groupNumber?: string;
    planDescription?: string;
    planNumber?: string;
  };
  planStatus?: Array<{ statusCode?: string; status?: string; serviceTypeCodes?: string[] }>;
  benefitsInformation?: BenefitInfo[];
  errors?: Array<{ code?: string; description?: string; field?: string }>;
}

export async function runStediCheck(params: {
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  firstName: string;
  lastName: string;
  dob: string;
}): Promise<StediData | null> {
  if (!STEDI_API_KEY) {
    console.info('[stedi] STEDI_API_KEY not set — skipping real-time eligibility check.');
    return null;
  }

  const payerId = resolveStediPayerId(params.insurerName);
  const dobFormatted = params.dob.replace(/-/g, '');
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const requestBody = {
    controlNumber: String(Date.now()).slice(-9),
    tradingPartnerServiceId: payerId,
    provider: {
      organizationName: PROVIDER_NAME,
      npi: PROVIDER_NPI,
    },
    subscriber: {
      firstName: params.firstName,
      lastName: params.lastName,
      dateOfBirth: dobFormatted,
      memberId: params.memberId,
      ...(params.groupNumber ? { groupNumber: params.groupNumber } : {}),
    },
    encounter: {
      dateOfService: today,
      serviceTypeCodes: ['88'],
    },
  };

  try {
    const res = await fetch(STEDI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${STEDI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn(`[stedi] API error ${res.status}: ${errBody.slice(0, 300)}`);
      return null;
    }

    const data = await res.json() as StediResponse;
    return parseStediResponse(data, params.insurerName);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[stedi] Request failed:', message);
    return null;
  }
}

function parseStediResponse(data: StediResponse, fallbackInsurer: string): StediData {
  const benefits = data.benefitsInformation || [];

  const pharmacyBenefits = benefits.filter(b =>
    Array.isArray(b.serviceTypeCodes) && b.serviceTypeCodes.includes('88')
  );

  const activeBenefit = pharmacyBenefits.find(b => b.code === '1' || b.name === 'Active Coverage');
  const pharmacyBenefitActive = activeBenefit !== undefined
    && activeBenefit.inPlanNetworkIndicatorCode !== 'N';

  const indivDeductible = pharmacyBenefits.find(b =>
    b.code === 'C' &&
    (b.coverageLevelCode === 'IND' || b.coverageLevel?.toLowerCase().includes('individual')) &&
    (b.timePeriodQualifier?.toLowerCase().includes('calendar') || b.timePeriodQualifierCode === '23')
  );
  const indivDeductibleRemaining = pharmacyBenefits.find(b =>
    b.code === 'C' &&
    (b.coverageLevelCode === 'IND' || b.coverageLevel?.toLowerCase().includes('individual')) &&
    (b.timePeriodQualifier?.toLowerCase().includes('remaining') || b.timePeriodQualifierCode === '29')
  );

  const deductibleAmount = indivDeductible?.benefitAmount
    ? parseFloat(indivDeductible.benefitAmount)
    : undefined;
  const deductibleRemaining = indivDeductibleRemaining?.benefitAmount
    ? parseFloat(indivDeductibleRemaining.benefitAmount)
    : undefined;

  const limitationBenefits = pharmacyBenefits.filter(b => b.code === '7');
  const limitationNotes = limitationBenefits
    .map(b => b.description || b.planCoverage || '')
    .filter(Boolean)
    .join('; ');

  const relatedEntity = pharmacyBenefits.find(b => b.relatedEntity?.entityName)?.relatedEntity;
  const pbmPhone = relatedEntity?.contactInformations?.find(c =>
    c.communicationMode === 'TE' || c.communicationMode === 'Telephone'
  )?.communicationNumber || null;

  const planStatus = data.planStatus || [];
  const generallyActive = planStatus.some(s => s.statusCode === '1' || s.status === 'Active');

  const hasErrors = (data.errors || []).length > 0;
  const errorMsg = hasErrors
    ? data.errors!.map(e => `${e.code}: ${e.description}`).join('; ')
    : undefined;

  const subscriber = data.subscriber;

  return {
    pharmacyBenefitActive: pharmacyBenefits.length === 0 ? generallyActive : pharmacyBenefitActive,
    planName: subscriber?.planDescription || subscriber?.planNumber || null,
    payerName: data.payer?.payerName || fallbackInsurer,
    payerId: data.payer?.payerId || data.tradingPartnerServiceId || null,
    pbm: relatedEntity?.entityName
      ? { name: relatedEntity.entityName, phone: pbmPhone }
      : null,
    generalPaIndicator: limitationBenefits.length > 0,
    deductible: (deductibleAmount !== undefined || deductibleRemaining !== undefined)
      ? { amount: deductibleAmount, remaining: deductibleRemaining }
      : null,
    specialtyNotes: limitationNotes || null,
    error: errorMsg,
  };
}
