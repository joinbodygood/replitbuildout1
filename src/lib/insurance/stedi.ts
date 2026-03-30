import type { StediData } from './confidence-engine';

const PROVIDER_NPI = process.env.PROVIDER_NPI || '1558788851';
const PROVIDER_ORG = process.env.PROVIDER_ORG_NAME || 'Body Good Wellness';
const STEDI_API_KEY = process.env.STEDI_API_KEY;
const STEDI_ENDPOINT = 'https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3';

const PAYER_ID_MAP: Record<string, string> = {
  'cigna': '62308',
  'aetna': '60054',
  'unitedhealthcare': '87726',
  'uhc': '87726',
  'humana': '61101',
  'bcbs': '00590',
  'florida blue': '00590',
  'blue cross blue shield of florida': '00590',
  'anthem': 'ANTHEM1',
  'tricare': '99726',
  'medicare': 'CMS',
  'oscar': 'OSCAR1',
  'kaiser': 'KAISER1',
  'molina': 'MOLINA1',
};

export function resolveStediPayerId(insurerName: string): string {
  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(PAYER_ID_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return normalized;
}

function formatDob(dob: string): string {
  return dob.replace(/-/g, '');
}

export async function runStediCheck(params: {
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  firstName: string;
  lastName: string;
  dob: string;
}): Promise<StediData> {
  if (!STEDI_API_KEY) {
    return {
      pharmacyBenefitActive: false,
      planName: null,
      payerName: null,
      payerId: null,
      pbm: null,
      generalPaIndicator: false,
      deductible: null,
      specialtyNotes: null,
      error: 'STEDI_API_KEY not configured — skipping real-time eligibility check.',
    };
  }

  const payerId = resolveStediPayerId(params.insurerName);
  const controlNumber = `BG-${Date.now()}`;

  const body = {
    controlNumber,
    tradingPartnerServiceId: payerId,
    provider: {
      organizationName: PROVIDER_ORG,
      npi: PROVIDER_NPI,
    },
    subscriber: {
      memberId: params.memberId,
      firstName: params.firstName,
      lastName: params.lastName,
      dateOfBirth: formatDob(params.dob),
    },
    encounter: {
      serviceTypeCodes: ['88'],
    },
  };

  try {
    const res = await fetch(STEDI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': STEDI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        pharmacyBenefitActive: false,
        planName: null,
        payerName: null,
        payerId: payerId,
        pbm: null,
        generalPaIndicator: false,
        deductible: null,
        specialtyNotes: null,
        error: `Stedi API error ${res.status}: ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    return parseStediResponse(data, payerId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      pharmacyBenefitActive: false,
      planName: null,
      payerName: null,
      payerId: payerId,
      pbm: null,
      generalPaIndicator: false,
      deductible: null,
      specialtyNotes: null,
      error: `Stedi network error: ${message}`,
    };
  }
}

function parseStediResponse(data: Record<string, unknown>, fallbackPayerId: string): StediData {
  try {
    const benefits = (data?.benefitsInformation as unknown[]) || [];
    const planInfo = data?.planInformation as Record<string, unknown> | undefined;
    const tradingPartner = data?.tradingPartnerName as string | undefined;

    const pharmacyBenefit = (benefits as Array<Record<string, unknown>>).find(
      (b) => b?.serviceTypeCodes && (b.serviceTypeCodes as string[]).includes('88')
    );

    const pharmacyBenefitActive = pharmacyBenefit
      ? (pharmacyBenefit.code as string) === '1' || (pharmacyBenefit.name as string)?.toLowerCase().includes('active')
      : benefits.length > 0;

    const deductibleEntry = (benefits as Array<Record<string, unknown>>).find(
      (b) =>
        (b?.benefitDescription as string)?.toLowerCase().includes('deductible') ||
        (b?.name as string)?.toLowerCase().includes('deductible')
    );

    const deductibleAmount = deductibleEntry?.benefitAmount
      ? parseFloat(deductibleEntry.benefitAmount as string)
      : undefined;

    return {
      pharmacyBenefitActive,
      planName: (planInfo?.planDescription as string) || (planInfo?.planNumber as string) || null,
      payerName: tradingPartner || null,
      payerId: fallbackPayerId,
      pbm: null,
      generalPaIndicator: false,
      deductible: deductibleAmount !== undefined ? { amount: deductibleAmount } : null,
      specialtyNotes: null,
    };
  } catch {
    return {
      pharmacyBenefitActive: true,
      planName: null,
      payerName: tradingPartner(data) || null,
      payerId: fallbackPayerId,
      pbm: null,
      generalPaIndicator: false,
      deductible: null,
      specialtyNotes: null,
    };
  }
}

function tradingPartner(data: Record<string, unknown>): string | null {
  return (data?.tradingPartnerName as string) || null;
}
