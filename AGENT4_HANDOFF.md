# Insurance Check v2 — Replit Agent 4 Handoff

**To:** Replit Agent 4
**From:** Claude Opus 4.7 (handing off after building 33/36 tasks of the spec)
**Branch:** `feat/insurance-check-v2` (26 commits ahead of `main`, pushed to `joinbodygood/replitbuildout1`)
**Repl:** `bodygood-ecommerce` (the storefront — public route at `/[locale]/insurance-check`)
**Date:** 2026-05-03

This document is your full briefing. Read it cover-to-cover before touching anything. The runbook in `INSURANCE_CHECK_V2_REPLIT_SETUP.md` is your day-1 task list; this document is the **why** behind every step.

---

## 1. What this tool is and why Body Good built it

**The product:** A free, public-facing GLP-1 insurance probability checker that lives on Body Good's storefront at `https://bodygood.com/[locale]/insurance-check`. It's the **top of the funnel** for the entire insurance-program revenue stream.

**The user journey it powers:**

```
Free quiz (this tool, ~60 seconds, name + email required)
    ↓
Probability result with one of 4 buckets per medication:
  - High Probability → "Fast-track confirmation — $25 →"
  - Coverage with PA → "Confirm coverage for $25 →"
  - Unlikely → "See self-pay options →" + small "Verify anyway? $25 →" link
  - Not on Formulary → "See self-pay options →" only
    ↓
$25 paid eligibility check (1–3 business days, Rhea/Jena confirm with insurance)
    ↓
$50 PA submission (Priya agent in bodygood-pa-module)
    ↓
$85 approval activation
    ↓
$75/mo ongoing management
```

**The business reason it matters:**

- Insurance-program revenue took a hit in 2025 when carriers tightened GLP-1 coverage and threatened medical-license revocations for aggressive PA tactics. Self-pay is now the #1 revenue priority, but insurance is still ~40% of conversions.
- The OLD insurance check (v1) was a static lookup against a hand-curated JSON file with 251 entries (10 carriers × 10 states × 4 meds). Wildly inaccurate. Customers complained about wrong "your plan covers X" answers. **Chargeback-prone.**
- Linda's competitive insight: "Nobody else in the weight-loss-clinic space queries actual formulary databases. Most clinics either guess based on carrier name, tell patients 'call your insurance', or skip insurance entirely. By building a data-driven system, Body Good can give patients SPECIFIC verifiable coverage info during the $25 step."
- The new tool also serves as a **lead magnet** for paid retargeting. Every quiz submission produces a high-intent lead with full clinical + insurance + intake context — far richer than a typical email opt-in.

**The 5 medications tracked:**

| Brand | Generic | Manufacturer | Form | Primary FDA indication |
|---|---|---|---|---|
| Wegovy | semaglutide 2.4mg | Novo Nordisk | injection | weight loss (+CV, +MASH) |
| Zepbound | tirzepatide | Eli Lilly | injection | weight loss (+OSA) |
| Ozempic | semaglutide 0.5/1/2mg | Novo Nordisk | injection | T2D (+CV) |
| Mounjaro | tirzepatide | Eli Lilly | injection | T2D |
| **Foundayo** | orforglipron | Eli Lilly | **oral pill** | weight loss |

**Foundayo is brand-new** — FDA approved April 1 2026, launched April 6. First oral small-molecule GLP-1 RA. Most plans have NOT added it to formulary yet. The default for Foundayo across every carrier is `not_on_formulary`, with a special CTA pointing to Lilly Direct's $25/mo savings card instead of standard self-pay.

---

## 2. The architectural shift from v1 to v2

### v1 (what the team replaced)

- Single static JSON file (`glp1-probability-database.json`, 1398 lines, 251 entries)
- One `InsuranceProbability` Prisma model (carrier, planType, state, probability)
- One API route (`GET /api/insurance-probability`) that did a simple `findFirst`
- Confidence engine had a 4-source mock (Stedi, historical, webSearch, probabilityDB)
- 1151-line page.tsx, 895-line confidence-engine.ts — bloated and hard to test

### v2 (what this branch ships)

**The hybrid 8-data-source architecture:**

