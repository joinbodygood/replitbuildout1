# Insurance Check v2 — Replit Setup Runbook

This branch (`feat/insurance-check-v2`) ships a complete rebuild of the GLP-1 insurance probability checker. After merge, the tool's accuracy depends on the steps below. Hand this file to **Replit Agent 4** along with the prompt: *"Follow INSURANCE_CHECK_V2_REPLIT_SETUP.md end-to-end."*

## Prerequisites Linda must provide

1. **Replit managed Postgres database attached to this repl** (Replit → Database tab → enable Postgres). Replit auto-injects `DATABASE_URL`.
2. **`HEALTHCARE_GOV_API_KEY`** — request at https://developer.cms.gov/marketplace-api/key-request.html (5-min CMS form, key arrives by email). Set in Replit Secrets.
3. **`INSURANCE_LEAD_ENCRYPTION_KEY`** — 32-byte base64. Generate once and treat as immutable (rotating strands existing ciphertext):
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Set in Replit Secrets.
4. **Optional but recommended:** `SLACK_DATA_PIPELINE_WEBHOOK` for worker error alerts. `N8N_WEBHOOK_URL` for lead capture fan-out (existing).

## Step 1 — Apply migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

Should apply 4 v2 migrations in order:
- `20260429013135_coverage_index_v2` (5 tables, 4 enums)
- `20260429120000_drop_legacy_insurance_probability` (drops legacy v1 model)
- `20260429140000_coverage_index_partial_unique` (Postgres partial-unique fix)
- `20260429140100_lead_phi_encryption` (adds emailHash column)

If `migrate deploy` fails because historical SQLite migrations don't match Postgres, run `npx prisma migrate resolve --applied <name>` for each historical migration to mark them applied without running, then retry deploy. The `migration_lock.toml` is already set to `postgresql`.

## Step 2 — Seed coverage data (Tasks 2 + 3)

```bash
npx tsx scripts/seed-coverage-index.ts
npx tsx scripts/seed-foundayo-defaults.ts
```

Expected output:
- `Seeded coverage_index from legacy JSON: ~250 total`
- `Seeded ~154 Foundayo rows + 8 coverage_defaults`

After this step, the free tool returns sensible probability ranges based on Body Good's curated v1 data + national fallbacks. Foundayo defaults to `not_on_formulary` everywhere (correct — it's brand new).

## Step 3 — ACA real-time + bulk (Task 21)

Once `HEALTHCARE_GOV_API_KEY` is set:

```bash
npx tsx scripts/run-worker.ts aca-qhp-bulk
```

Takes 5–15 minutes the first run. Pulls every ACA marketplace issuer's `drugs.json`, filters for our 5 medications by RxCUI, and writes plan-specific rows to `coverage_index` plus `aca_plan_directory` for the autocomplete. After this, ACA marketplace patients get **truthful, plan-specific** coverage from the federal CMS API.

## Step 4 — Medicare Part D (Task 22)

Set `CMS_PARTD_URL` in Replit Secrets to the current monthly Part D ZIP from https://data.cms.gov/dataset/monthly-prescription-drug-plan-formulary (rotates monthly). Then:

```bash
npx tsx scripts/run-worker.ts medicare-part-d
```

After this, Medicare Part D patients get truthful CMS-source data per plan.

## Step 5 — Curated workers (Tasks 23 + 24 + 25)

These don't need any external API — the data is in the repo as version-controlled JSON.

```bash
npx tsx scripts/run-worker.ts medicaid-state
npx tsx scripts/run-worker.ts pbm-baseline
npx tsx scripts/run-worker.ts federal-military-sync
```

After this, Medicaid (5 states), PBM-baseline employer plans, and TRICARE/FEHB/VA patients get curated probability ranges based on published policy as of April 2026.

## Step 6 — Carrier scrapers (Tasks 27–31) — EXPECT FAILURES

```bash
npx tsx scripts/run-worker.ts carrier-floridablue
npx tsx scripts/run-worker.ts carrier-aetna
npx tsx scripts/run-worker.ts carrier-uhc
npx tsx scripts/run-worker.ts carrier-cigna
npx tsx scripts/run-worker.ts carrier-humana
```

