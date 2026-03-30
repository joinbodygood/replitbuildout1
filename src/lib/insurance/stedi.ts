/**
 * Real-time insurance eligibility verification
 *
 * STEDI ($500/mo) was evaluated and removed from the default stack.
 *
 * ─── RECOMMENDED UPGRADE PATH ────────────────────────────────────────────────
 *
 * Option A — Eligible.com (recommended, ~$0.20/check, no monthly minimum)
 *   1. Sign up at https://eligible.com → get API key
 *   2. Add ELIGIBLE_API_KEY to Replit Secrets
 *   3. Replace the stub below with a call to their /coverage endpoint
 *
 * Option B — Availity (free for registered providers)
 *   - Free eligibility portal for NPI-registered providers
 *   - Programmatic API requires enterprise agreement
 *   - https://www.availity.com
 *
 * Option C — CMS FHIR Patient Access + Drug Formulary APIs (free)
 *   - Mandated by 21st Century Cures Act for all major payers
 *   - Drug Formulary API is publicly accessible (no auth) for formulary checks
 *   - Patient Access API needs per-patient OAuth — good for future patient portal
 *
 * ─── CURRENT SYSTEM (3 active sources, no real-time check) ───────────────────
 *   Probability DB (73 carriers)   — 40% weight
 *   Body Good historical outcomes  — 30% weight
 *   Claude web search              — 30% weight
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { StediData } from './confidence-engine';

export function resolveStediPayerId(insurerName: string): string {
  const PAYER_ID_MAP: Record<string, string> = {
    'cigna': '62308', 'evernorth': '62308',
    'aetna': '60054', 'cvs health': '60054',
    'unitedhealthcare': '87726', 'uhc': '87726', 'united health': '87726',
    'humana': '61101', 'centerwell': '61101',
    'florida blue': '00590', 'bcbs of florida': '00590', 'bcbs fl': '00590',
    'anthem': 'ANTHEM1', 'elevance': 'ANTHEM1',
    'tricare': '99726',
    'medicare': 'CMS',
    'oscar': 'OSCAR1',
    'molina': 'MOLINA1',
  };
  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(PAYER_ID_MAP)) {
    if (normalized.includes(key)) return id;
  }
  return normalized;
}

export async function runStediCheck(_params: {
  insurerName: string;
  memberId: string;
  groupNumber?: string;
  firstName: string;
  lastName: string;
  dob: string;
}): Promise<StediData | null> {
  return null;
}
