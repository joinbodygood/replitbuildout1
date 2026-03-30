/**
 * Body Good Coverage Check API
 * Cloudflare Worker - api.bodygoodstudio.com/coverage-check
 * 
 * Orchestrates the 5-source eligibility check:
 * 1. Stedi 270/271 (real-time)
 * 2. Body Good historical DB (Zoho Creator lookup)
 * 3. Pharma checker results (manual, queued for Jena/Rhea)
 * 4. Claude API web search (real-time)
 * 5. Probability database (local JSON)
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 *   STEDI_API_KEY - Production Stedi API key
 *   STEDI_TEST_KEY - Test Stedi API key
 *   ANTHROPIC_API_KEY - Claude API key for web search (Source 4)
 *   ZOHO_CLIENT_ID - Zoho API client ID
 *   ZOHO_CLIENT_SECRET - Zoho API client secret
 *   ZOHO_REFRESH_TOKEN - Zoho API refresh token
 *   SHOPIFY_ADMIN_KEY - For order token validation
 *   PROVIDER_NPI - Dr. Linda's NPI
 *   PROVIDER_ORG_NAME - "Body Good Wellness" or legal entity name
 */

import { ConfidenceEngine } from './confidence-engine.js';
import probabilityDB from './glp1-probability-database.json';

const engine = new ConfidenceEngine(probabilityDB);

// ============================================================
// MAIN HANDLER
// ============================================================

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://joinbodygood.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const body = await request.json();
      
      // Step 0: Validate order token (proves $25 was paid)
      // TODO: Ayush - validate body.orderToken against Shopify Admin API
      // const isValidOrder = await validateShopifyOrder(body.orderToken, env);
      // if (!isValidOrder) return jsonResponse({ error: 'Invalid or used order token' }, 403, corsHeaders);

      const patient = {
        firstName: body.firstName,
        lastName: body.lastName,
        dob: body.dob,
        state: body.state || 'FL',
        insurerName: body.insurer,
        memberId: body.memberId,
        groupNumber: body.groupNumber || '',
        diagnoses: body.diagnoses || [],
        employerSize: body.employerSize || 'medium_500_4999',
        planType: body.planType || 'employer',
      };

      // ── Source 1: Stedi 270/271 ──
      console.log('[Source 1] Running Stedi eligibility check...');
      const stediResponse = await runStediCheck(patient, env);

      // ── Source 2: Body Good Historical DB ──
      console.log('[Source 2] Checking historical database...');
      const carrierKey = engine.resolveCarrierKey(stediResponse, patient);
      const planKey = `${carrierKey}|${normalizeplanName(stediResponse?.planName)}`;
      const historicalData = await lookupHistoricalDB(planKey, env);

      // ── Source 4: Claude Web Search ──
      console.log('[Source 4] Running real-time web search...');
      const webSearchResults = await runWebSearch(stediResponse, patient, env);

      // ── Source 3: Pharma Checker (not automated - queued for background) ──
      const pharmaCheckerResults = null; // Will be filled by Jena/Rhea later

      // ── Source 5: Probability DB ──
      // (Built into the confidence engine, loaded from JSON)

      // ── Calculate Combined Results ──
      console.log('[Engine] Calculating combined coverage results...');
      const results = engine.calculateCoverage(
        patient, stediResponse, historicalData, webSearchResults, pharmaCheckerResults
      );

      // ── Store Results in Zoho CRM ──
      console.log('[Storage] Saving to Zoho CRM...');
      await storeResultsInZoho(patient, results, env);

      // ── Queue for Jena/Rhea if Yellow ──
      if (results.bucket === 'yellow') {
        console.log('[Queue] Yellow bucket - queuing for manual review...');
        await queueForReview(patient, results, stediResponse, env);
      }

      // ── Return Results ──
      return jsonResponse({
        success: true,
        bucket: results.bucket,
        patient: results.patient,
        insurance: results.insurance,
        medications: results.medications.map(m => ({
          medication: m.medication,
          displayName: m.displayName,
          generic: m.generic,
          manufacturer: m.manufacturer,
          fdaIndication: m.fdaIndication,
          status: m.status,
          confidenceScore: m.confidenceScore,
          confidenceLevel: m.confidenceLevel,
          rating: m.rating,
          probabilityDisplay: m.probabilityDisplay,
          recommendedIndication: m.recommendedIndication,
          paRequired: m.paRequired,
          nextStep: m.nextStep,
          nextStepRoute: m.nextStepRoute,
          nextStepPrice: m.nextStepPrice,
          diagnosisNote: m.diagnosisNote,
          requiredDocumentation: m.requiredDocumentation,
          sourcesAgreeing: m.sourcesAgreeing,
          sourcesTotal: m.sourcesTotal,
        })),
        sourcesUsed: results.sourcesUsed,
        timestamp: results.timestamp,
        pharmacyPhone: results.insurance.pharmacyPhone,
      }, 200, corsHeaders);

    } catch (error) {
      console.error('[Error]', error.message, error.stack);
      return jsonResponse({ 
        error: 'Coverage check failed', 
        message: error.message,
        // In production, don't expose stack traces
      }, 500, corsHeaders);
    }
  }
};

