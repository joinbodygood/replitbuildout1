# Body Good Insurance Coverage Check Tool — Developer Handoff

## Owner: Dr. Linda Moleon
## Developer: Ayush
## Prepared: March 17, 2026
## Status: Ready to Build

---

## WHAT THIS IS

An automated insurance eligibility check tool that patients pay $25 for on Shopify.
It combines 5 data sources to produce an instant coverage report for 4 GLP-1 medications
(Wegovy, Zepbound, Mounjaro, Ozempic) with per-medication probability scores and next-step routing.

## THE 5 DATA SOURCES

1. **Stedi 270/271** — Real-time eligibility check via API (3 seconds)
2. **Body Good Historical DB** — Zoho Creator datastore, grows with every case
3. **Pharma Coverage Checkers** — NovoCare + Lilly iAssist (manual via dashboard, Phase 1)
4. **Claude API Web Search** — Real-time formulary policy lookup
5. **BG Probability Database** — JSON file with carrier/state/medication/diagnosis probability matrix

## ACCOUNTS & CREDENTIALS

| Service | Status | Notes |
|---------|--------|-------|
| Stedi | ✅ ACTIVE | Account created, BAA signed, production key generated |
| Stedi NPI | ✅ CONFIRMED | 1558788851 (Dr. Linda Moleon) |
| Stedi Provider Org | Body Good Wellness (or legal entity on file) |
| Anthropic API | Existing key from OpenClaw setup |
| Zoho Creator | Existing (GLOW portal) |
| Zoho CRM | Existing |
| Shopify | Existing (joinbodygood.com / bodygoodstudio.com) |
| Cloudflare | Existing (api.bodygoodstudio.com) |
| CoverMyMeds | Portal: existing. API: requested 3/17, awaiting response |

## ENVIRONMENT VARIABLES (Cloudflare Worker)

```
STEDI_API_KEY=<get from Dr. Linda — stored in password manager>
ANTHROPIC_API_KEY=<existing key>
PROVIDER_NPI=1558788851
PROVIDER_ORG_NAME=Body Good Wellness
ZOHO_CLIENT_ID=<existing>
ZOHO_CLIENT_SECRET=<existing>
ZOHO_REFRESH_TOKEN=<existing>
SHOPIFY_ADMIN_KEY=<existing>
```

## FILE INVENTORY

### Core Backend
| File | Purpose | Deploy To |
|------|---------|-----------|
| `cloudflare-worker-coverage-check.js` | API endpoint orchestrating all 5 sources | Cloudflare Worker |
| `confidence-engine.js` | Scoring engine — combines sources, calculates probabilities | Import in Worker |
| `glp1-probability-database.json` | Carrier/state/med/diagnosis probability matrix | Load in Worker |

### Frontend (Patient-Facing)
| File | Purpose | Deploy To |
|------|---------|-----------|
| `coverage-check-final.jsx` | Complete patient form + results page prototype | Convert to Shopify Liquid |

### Frontend (Internal — Jena/Rhea)
| File | Purpose | Deploy To |
|------|---------|-----------|
| `three-source-dashboard.jsx` | 4-step verification workflow with pharma tool links | Zoho Creator (GLOW) |
| `internal-dashboard.jsx` | Case queue with PBM data, verification checklists | Zoho Creator (GLOW) |

### Documentation
| File | Purpose |
|------|---------|
| `coverage-check-spec.docx` | Technical spec with Stedi API details |
| `insurance-optimization.docx` | Strategic playbook: hybrid system, chargebacks, comms |
| `GLP1-Insurance-Probability-Guide-BodyGood-March2026.docx` | Source document for probability DB |

## BUILD ORDER

### Week 1: Core API
1. Deploy Cloudflare Worker scaffold to api.bodygoodstudio.com/coverage-check
2. Wire Stedi API call (code is written — plug in env vars)
3. Test with Dr. Linda's own insurance (Cigna, already tested in portal)
4. Test with 2-3 other real insurers to validate parsing
5. Deploy probability database JSON alongside worker

