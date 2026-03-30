/**
 * Real-time insurance eligibility via Stedi
 *
 * ─── OPTION 1 — Stedi API (requires Developer plan for production keys) ───────
 * Test key (already in portal, free, returns mock data):
 *   Go to portal.stedi.com → Settings → API Keys → Create API Key → Test mode
 *   Add to Replit Secrets: STEDI_API_KEY = test_0dqzhy0...  (validates integration)
 *
 * Production key (requires paid Developer plan):
 *   portal.stedi.com → Settings → Billing → Upgrade → then create Production key
 *   Add to Replit Secrets: STEDI_API_KEY = <production key>
 *
 * ─── OPTION 2 — Portal automation (FREE, uses your existing Basic plan) ──────
 * No API key needed. Headlessly automates portal.stedi.com with your credentials.
 * Add to Replit Secrets:
 *   STEDI_EMAIL      = linda@bodygoodstudio.com
 *   STEDI_PASSWORD   = <portal password>
 *   STEDI_ACCOUNT_ID = 1b621bea-6ae4-4cc4-a870-7e6df38c4b26
 *
 * ─── OPTION 3 — Eligible.com (future) ───────────────────────────────────────
 * ~$0.05/check, requires BAA. Contact eligible.com → add ELIGIBLE_API_KEY.
 *
 * ─── PRIORITY ORDER ──────────────────────────────────────────────────────────
 * STEDI_API_KEY present → API (fast, structured)
 * STEDI_EMAIL present   → Portal automation (free, slower ~15s)
 * Neither              → graceful skip, other 3 sources carry full weight
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { StediData } from './confidence-engine';
import { runPortalEligibilityCheck, portalCredentialsAvailable } from './stedi-portal';
import { resolveStediPayerId } from './stedi-payer-ids';

const STEDI_API_KEY = process.env.STEDI_API_KEY;
const STEDI_RELAY_URL = process.env.STEDI_RELAY_URL;
const STEDI_BASE = STEDI_RELAY_URL
  ? STEDI_RELAY_URL.replace(/\/$/, '')
  : 'https://healthcare.us.stedi.com';
const STEDI_ENDPOINT = `${STEDI_BASE}/2024-04-01/change/medicalnetwork/eligibility/v3`;
const PROVIDER_NPI = process.env.PROVIDER_NPI || '1558788851';
const PROVIDER_NAME = process.env.PROVIDER_NAME || 'Body Good Studio';

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
    if (portalCredentialsAvailable()) {
      console.info('[stedi] No API key — falling back to portal automation');
      const payerId = resolveStediPayerId(params.insurerName);
      return runPortalEligibilityCheck({
        insurerName: params.insurerName,
        payerId,
        memberId: params.memberId,
        firstName: params.firstName,
        lastName: params.lastName,
        dob: params.dob,
      });
    }
    console.info('[stedi] No API key or portal credentials — skipping real-time eligibility check.');
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