// ============================================================
// SOURCE 1: STEDI 270/271
// ============================================================

async function runStediCheck(patient, env) {
  const apiKey = env.STEDI_API_KEY;
  const endpoint = 'https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3';

  // Map insurer name to Stedi trading partner ID
  const tradingPartnerId = resolveStediPayerId(patient.insurerName);

  const requestBody = {
    controlNumber: `BG-${Date.now()}`,
    tradingPartnerServiceId: tradingPartnerId,
    provider: {
      organizationName: env.PROVIDER_ORG_NAME || 'Body Good Wellness',
      npi: env.PROVIDER_NPI,
    },
    subscriber: {
      memberId: patient.memberId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dob.replace(/-/g, ''), // YYYYMMDD
    },
    encounter: {
      serviceTypeCodes: ['88'], // Pharmacy
    },
  };

  if (patient.groupNumber) {
    requestBody.subscriber.groupNumber = patient.groupNumber;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    // Parse the 271 response into our standard format
    return parseStediResponse(data);
  } catch (error) {
    console.error('[Stedi Error]', error.message);
    return {
      pharmacyBenefitActive: false,
      planName: 'Unknown',
      payerName: patient.insurerName,
      payerId: tradingPartnerId,
      pbm: null,
      generalPaIndicator: false,
      deductible: null,
      copayStructure: null,
      specialtyNotes: null,
      error: error.message,
    };
  }
}

function parseStediResponse(data) {
  const benefits = data.benefitsInformation || [];
  const pharmacyBenefits = benefits.filter(b => 
    b.serviceTypeCodes?.includes('88') || 
    b.serviceTypes?.includes('Pharmacy')
  );

  const planStatus = data.planStatus || {};
  const isActive = planStatus.statusCode === '1' || 
    pharmacyBenefits.some(b => b.code === '1');

  // Extract PBM from benefitsRelatedEntities
  let pbm = null;
  benefits.forEach(b => {
    if (b.benefitsRelatedEntities) {
      b.benefitsRelatedEntities.forEach(entity => {
        if (entity.entityName && entity.contactInformation) {
          const phone = entity.contactInformation.contacts?.find(
            c => c.communicationMode === 'Telephone'
          )?.communicationNumber;
          pbm = {
            name: entity.entityName,
            phone: phone ? formatPhone(phone) : null,
            entityType: entity.entityIdentifier,
          };
        }
      });
    }
  });

  // Extract PA indicator
  const hasPaIndicator = pharmacyBenefits.some(b => b.authOrCertIndicator === 'Y');

  // Extract plan name
  const planName = benefits.find(b => b.planName)?.planName || 
    pharmacyBenefits.find(b => b.planName)?.planName || 
    'Unknown';

  // Extract deductible
  const deductibleEntries = benefits.filter(b => b.code === 'C' && b.serviceTypeCodes?.includes('88'));
  const deductible = deductibleEntries.length > 0 ? {
    amount: deductibleEntries[0]?.benefitAmount,
    remaining: deductibleEntries.find(d => d.description?.includes('remaining'))?.benefitAmount,
  } : null;

  // Specialty notes
  const specialtyNotes = benefits
    .filter(b => b.additionalInformation)
    .flatMap(b => b.additionalInformation.map(a => a.description))
    .filter(Boolean)
    .join('; ');

  return {
    pharmacyBenefitActive: isActive,
    planName,
    payerName: data.payer?.name || data.tradingPartnerServiceId || 'Unknown',
    payerId: data.tradingPartnerServiceId,
    pbm,
    generalPaIndicator: hasPaIndicator,
    deductible,
    copayStructure: null, // TODO: parse copay tiers
    specialtyNotes: specialtyNotes || null,
    rawServiceTypeCodes: pharmacyBenefits.map(b => ({
      code: b.code,
      name: b.name,
      serviceTypes: b.serviceTypes,
      limitations: b.limitations,
    })),
  };
}