### Week 2: Frontend + Dashboard
1. Convert coverage-check-final.jsx to Shopify Liquid template for /pages/check-coverage
2. Build Zoho Creator dashboard for Jena/Rhea case queue
3. Implement historical database storage in Zoho Creator
4. Wire Claude API web search call (code is written in worker)
5. Build pharma checker clipboard-copy + browser-launch links

### Week 3: Communication + Payment Gate
1. Build n8n workflows: email/SMS on submit, results ready, 24hr/48hr/7day follow-ups
2. Implement Shopify order token validation (payment gate for $25)
3. Wire Zoho CRM result storage (lead/contact record update)
4. Build PDF coverage report auto-generation for email delivery

### Week 4: Test + Launch
1. Internal testing: 10 real cases through full system
2. Jena/Rhea validate accuracy against manual checks
3. Tune confidence engine thresholds
4. Update probability database with any corrections
5. Soft launch to new patients only
6. Full launch with CTAs placed site-wide

## KEY TECHNICAL NOTES

### Stedi API
- Endpoint: POST https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3
- Service type code 88 = Pharmacy benefits
- Most commercial payers do NOT require enrollment — can start immediately
- Medicare (CMS) requires attestation — must be done by May 11, 2026
- Mock testing: only supports STC 30 (medical), not 88 (pharmacy) — use production key with real data to test pharmacy
- BAA: signed during account creation (checkbox on signup form)
- Pricing: first 100 checks/month free, then $0.15 each

### Confidence Engine
- Weights: Pharma checker (30%), Historical DB (25%), Stedi (15%), Web search (15%), Probability DB (15%)
- Agreement bonus: +15 confidence if all sources agree
- Green bucket: 3+ medications at high/moderate confidence
- Yellow bucket: 2+ inconclusive or mixed signals
- Red bucket: all medications not covered

### HIPAA Compliance
- NO PHI in URL parameters
- NO PHI in client-side storage or analytics
- NO tracking pixels on the /check-coverage page
- ALL PHI flows through Cloudflare Worker (HTTPS) to Stedi (BAA) to Zoho (BAA)
- Audit log: timestamps + order IDs only, never member IDs

### Patient Form Fields
- First name, last name, DOB (required)
- Insurance company with typeahead search (required)
- Member ID (required)
- Group number (optional)
- State (required — for probability DB lookup)
- Diagnoses: T2D, Obesity, Overweight+, Prediabetes, OSA, CVD, Metabolic Syndrome, PCOS, None (multi-select)
- Employer size: Large (5000+), Medium (500-4999), Small (<500), Government/Federal, Government/State, Self-employed, Marketplace/ACA (single-select)
- Plan type: Through employer, Marketplace/ACA, Medicaid, Medicare, TRICARE, VA, BCBS FEP (single-select)

### Chargeback Prevention
- "Non-refundable" language on Shopify product page
- "Non-refundable" in order confirmation email
- Timestamp when check was run (proof of work)
- PDF report delivered (proof of value)
- Every result has actionable next step (no dead ends)

## QUESTIONS FOR AYUSH

If you have questions, Dr. Linda has the full conversation context. Key contacts:
- Stedi support: Slack channel (created during signup) or support@stedi.com — <10 min response time
- CoverMyMeds API: ehr-api-request@covermymeds.com (email sent 3/17, pending)
- Claude API: existing setup via OpenClaw

## TESTING CHECKLIST

Before soft launch, verify:
- [ ] Stedi returns pharmacy benefits (STC 88) for Cigna, BCBS FL, UHC, Aetna, Humana
- [ ] Confidence engine produces correct Green/Yellow/Red for known test cases
- [ ] Shopify order token validation works (prevents free checks)
- [ ] Zoho CRM receives and stores results correctly
- [ ] Yellow cases appear in Jena/Rhea dashboard with correct data
- [ ] Email/SMS fires on form submit and results delivery
- [ ] PDF coverage report generates correctly
- [ ] Patient form works on mobile (majority of BG traffic)
- [ ] No PHI leaks in logs, URLs, or analytics
- [ ] PBM phone number displays correctly when returned by Stedi