```
                        ┌──────────────────────────┐
                        │  Customer-facing checker │
                        │  (sub-200ms reads only)  │
                        └────────────┬─────────────┘
                                     │
                        ┌────────────▼─────────────┐
                        │  coverage_index table    │
                        │  (Postgres, indexed)     │
                        └────────────▲─────────────┘
                                     │ writes
            ┌────────────┬───────────┼───────────┬──────────────┐
            │            │           │           │              │
       ┌────┴───┐   ┌────┴────┐ ┌────┴────┐ ┌────┴────┐ ┌──────┴──────┐
       │ ACA QHP │   │Medicare │ │Medicaid │ │  PBM    │ │   Carrier   │
       │  bulk   │   │ Part D  │ │ states  │ │baseline │ │   scrapers  │
       │(monthly)│   │(monthly)│ │(quarter)│ │(yearly) │ │  (monthly)  │
       └────┬────┘   └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘
            │              │           │           │              │
       MR-PUF ZIP      CMS ZIP    Curated JSON  Curated JSON   Playwright
       + drugs.json   monthly                                 (FL Blue,
                                                              Aetna, UHC,
                                                              Cigna, Humana)

       ALSO: live Healthcare.gov /drugs/covered API on per-request basis
              when ACA + plan_id resolved (4s timeout, falls back to indexed)
```

**Customer-facing flow per submit:**

1. User answers 8 questions (9 if employer): origin → state → ZIP → carrier → plan-name (autocomplete) → [employer details] → diagnoses → height/weight
2. ContactCaptureGate requires name + email (phone optional, SMS consent opt-in)
3. POST to `/api/insurance-check/submit`
4. Server calls `calculateCoverage(intake)`:
   - For each of 5 meds in parallel, look up `coverage_index` with cascade: plan-specific → carrier+state → carrier+`_default` → national `coverage_defaults` → null
   - If origin=ACA and `planId` is present, fire live Healthcare.gov call; on success the live row overrides the indexed row
   - Apply modifiers (employer size, BMI, comorbidities, recency)
   - Map probability range + PA flag → 4-bucket label
5. Insert/update `InsuranceCheckLead` (7-day idempotency by `emailHash`)
6. Fire-and-forget webhooks: n8n → Zoho CRM, n8n → Dittofeed (email/SMS retargeting), Meta Pixel + GA4 events
7. Return `{leadId, result}` to the page
8. Page renders 5 medication cards with per-card CTAs

**Why this architecture is the right one:**

- **Pre-indexed reads** = fast page loads, zero per-request external API rate-limit risk, deterministic results
- **Async background workers** = data freshness without blocking customer requests
- **Optional live ACA call** = the "real-time" marketing claim is honest when patient knows their plan
- **PHI encryption at rest** = HIPAA-safer than storing diagnoses + email in plaintext JSONB

---

## 3. What was built — code map