// ============================================================
// SOURCE 2: HISTORICAL DATABASE (Zoho Creator)
// ============================================================

async function lookupHistoricalDB(planKey, env) {
  // TODO: Ayush - implement Zoho Creator API lookup
  // Query: SELECT * FROM CoverageResults WHERE planKey = '{planKey}' ORDER BY verifiedDate DESC LIMIT 20
  // Return: { caseCount, medications: { wegovy: { status, approvalRate }, ... }, lastVerified, verifiedBy }
  
  // Placeholder - returns null until Zoho integration is built
  return null;
}

// ============================================================
// SOURCE 4: CLAUDE WEB SEARCH
// ============================================================

async function runWebSearch(stediResponse, patient, env) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const payerName = stediResponse?.payerName || patient.insurerName;
  const year = new Date().getFullYear();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
        }],
        messages: [{
          role: 'user',
          content: `Search for the current ${year} formulary and prior authorization requirements for GLP-1 medications (Wegovy, Zepbound, Mounjaro, Ozempic) on ${payerName} insurance plans.

Return ONLY a JSON object with this exact structure, no other text:
{
  "wegovy": { "status": "eligible|pa_required|not_covered|unknown", "notes": "brief summary", "confidence": 60 },
  "zepbound": { "status": "eligible|pa_required|not_covered|unknown", "notes": "brief summary", "confidence": 60 },
  "mounjaro": { "status": "eligible|pa_required|not_covered|unknown", "notes": "brief summary", "confidence": 60 },
  "ozempic": { "status": "eligible|pa_required|not_covered|unknown", "notes": "brief summary", "confidence": 60 }
}`
        }],
      }),
    });

    const data = await response.json();
    const textContent = data.content?.filter(c => c.type === 'text').map(c => c.text).join('');
    
    // Try to parse JSON from the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('[Web Search Error]', error.message);
    return null;
  }
}

// ============================================================
// STORAGE: Zoho CRM
// ============================================================

async function storeResultsInZoho(patient, results, env) {
  // TODO: Ayush - implement Zoho CRM API
  // Create or update Lead/Contact record with coverage check results
  // Fields: Coverage_Check_Date, Payer, Plan_Name, Bucket (Green/Yellow/Red),
  //         Wegovy_Status, Zepbound_Status, Mounjaro_Status, Ozempic_Status,
  //         Confidence_Score, Recommended_Pathway, Diagnoses
  console.log('[Zoho] Would store results for', patient.firstName, patient.lastName);
}

async function queueForReview(patient, results, stediResponse, env) {
  // TODO: Ayush - Create record in Zoho Creator "CoverageReviewQueue"
  // Include: all patient data, Stedi raw response, rule engine results,
  //          PBM phone number, verification checklist
  console.log('[Queue] Would queue Yellow case for Jena/Rhea review');
}

// ============================================================
// HELPERS
// ============================================================

function resolveStediPayerId(insurerName) {
  const map = {
    'cigna': '62308',
    'aetna': '60054',
    'unitedealthcare': '87726',
    'uhc': '87726',
    'humana': '61101',
    'bcbs': '00590', // Default to FL Blue, should be state-specific
    'florida blue': '00590',
    'blue cross blue shield of florida': '00590',
    'anthem': 'ANTHEM1',
    'tricare': '99726',
    'medicare': 'CMS',
    'oscar': 'OSCAR1',
    'kaiser': 'KAISER1',
    'molina': 'MOLINA1',
  };

  const normalized = (insurerName || '').toLowerCase().trim();
  for (const [key, id] of Object.entries(map)) {
    if (normalized.includes(key)) return id;
  }
  return normalized; // Return as-is if no match, Stedi may resolve it
}

function normalizeplanName(planName) {
  return (planName || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return phone;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}
