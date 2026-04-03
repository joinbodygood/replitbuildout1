import { NextRequest, NextResponse } from 'next/server';
import { ConfidenceEngine } from '@/lib/insurance/confidence-engine';
import type { PatientInput } from '@/lib/insurance/confidence-engine';
import { runStediCheck } from '@/lib/insurance/stedi';
import { runWebSearch } from '@/lib/insurance/web-search';
import { fireWebhook } from '@/lib/webhooks';
import { createCase, findCaseByEmail } from '@/lib/pa/case-service';
import { autoAssign } from '@/lib/pa/assignment-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      insurerName: string;
      memberId: string;
      groupNumber?: string;
      subscriberName: string;
      subscriberDob: string;
      state: string;
      conditions: string[];
      employerSize: string;
      planType: string;
      preferredMed?: string;
      intakeRef?: string;
    };

    const { insurerName, memberId, groupNumber, subscriberName, subscriberDob, state, conditions, employerSize, planType } = body;

    if (!insurerName || !memberId || !subscriberName || !subscriberDob || !state) {
      return NextResponse.json({ error: 'Missing required fields: insurerName, memberId, subscriberName, subscriberDob, state' }, { status: 400 });
    }

    const nameParts = subscriberName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    const diagnoses = mapConditionsToDiagnoses(conditions || []);

    const patient: PatientInput = {
      firstName,
      lastName,
      dob: subscriberDob,
      state,
      insurerName,
      memberId,
      groupNumber,
      diagnoses,
      employerSize: employerSize || 'medium_500_4999',
      planType: mapPlanType(planType || ''),
    };

    const [eligibleResult, webSearchResult] = await Promise.all([
      runStediCheck({ insurerName, memberId, groupNumber, firstName, lastName, dob: subscriberDob })
        .catch((err: Error) => { console.warn('[coverage-check] Eligible check failed:', err?.message); return null; }),
      runWebSearch({ insurerName, state, diagnoses, employerSize })
        .catch((err: Error) => { console.warn('[coverage-check] Web search failed:', err?.message); return null; }),
    ]);

    const engine = new ConfidenceEngine();
    const results = await engine.calculateCoverage(patient, eligibleResult, webSearchResult);

    fireWebhook('coverage_check.completed', {
      intakeRef: body.intakeRef,
      patient: { firstName, lastName, state, insurerName, memberId },
      bucket: results.bucket,
      medications: results.medications.map(m => ({
        medication: m.medication,
        status: m.status,
        probability: m.probability,
        confidenceScore: m.confidenceScore,
      })),
      sourcesUsed: results.sourcesUsed,
      carrierKey: results.carrierKey,
      checkTimestamp: results.checkTimestamp,
    }).catch(err => console.error('[coverage-check] Webhook fire failed:', (err as Error).message));

    // Create or update PA case from coverage check results
    if (body.subscriberName && body.memberId) {
      const email = (body as Record<string, string>).patientEmail || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@pending.bodygood`;
      try {
        let paCase = await findCaseByEmail(email);
        if (!paCase) {
          paCase = await createCase({
            patientEmail: email,
            patientName: subscriberName,
            patientState: state,
            carrierName: insurerName,
            memberId,
            groupNumber,
            planType: mapPlanType(planType || ''),
            subscriberName,
            subscriberDob,
            eligibilityData: results,
            probabilityScore: results.medications.reduce((max: number, m: { probability: number }) => Math.max(max, m.probability), 0),
            probabilityBucket: results.bucket,
            stage: 'eligibility_review',
          });
          await autoAssign(paCase.id);
        }
      } catch (err) {
        console.warn('[coverage-check] PA case creation failed:', (err as Error).message);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[coverage-check] Fatal error:', message);
    return NextResponse.json({ error: 'Coverage check failed. Please try again.' }, { status: 500 });
  }
}

function mapConditionsToDiagnoses(conditions: string[]): string[] {
  const conditionMap: Record<string, string> = {
    obesity: 'obesity',
    overweight_comorbid: 'overweight',
    type2_diabetes: 't2d',
    prediabetes: 'prediabetes',
    sleep_apnea: 'osa',
    pcos: 'pcos',
    nafld: 'mash',
    cardiovascular: 'cvd',
    hypertension: 'hypertension',
    metabolic_syndrome: 'metabolic',
    dyslipidemia: 'dyslipidemia',
  };

  const mapped: string[] = [];
  for (const c of conditions) {
    const key = conditionMap[c];
    if (key) mapped.push(key);
  }
  return [...new Set(mapped)];
}

function mapPlanType(planType: string): string {
  const pt = planType.toLowerCase();
  if (pt.includes('medicaid') || pt.includes('mco')) return 'medicaid';
  if (pt.includes('medicare')) return 'medicare';
  if (pt.includes('marketplace') || pt.includes('aca')) return 'marketplace_aca';
  return 'employer';
}
