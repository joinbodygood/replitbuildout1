const BASE = "https://marketplace.api.healthcare.gov/api/v1";
const TIMEOUT_MS = 4000;

export interface HealthcareGovCoverage {
  covered: boolean; drugTier: string | null; paRequired: boolean; stepTherapy: boolean; copay: number | null;
}

async function fetchWithTimeout(url: string, ms = TIMEOUT_MS) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { signal: ac.signal }); }
  finally { clearTimeout(t); }
}

export async function lookupDrugRxcui(drugName: string): Promise<string | null> {
  const key = process.env.HEALTHCARE_GOV_API_KEY;
  if (!key) return null;
  try {
    const res = await fetchWithTimeout(`${BASE}/drugs/search?q=${encodeURIComponent(drugName)}&apikey=${key}`);
    if (!res.ok) return null;
    const j = await res.json() as { drugs?: Array<{ rxcui: string; name: string }> };
    return j.drugs?.[0]?.rxcui ?? null;
  } catch (err) {
    console.warn("[healthcare-gov-client] lookupDrugRxcui failed", { drugName, err });
    return null;
  }
}

export async function checkCoverage(args: { year: number; rxcui: string; planId: string }): Promise<HealthcareGovCoverage | null> {
  const key = process.env.HEALTHCARE_GOV_API_KEY;
  if (!key) return null;
  const url = `${BASE}/drugs/covered?year=${args.year}&drugs=${args.rxcui}&planids=${args.planId}&apikey=${key}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const j = await res.json() as {
      coverage?: Array<{ covered: boolean; drug_tier?: string; prior_authorization?: boolean; step_therapy?: boolean; copay_amount?: number }>;
    };
    const c = j.coverage?.[0];
    if (!c) return null;
    return {
      covered: !!c.covered, drugTier: c.drug_tier ?? null,
      paRequired: !!c.prior_authorization, stepTherapy: !!c.step_therapy, copay: c.copay_amount ?? null,
    };
  } catch (err) {
    console.warn("[healthcare-gov-client] checkCoverage failed", { rxcui: args.rxcui, planId: args.planId, err });
    return null;
  }
}