```
src/lib/insurance/
  ├── drug-codes.ts              5 medications + 5 indications + lookup helpers
  ├── routing.ts                 IntakeAnswers type + insurance-origin → pipeline
  ├── modifiers.ts               Employer/BMI/pathway/recency multipliers
  ├── label-mapper.ts            Probability range + PA flag → bucket label
  ├── coverage-index.ts          Read layer with 4-tier cascade
  ├── healthcare-gov-client.ts   CMS Marketplace API client (4s timeout, key-aware)
  └── confidence-engine.ts       Orchestrator (was 895 lines → now 117)

src/lib/leads/
  ├── insurance-check-lead.ts    Encrypted upsertLead + markConvertedToPaid
  └── webhooks-insurance-check.ts Fan-out to Zoho/Dittofeed/Meta via existing fireWebhook

src/lib/crypto/
  └── lead-encryption.ts         AES-256-GCM encrypt/decrypt + SHA-256 hashEmail

src/app/api/insurance-check/
  ├── submit/route.ts            POST: validate → calculate → upsert → webhook → respond
  ├── plans/route.ts             GET: ACA plan-name autocomplete (DB-failure-safe)
  └── healthcare-gov-live/route.ts GET: server-side proxy for live coverage check

src/app/[locale]/insurance-check/
  ├── page.tsx                   Orchestrator (was 1151 → now 94 lines)
  └── components/
      ├── ContactCaptureGate.tsx Name + email + consent checkboxes
      ├── QuestionStep.tsx       Single-question wrapper with progress bar
      ├── IntakeForm.tsx         8/9-step branching form
      ├── BucketBanner.tsx       Top-of-results banner with overall verdict
      ├── MedicationCard.tsx     Per-medication card with per-status CTA
      └── ResultsView.tsx        Page-level results layout

src/lib/workers/
  ├── shared/
  │   ├── worker-runner.ts       Wraps each run with WorkerRun telemetry + Slack alert
  │   └── slack-alert.ts         Posts to SLACK_DATA_PIPELINE_WEBHOOK
  ├── aca-qhp-bulk.ts            CMS MR-PUF → drugs.json crawler (monthly)
  ├── medicare-part-d.ts         CMS monthly Part D ZIP ingestor
  ├── medicaid-state.ts          Curated JSON → coverage_index (5 states)
  ├── medicaid-state-data.json   FL/NY/CA/TX/IL Medicaid published policy
  ├── pbm-baseline.ts            Curated JSON → coverage_index (3 PBMs × employer carriers)
  ├── pbm-baseline-data.json     CVS Caremark / ESI / OptumRx standard formulary status
  ├── federal-military-sync.ts   Curated JSON → coverage_index (TRICARE/FEHB/VA)
  ├── federal-military-data.json TRICARE / BCBS FEP / VA published policy
  └── carrier-scrapers/
      ├── playwright-base.ts     Common base class
      ├── floridablue.ts         FL Blue formulary search scraper
      ├── aetna.ts               Aetna formulary search scraper
      ├── uhc.ts                 UHC formulary search scraper
      ├── cigna.ts               Cigna formulary search scraper
      └── humana.ts              Humana formulary search scraper

scripts/
  ├── run-worker.ts              CLI dispatcher: `npx tsx scripts/run-worker.ts <name>`
  ├── seed-coverage-index.ts     Task 2: legacy v1 JSON → coverage_index (~250 rows)
  ├── seed-foundayo-defaults.ts  Task 3: Foundayo + national fallbacks (~162 rows)
  └── seed-data/
      └── glp1-legacy.json       Re-fetched from origin/main 1e95d01 for the seed

prisma/
  ├── schema.prisma              5 new models (CoverageIndex, CoverageDefault,
  │                              AcaPlanDirectory, InsuranceCheckLead, WorkerRun)
  └── migrations/
      ├── 20260429013135_coverage_index_v2/         Schema base
      ├── 20260429120000_drop_legacy_insurance_probability/  Removes v1
      ├── 20260429140000_coverage_index_partial_unique/      Postgres partial unique
      └── 20260429140100_lead_phi_encryption/                emailHash column

src/app/admin/insurance-check/page.tsx  KPI dashboard (leads/conversions/freshness)
middleware.ts                            A/B placeholder (no-op, ready for v1 vs v2)
render.yaml                              10 cron entries (Render — for ref; Replit uses Scheduler)

Tests (vitest + happy-dom + RTL):
  - drug-codes.test.ts            3 tests
  - routing.test.ts               5 tests
  - modifiers.test.ts             8 tests
  - label-mapper.test.ts          5 tests
  - coverage-index.test.ts        6 tests (mocked Prisma)
  - healthcare-gov-client.test.ts 4 tests (mocked fetch)
  - confidence-engine.test.ts     5 tests (mocked Prisma)
  - lead-encryption.test.ts       4 tests (round-trip, random IV, hash, tamper)
  TOTAL: 40 unit tests, all passing
```

---

## 4. Brand and UX rules (don't break these)

These come from Linda's CLAUDE.md and are **load-bearing for the brand**:

- **Aesthetic:** Ro.co clean editorial on cool off-white. Warm cream/beige is REJECTED.
- **Backgrounds:** page `#FAFAFA`, section `#F2F2F2`, card `#FFFFFF`. Never pure white as page bg.
- **Brand red:** `#ED1B1B` for **CTA only** — never body text, never section bg. Hover `#D01818`. Tint `#FDE7E7`.
- **Text:** primary `#0C0D0F`, muted `#6B6D70`, subtle `#A0A2A5`.
- **Typography:** Inter Tight, weights **400 + 600 only**. Display/heading is `font-normal` (NOT `font-bold`). The most-missed detail.
- **Forbidden palette:** pink `#f5bbc1`, navy `#0e1b4d`, teal `#0ccbc6`, orange `#ef7d03`, all cream/beige.
- **CTA copy:** verb-first, sentence case, with `→`. Never "Book a consultation" (we're async). Never "Buy now" (we're healthcare).
- **No emojis** in shipped copy. Max 1 if absolutely necessary.
- **8th-grade reading level.** Banned jargon: async, queue, ticket, PA (in customer copy — internal docs OK).

If you find a component that violates any of these, fix it before deploy.

---

## 5. The data accuracy story — what's TRUE today vs. what's still PLACEHOLDER

This is the most important section. Linda's biggest concern is **don't tell customers wrong coverage info**.

### Right now, with no DB and no workers run