**Warning:** the Playwright CSS selectors in each scraper (`src/lib/workers/carrier-scrapers/*.ts`) are best-guess — they have NOT been validated against the production carrier sites. Realistic outcome: 0–2 of 5 succeed first run. Each failure surfaces in Slack (if webhook set) and a `WorkerRun` row with status `error`.

For each failing scraper:
1. Open the corresponding carrier's drug-search URL in a real browser
2. Inspect the actual DOM — note the input selector (search box), result selector (drug card), tier selector, PA flag selector
3. Update the selectors in the scraper file
4. Re-run

## Step 7 — Cron schedules

`render.yaml` is in the repo with 10 cron entries. On Replit, cron jobs are configured per-repl in the Tools → Scheduler tab (not via render.yaml). Replit Agent 4 should:

1. For each worker, set up a Replit scheduled task with the cadence from `render.yaml`:
   - aca-qhp-bulk: monthly, 1st @ 03:00 UTC
   - medicare-part-d: monthly, 25th @ 04:00 UTC
   - medicaid-state: quarterly (Jan/Apr/Jul/Oct, 1st @ 05:00 UTC)
   - pbm-baseline: twice yearly (Jan/Jul, 1st @ 06:00 UTC)
   - federal-military-sync: quarterly @ 06:00 UTC
   - carrier-* scrapers: monthly, 5th–9th @ 07:00 UTC

2. Each scheduled task command: `npx tsx scripts/run-worker.ts <worker_name>`

## Step 8 — Verify the customer-facing tool

Open `https://<repl-url>/en/insurance-check` and walk through with three test patients:

| Patient | Origin | Carrier | Diagnoses | Expected bucket |
|---|---|---|---|---|
| ACA + T2D | ACA Marketplace | (any plan via autocomplete) | T2D | `coverage_with_pa` for Wegovy/Zepbound, `high_probability` for Ozempic/Mounjaro |
| Florida Medicaid | Medicaid | FL Medicaid | None | `not_on_formulary` for Wegovy/Zepbound, `coverage_with_pa` for Ozempic/Mounjaro |
| Cigna employer | Employer | Cigna | None | `coverage_with_pa` for most |

If buckets match expectations, the wiring is correct.

## Step 9 — Verify lead capture

After a test submission, confirm a row exists in `InsuranceCheckLead` with:
- `email` = ciphertext (NOT plaintext)
- `emailHash` = 64-char hex
- `intakeJson.ct` and `resultJson.ct` = base64 ciphertext blobs
- `resultBucket` matches the test patient's expected bucket

## Pre-deploy gates (do NOT promote to production until)

- [ ] All 4 migrations applied without errors
- [ ] `coverage_index` has ≥ 250 rows
- [ ] `coverage_defaults` has 8 rows
- [ ] `aca_plan_directory` has ≥ 1,000 rows (after Step 3)
- [ ] `HEALTHCARE_GOV_API_KEY` resolves (test: `curl "https://marketplace.api.healthcare.gov/api/v1/drugs/search?q=wegovy&apikey=$HEALTHCARE_GOV_API_KEY"` returns JSON)
- [ ] Three test patients above produce sensible result variation
- [ ] First lead row written shows encrypted email/intakeJson/resultJson
- [ ] At least 2 of 5 carrier scrapers succeed (or selectors documented as failing in `worker_run` table for a follow-up tuning pass)

## What's safe to skip on day 1 vs. fix later

**Safe to skip day 1:** carrier scrapers (Step 6). Tool serves curated baseline data from PBM + Medicaid + Federal workers; carrier scrapers add fine-grained per-employer detail but are not load-bearing for the customer-facing accuracy claim.

**Must run day 1:** Steps 1, 2, 5. After those, the tool has real, sensible data for ~90% of US insurance scenarios.

**Should run day 1 if API key arrived:** Steps 3 + 4. These give ACA + Medicare patients real-time federal-source data instead of estimates.

## Reference files

- Spec: `docs/superpowers/specs/2026-04-28-insurance-probability-checker-v2-design.md`
- Plan: `docs/superpowers/plans/2026-04-28-insurance-probability-checker-v2-plan.md`
- Architecture context: `GLP1-Data-Architecture-Scraping-Plan.md`
