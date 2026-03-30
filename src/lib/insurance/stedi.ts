/**
 * Real-time insurance eligibility verification via Eligible.com
 *
 * ─── HOW TO ACTIVATE ─────────────────────────────────────────────────────────
 * 1. Sign up:  https://eligible.com  (contact form → sales)
 * 2. Sign the BAA (Business Associate Agreement) — required for HIPAA
 * 3. In your Eligible account: Admin → API Keys → copy your API key
 * 4. Add to Replit Secrets:  ELIGIBLE_API_KEY = <your key>
 * 5. The integration activates automatically — no code changes needed.
 *
 * ─── PRICING ─────────────────────────────────────────────────────────────────
 * ~$0.05/check (first 250k/mo). No monthly base fee.
 * Contact: support@eligibleapi.com | https://eligible.com/pricing
 *
 * ─── API REFERENCE ───────────────────────────────────────────────────────────
 * Base URL: https://gds.eligibleapi.com/v1.5
 * Endpoint: GET /coverage/all
 * Auth:     ?api_key=YOUR_KEY  (or Authorization header)
 * Sandbox:  append &test=true to any request
 * Docs:     https://eligible.com/community/
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { StediData } from './confidence-engine';

const ELIGIBLE_API_KEY = process.env.ELIGIBLE_API_KEY;
const ELIGIBLE_BASE_URL = 'https://gds.eligibleapi.com/v1.5';
const PROVIDER_NPI = process.env.PROVIDER_NPI || '1558788851';

const PAYER_ID_MAP: Record<string, string> = {
  'cigna': '62308', 'evernorth': '62308',
  'aetna': '60054', 'cvs health': '60054',
  'unitedhealthcare': '87726', 'united health': '87726', 'uhc': '87726',
  'humana': '61101', 'centerwell': '61101',
  'florida blue': '00590', 'bcbs of florida': '00590', 'bcbs fl': '00590', 'blue cross florida': '00590',
  'anthem': 'ANTHEM1', 'elevance': 'ANTHEM1',
  'tricare': '99726', 'champus': '99726',
  'medicare': 'MDCR', 'cms': 'MDCR',
  'oscar': '11303',
  'kaiser': 'KPSA0',
  'molina': 'MHHI0',
  'wellcare': 'WCA01',
  'bcbs fep': 'BCBSF', 'federal employee': 'BCBSF', 'fep': 'BCBSF',
  'highmark': '00033',
  'carefirst': '00380',
  'horizon': 'HBCBS',
  'bcbs of nc': '00544', 'blue cross nc': '00544',
  'bcbs of texas': '00901', 'bcbs texas': '00901',
  'bcbs of illinois': '00111', 'bcbs illinois': '00111',
  'bcbs of alabama': '00020', 'bcbs alabama': '00020',
  'premera': 'PRMR0', 'premera blue cross': 'PRMR0',
  'regence': 'REGCE',
  'health net': 'HealthNet', 'healthnet': 'HealthNet',
  'emblemhealth': 'GHIBS', 'ghicp': 'GHIBS',
  'medica': 'MDCAI',
  'select health': 'SLHLT', 'selecthealth': 'SLHLT',
  'geisinger': 'GEISG',
  'upmc': 'UPMCP',
  'harvard pilgrim': 'HARVP',
  'tufts health': 'TUFT0',
  'va': '12115', 'veterans affairs': '12115',
};

export function resolveEligiblePayerId(insurerName: string): string {
  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(PAYER_ID_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return normalized.replace(/\s+/g, '').slice(0, 10);
}

interface EligibleBenefit {
  name: string;
  service_type?: string;
  service_type_name?: string;
  time_qualifier?: string;
  benefit_amount?: string | null;
  benefit_percent?: string | null;
  in_plan_network?: string;
  messages?: string[];
}

interface EligibleResponse {
  eligible_id?: string;
  payer?: { id?: string; name?: string };
  subscriber?: {
    plan_name?: string;
    plan_number?: string;
    group_name?: string;
    group_id?: string;
  };
  coverage?: {
    active?: boolean;
    service_type?: string;
    benefit_related_entity?: {
      entity_name?: string;
      phone?: string;
    };
    benefits?: EligibleBenefit[];
  };
  financial_flows?: {
    bin_number?: string;
    pcn?: string;
    rx_group?: string;
  };
  errors?: Array<{ code?: string; message?: string; field?: string }>;
  warnings?: Array<{ message?: string }>;
}

export async function runStediCheck(params: {
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  firstName: string;
  lastName: string;
  dob: string;
}): Promise<StediData | null> {
  if (!ELIGIBLE_API_KEY) {
    console.info('[eligible] ELIGIBLE_API_KEY not set — skipping real-time eligibility check.');
    return null;
  }

  const payerId = resolveEligiblePayerId(params.insurerName);
  const isTest = process.env.NODE_ENV !== 'production';

  const queryParams = new URLSearchParams({
    api_key: ELIGIBLE_API_KEY,
    payer_id: payerId,
    provider_npi: PROVIDER_NPI,
    member_id: params.memberId,
    member_first_name: params.firstName,
    member_last_name: params.lastName,
    member_dob: params.dob,
    service_type: '88',
  });

  if (params.groupNumber) queryParams.set('member_group_id', params.groupNumber);
  if (isTest) queryParams.set('test', 'true');

  try {
    const res = await fetch(`${ELIGIBLE_BASE_URL}/coverage/all?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn(`[eligible] API error ${res.status}: ${errBody.slice(0, 200)}`);
      return null;
    }

    const data = await res.json() as EligibleResponse;
    return parseEligibleResponse(data, params.insurerName);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[eligible] Request failed:', message);
    return null;
  }
}

function parseEligibleResponse(data: EligibleResponse, fallbackInsurer: string): StediData {
  const coverage = data.coverage;
  const subscriber = data.subscriber;

  const pharmacyBenefitActive = coverage?.active === true;

  const benefits = coverage?.benefits || [];

  const activeBenefit = benefits.find(b =>
    b.name?.toLowerCase().includes('active') && b.service_type === '88'
  );
  const isPharmacyActive = pharmacyBenefitActive ||
    (activeBenefit !== undefined && activeBenefit.in_plan_network !== 'no');

  const deductibleEntry = benefits.find(b =>
    b.name?.toLowerCase().includes('deductible') &&
    b.time_qualifier?.toLowerCase().includes('calendar')
  );
  const deductibleRemaining = benefits.find(b =>
    b.name?.toLowerCase().includes('deductible') &&
    b.time_qualifier?.toLowerCase().includes('remaining')
  );

  const deductibleAmount = deductibleEntry?.benefit_amount
    ? parseFloat(deductibleEntry.benefit_amount)
    : undefined;
  const deductibleRemainingAmt = deductibleRemaining?.benefit_amount
    ? parseFloat(deductibleRemaining.benefit_amount)
    : undefined;

  const limitationNotes = benefits
    .filter(b => b.name?.toLowerCase().includes('limitation') || b.name?.toLowerCase().includes('non-covered'))
    .flatMap(b => b.messages || [])
    .join('; ');

  const pbmEntity = coverage?.benefit_related_entity;
  const bins = data.financial_flows;

  const pbmName = pbmEntity?.entity_name ||
    (bins?.bin_number ? `BIN: ${bins.bin_number}${bins.pcn ? ` / PCN: ${bins.pcn}` : ''}` : null);
  const pbmPhone = pbmEntity?.phone || null;

  const hasErrors = (data.errors || []).length > 0;
  const errorMsg = hasErrors
    ? data.errors!.map(e => `${e.code}: ${e.message}`).join('; ')
    : undefined;

  return {
    pharmacyBenefitActive: isPharmacyActive,
    planName: subscriber?.plan_name || subscriber?.group_name || null,
    payerName: data.payer?.name || fallbackInsurer,
    payerId: data.payer?.id || null,
    pbm: pbmName ? { name: pbmName, phone: pbmPhone } : null,
    generalPaIndicator: false,
    deductible: (deductibleAmount !== undefined || deductibleRemainingAmt !== undefined)
      ? { amount: deductibleAmount, remaining: deductibleRemainingAmt }
      : null,
    specialtyNotes: limitationNotes || null,
    error: errorMsg,
  };
}