**Every result returns `not_on_formulary` for every medication.** The tool will be wrong for 100% of users. Do NOT promote this to production until at minimum Steps 1, 2, 5 of the runbook complete.

### After Steps 1 + 2 (apply migrations + seed scripts) — minimum viable accuracy

- `coverage_index` populated with ~250 rows from Body Good's curated v1 data
- `coverage_defaults` populated with 8 national-fallback rows
- Foundayo defaults to `not_on_formulary` everywhere with the LillyDirect savings-card CTA active
- **Real data, but only as fresh as Linda's last manual update.** Date-stamped April 2026.

### After Step 3 (ACA QHP bulk worker, requires `HEALTHCARE_GOV_API_KEY`)

- ACA marketplace patients get **truthful, plan-specific coverage** from the federal CMS API
- `aca_plan_directory` populated with thousands of HIOS plan IDs and marketing names → autocomplete works
- This is the **real-time honesty win** the architecture promised. ACA results display "Real-time" data freshness chip.

### After Step 4 (Medicare Part D worker, requires `CMS_PARTD_URL`)

- Medicare Part D patients get truthful CMS-source data per plan
- Includes indication-based coverage (Wegovy under CV indication, Zepbound under OSA)
- Freshness chip: "Fresh" (<30d) since file is monthly

### After Step 5 (Medicaid + PBM + Federal/Military workers — no API keys needed)

- Medicaid (FL, NY, CA, TX, IL) gets curated probability ranges based on published state PDLs as of April 2026
- Employer plans (Cigna, Aetna, UHC, Humana, BCBS FL) get curated PBM-baseline ranges
- TRICARE / BCBS FEP / VA get curated ranges
- **These are ACCURATE based on published policy at write time, but not LIVE.** The data is in version-controlled JSON in the repo. Linda's clinical team should refresh these JSON files quarterly.

### After Step 6 (carrier scrapers — EXPECT FAILURES)

- Targeted carriers get fine-grained per-employer-plan accuracy by scraping their formulary search tools
- **CSS selectors in the scrapers are best-guess.** They have NOT been validated against production carrier sites. Realistic outcome: 0–2 of 5 succeed first run.
- Tuning workflow: scraper fails → Slack alert fires → you (Agent 4) open the carrier's page in a real browser, screenshot or copy the actual DOM, update the selectors, re-run.

### Per-customer protection

Three layers protect customers from misleading data:

1. **Disclaimer band on every result page:** *"This is a probability estimate, not a coverage guarantee."*
2. **Freshness chip on every medication card:** `Real-time` / `Fresh` / `Recent` / `Estimated`. Customers see when data is old.
3. **The $25 paid eligibility check** is the legally-binding answer. Free tool is the funnel; the paid step is where Rhea/Jena confirm with the actual insurance company before any clinical work.

---

## 6. What still needs to happen — your task list, in order

### Pre-deploy (must complete before any production traffic)

- [ ] **Step 1 — Apply 4 v2 migrations.** `npx prisma migrate deploy`. If historical SQLite migrations conflict with the postgresql lockfile, run `npx prisma migrate resolve --applied <name>` for each old one to mark them applied without re-running.
- [ ] **Step 2 — Set 2 secrets in Replit:** `INSURANCE_LEAD_ENCRYPTION_KEY` (32-byte base64 — generate once and treat as immutable, rotating strands existing ciphertext) and `DATABASE_URL` (auto-injected when Replit Postgres is enabled).
- [ ] **Step 3 — Run both seed scripts.** `npx tsx scripts/seed-coverage-index.ts` then `npx tsx scripts/seed-foundayo-defaults.ts`. Expected output: ~250 + ~162 rows.
- [ ] **Step 4 — Run the 3 curated workers** (no API keys needed): `medicaid-state`, `pbm-baseline`, `federal-military-sync`.
- [ ] **Step 5 — Smoke-test in browser** with the 3 fixture patients in the runbook. Buckets must vary across carriers/diagnoses.
- [ ] **Step 6 — Verify lead capture** — submit one test lead, confirm `InsuranceCheckLead.email` is ciphertext (NOT plaintext), `emailHash` is 64-char hex, `intakeJson` is `{ ct: <base64> }`.

### Day 1 if Healthcare.gov API key is available

- [ ] **Step 7 — Set `HEALTHCARE_GOV_API_KEY` secret** (Linda will paste it when CMS responds).
- [ ] **Step 8 — Run `aca-qhp-bulk` worker.** 5–15 min first run. Populates ACA marketplace plans + plan directory.
- [ ] **Step 9 — If `CMS_PARTD_URL` set, run `medicare-part-d` worker.** Populates Medicare Part D plan-specific rows.

### Day 1+

- [ ] **Step 10 — Schedule cron jobs** in Replit Scheduler (Tools → Scheduler) per the cadences in `INSURANCE_CHECK_V2_REPLIT_SETUP.md` Step 7.
- [ ] **Step 11 — Run carrier scrapers and tune selectors.** Each scraper that fails gets a `worker_run` row with `status='error'` and a Slack alert. Workflow: open the carrier's drug-search page in a real browser, inspect DOM, update selectors in `src/lib/workers/carrier-scrapers/<carrier>.ts`, commit, re-run. **Expect 0–2 of 5 to work first run.**

### Cross-repo handoff (NOT in this repo)

- [ ] **Wire Stripe webhook in `bodygood-pa-module`.** When `checkout.session.completed` fires for the $25 eligibility product, the metadata will carry `insurance_check_lead_id` (Linda must update the Stripe checkout creation to forward `lead_id` from query params into Stripe metadata). The PA module's webhook then calls `markConvertedToPaid(leadId)` exported from `src/lib/leads/insurance-check-lead.ts` in this repo. This requires either making it a shared package or copying the function. **Out of scope for this branch — it's Linda's call which way to wire it.**

### Known issues you might hit

1. **`prisma migrate deploy` rejects with "migration_lock.toml provider mismatch"** — the lockfile is now `postgresql`, but if Replit's Prisma sees historical SQLite-flavored migrations as unapplied, it may refuse. Fix: `npx prisma migrate resolve --applied <historical_migration_name>` for each pre-v2 migration. They were applied via `db push` originally on the dev SQLite, so marking them applied on the new Postgres is correct.

2. **`coverage_index_no_plan` partial unique** — the migration creates a Postgres partial unique index `WHERE planId IS NULL`. Verify with psql `\d "CoverageIndex"` — you should see `CoverageIndex_no_plan_partial_uniq` with predicate. If missing, the unique-constraint collision returns and ACA QHP bulk fails on the second plan.

3. **Foundayo cards show "Get Foundayo for $25/mo with Lilly's savings card →"** — that's correct. It's the right CTA for not-on-formulary Foundayo. The Lilly URL `https://www.lilly.com/foundayo` may need verification (Foundayo is brand-new; Lilly's marketing site may not have a stable URL yet).

4. **Carrier scraper Playwright requires Chromium** — Replit Scheduler needs `npx playwright install chromium` in the build phase. Render's `render.yaml` shows the pattern; adapt to Replit Scheduler's build command field.

5. **The `searchPlansForAutocomplete` returns up to 8 plans** — if Replit Postgres is slow, you may want to debounce the `IntakeForm` autocomplete fetch (currently fires on every keystroke after 2 chars).

6. **PHI encryption key rotation policy** — `INSURANCE_LEAD_ENCRYPTION_KEY` cannot be rotated without a re-encryption migration. If Linda ever needs to rotate, build a script that decrypts every row with the old key and re-encrypts with the new key. Don't accept "just rotate the env var" as a one-line change.

---

## 7. Goals + objectives

**Primary goal:** Replace the inaccurate v1 tool with a system that gives customers truthful, plan-specific GLP-1 coverage probability — backed by federal data sources for ACA + Medicare, curated published policy for Medicaid + PBM + Federal, and live carrier scraping for the largest commercial carriers.

**Top KPIs to track from day 1:**

1. **Quiz start → completion rate** (target ≥45%) — measured via `ProbabilityQuizStarted` + `ProbabilityQuizCompleted` Meta/GA4 events
2. **Quiz completion → $25 paid conversion** (target ≥8% on hot bucket — `high_probability` + `coverage_with_pa`) — joined from Stripe webhook → `markConvertedToPaid`
3. **Quiz completion → self-pay conversion** (target ≥4% on warm/cold buckets — `unlikely` + `not_on_formulary`)
4. **Foundayo CTA click-through rate** — signal for Foundayo demand even before formulary inclusion
5. **`coverage_index` freshness** (target ≥85% of rows refreshed within last 30 days) — visible on `/admin/insurance-check`

**Secondary goals:**

- **Lead pipeline strength** — every quiz submission produces a high-intent lead with full clinical + insurance + intake context. Webhook fan-out feeds Zoho CRM, Dittofeed (email + SMS retargeting where consented), and Meta Pixel for paid-ad lookalikes after 30 days.
- **Worker resilience** — every worker reports run-status to `WorkerRun` table. Failures alert Slack but don't cascade. Stale data continues to serve until a fresh run repairs it.
- **HIPAA-adjacent posture** — diagnoses + email + IP are stored as ciphertext at rest. Linda has separately confirmed Replit Postgres meets her at-rest encryption needs.

**Non-goals (don't chase these without checking with Linda first):**

- **Don't add PHI to the Healthcare.gov request payload.** The federal API only takes year + RxCUI + planId. Patient identity stays out.
- **Don't bulk-scrape manufacturer coverage checkers** (Novo Care for Wegovy, LillyDirect for Zepbound/Foundayo). Their TOS forbids automation. Reserve these for the human-touched $25 paid step.
- **Don't add new medications** without updating: `MEDICATIONS` array in `src/lib/insurance/drug-codes.ts`, `ALL_MEDICATIONS` in `src/lib/insurance/routing.ts`, the order in `MedicationCard` rendering, and the canonical iteration in `confidence-engine.ts`. Adding a med is a 4-touch change.
- **Don't change the result label wording** without checking with Linda. Current set is `Not on Formulary` / `Unlikely` / `Coverage with PA` / `High Probability`. She specifically rejected "Approved" because of chargeback risk.

---

## 8. Files Linda owns vs. files you can touch freely

**Linda owns (don't change without explicit ask):**

- `src/lib/workers/medicaid-state-data.json` — clinical-policy-curated by Linda's team
- `src/lib/workers/pbm-baseline-data.json` — clinical-policy-curated
- `src/lib/workers/federal-military-data.json` — clinical-policy-curated
- The 4 disclaimer-text strings in `BucketBanner.tsx` and `ResultsView.tsx`
- The CTA copy in `MedicationCard.tsx` (verb-first sentence-case rule)
- `prisma/schema.prisma` — Linda has additional tables for products, orders, blog, etc. that this branch did NOT touch
- `INSURANCE_LEAD_ENCRYPTION_KEY` — the key, once set, is immutable

**You can touch freely:**

- Carrier scraper selectors (`src/lib/workers/carrier-scrapers/*.ts`) — these are expected to need tuning
- Worker schedule configuration in Replit Scheduler — adjust cadence based on traffic
- The admin dashboard layout (`src/app/admin/insurance-check/page.tsx`) — visual polish welcome
- `console.warn`/`console.error` log lines — add more if useful

---

## 9. References + further reading

- **Spec:** `docs/superpowers/specs/2026-04-28-insurance-probability-checker-v2-design.md` — what the team decided in brainstorming
- **Plan:** `docs/superpowers/plans/2026-04-28-insurance-probability-checker-v2-plan.md` — the 36-task implementation plan
- **Architecture context:** `GLP1-Data-Architecture-Scraping-Plan.md` — Linda's full data-source architecture document (the why behind the 8 sources)
- **Runbook:** `INSURANCE_CHECK_V2_REPLIT_SETUP.md` — your day-1 task list
- **PR (when opened):** https://github.com/joinbodygood/replitbuildout1/pull/new/feat/insurance-check-v2

---

## 10. Success criteria — when this hands off cleanly back to Linda

You're done when:

1. ✅ All 4 v2 migrations applied to Replit Postgres
2. ✅ `coverage_index` has ≥250 rows (post-seed) and ≥1,000 rows (post-ACA worker, if API key available)
3. ✅ `coverage_defaults` has 8 rows
4. ✅ Three test patients (ACA + T2D, FL Medicaid, Cigna employer) produce sensibly varied results in the browser
5. ✅ One test lead row written shows ciphertext for email/intakeJson/resultJson and 64-char emailHash
6. ✅ Replit Scheduler has 5–10 worker tasks registered (skip carrier scrapers if their selectors haven't been tuned)
7. ✅ The admin dashboard at `/admin/insurance-check` loads without errors
8. ✅ The 4 known issues in section 6 are either resolved or documented as "tracked, post-launch"

When all 8 are green, post a message to Linda: *"Insurance Check v2 is live in staging. Ready for your manual QA + production promotion."*

If you hit a blocker that requires Linda's call (Healthcare.gov key still pending, carrier scraper selectors keep failing, encryption key strategy unclear), stop and ask. Do **not** ship inaccurate data to production. Linda's biggest concern from day 1 of this project has been: **don't tell customers wrong coverage info.**

That's the bar. Take it from here.

— Claude Opus 4.7
