# PA Module Handoff — For Ayush

**Date:** 2026-04-03
**Branch:** `feat/pa-module`
**Status:** Backend complete. Frontend stubs only — you build the UI.

---

## Quick Start

```bash
git checkout feat/pa-module
npm install
cp .env.example .env          # Fill in your values
npx prisma migrate dev --name add_pa_module   # Creates PA tables
npx prisma generate           # Regenerate client
npm run dev                   # Start on port 5000
```

Visit `/admin/prior-auth` to see the Work Queue stub.

---

## What's Built (DO NOT MODIFY)

### Service Layer — `src/lib/pa/`

| File | Purpose |
|------|---------|
| `types.ts` | All TypeScript interfaces — import these in your frontend |
| `constants.ts` | ICD-10 codes, treatments, denial reasons, stages, drugs, state DOI data, round config |
| `case-service.ts` | Case CRUD, stage transitions, assignment, notes |
| `clinical-service.ts` | Clinical data upsert, HOMA-IR calc, auto-detect diagnoses from labs |
| `pa-engine.ts` | Scorched Earth letter generation (5 rounds), denial rebuttals, pathway analysis |
| `eligibility-service.ts` | Wraps Stedi + confidence engine → creates PA cases |
| `assignment-service.ts` | Auto-assign (fewest active cases) and manual reassign |
| `webhook-service.ts` | Fire-and-forget outbound webhooks on PA events |
| `payment-triggers.ts` | PayPal capture → auto case creation/stage advancement |

### API Routes — `src/app/api/pa/`

All routes require admin auth (session cookie) except case-status.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/cases` | GET | List cases. Params: `stage`, `assignedTo`, `search`, `page`, `limit` |
| `/api/pa/cases` | POST | Create case. Body: `CreateCaseInput` from types.ts |
| `/api/pa/cases/[id]` | GET | Full case with submissions, clinical data, notes, assignedTo |
| `/api/pa/cases/[id]` | PATCH | Update case. Send `{ stage }` for stage change, `{ assignedToId }` for reassign, or any `UpdateCaseInput` fields |
| `/api/pa/cases/[id]/clinical` | PUT | Upsert clinical data. Send `{ autoDetect: true }` to auto-detect diagnoses from labs |
| `/api/pa/cases/[id]/submissions` | GET | List all PA submissions for a case |
| `/api/pa/cases/[id]/submissions` | POST | Create single submission. Body: `{ drug, round, indication, letterText? }` |
| `/api/pa/cases/[id]/submissions/[subId]` | PATCH | Update submission status, log denial. Body: `{ status, denialReason?, denialRef?, denialDate?, denialText? }` |
| `/api/pa/cases/[id]/submissions/[subId]/letter` | POST | Regenerate letter with current case data |
| `/api/pa/cases/[id]/launch-round` | POST | Launch round 1-5. Body: `{ round: number }`. Creates all submissions with generated letters |
| `/api/pa/cases/[id]/notes` | GET | List notes (paginated). Params: `page`, `limit` |
| `/api/pa/cases/[id]/notes` | POST | Add note. Body: `{ content, type? }` |
| `/api/pa/eligibility-check` | POST | Run eligibility check + create case |
| `/api/pa/stats` | GET | Dashboard stats: byStage, approvalRates, totalCases, teamWorkload, avgProcessingDays |
| `/api/pa/case-status/[token]` | GET | **PUBLIC (no auth)** — patient status by token |

### Database Models

4 new models in `prisma/schema.prisma`:
- `InsuranceCase` — core case record
- `PASubmission` — per-drug PA submission (up to 8 per case across 5 rounds)
- `PatientClinicalData` — one-to-one labs/diagnoses per case
- `CaseNote` — audit trail with type and metadata

**Prisma access note:** The PASubmission model is accessed as `prisma.pASubmission` (Prisma lowercases the first char).

### Sidebar & RBAC

- Two nav items added to `AdminSidebar.tsx`: "PA Work Queue" and "All PA Cases"
- `prior_auth` permission added to `clinical_admin` and `support` roles

---

## What You Build (Frontend)

### 3 Admin Pages

All under `src/app/admin/(dashboard)/prior-auth/`. Stubs exist — replace them with real components.

**1. Work Queue** (`page.tsx`) — Jena & Rhea's landing page
- Grouped sections: Needs Action → Waiting on Response → Recently Completed
- Stage filter pills with counts (from `/api/pa/stats`)
- Each row: patient name, carrier, state, stage badge, per-drug status dots, assigned to, time since update
- Default filter: "My Cases" (use admin user ID from `/api/admin/auth/me`)
- Click row → `/admin/prior-auth/cases/[id]`

**2. Case List** (`cases/page.tsx`) — filterable table of all cases
- Search, stage filter, assignee filter, pagination
- Click row → case detail

**3. Case Detail** (`cases/[id]/page.tsx`) — the main workspace

Two-column layout:

Left panel:
- Patient snapshot (name, DOB, state, carrier, member ID, plan)
- Insurance card thumbnails (click to expand)
- Clinical data form (editable labs: BMI, A1C, glucose, insulin, triglycerides, HDL)
- "Auto-detect Diagnoses" button (PUT `/clinical` with `autoDetect: true`)
- Diagnosis checkboxes (18 ICD-10 codes from `constants.ts`)
- Prior treatment checkboxes (12 items from `constants.ts`)

Right panel:
- Stage tracker (vertical stepper showing all stages, current highlighted)
- Drug status matrix (4 drugs x rounds, showing status per cell)
- "Launch Round N" button (POST `/launch-round`)
- Current round submissions as expandable cards:
  - View letter text
  - Edit letter (textarea)
  - "Mark Submitted" / "Mark Denied" / "Mark Approved" buttons
  - "Log Denial" form (reason dropdown, ref #, date, paste denial text)
  - "Regenerate Letter" button
- Case notes timeline (newest first, add note form at top)

### Visual Reference

Open `docs/pa-module-mockup.html` in a browser — it's a fully styled interactive mockup showing all three pages with the Body Good design system.

### Design System (match existing admin)

- Fonts: Poppins (headings), Manrope (body)
- Colors: `#ED1B1B` (red), `#0C0D0F` (dark), `#55575A` (gray text), `#E5E5E5` (borders), `#FDE7E7` (pink active bg), `#F9F9F9` (page bg)
- Cards: `rounded-xl`, `border border-[#E5E5E5]`, white bg
- Buttons: `rounded-xl` or `rounded-full`, Poppins font
- Icons: lucide-react (already imported)
- Charts: recharts (already in dependencies)

---

## Key Types to Import

```typescript
import type {
  CaseWithRelations,
  InsuranceCaseSummary,
  CaseStats,
  PublicCaseStatus,
  PASubmission,
  PatientClinicalData,
  CaseNote,
} from "@/lib/pa/types";

import {
  DIAGNOSES,
  TREATMENTS,
  STAGES,
  STAGE_LABELS,
  DRUGS,
  DRUG_DISPLAY,
  DENIAL_REASONS,
  ROUND_CONFIG,
} from "@/lib/pa/constants";
```

---

## Environment Variables

Copy `.env.example` to `.env`. The PA module needs:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection (already set) |
| `STEDI_API_KEY` | For eligibility | Stedi 270/271 eligibility API |
| `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | For card uploads | Insurance card image storage |
| `PA_STATUS_WEBHOOK_URL` | Optional | Outbound webhook for PA events |

---

## Zoho Migration

The migration script is at `scripts/migrate-zoho.ts`. To use it:

1. Export Zoho CRM `Eligibility_Check_Module` → CSV → convert to JSON
2. Export Zoho Creator `Prior_Authorization_Module` → CSV → convert to JSON
3. Place at `scripts/data/zoho-crm-eligibility.json` and `scripts/data/zoho-creator-pa.json`
4. Run: `npx tsx scripts/migrate-zoho.ts`

**Do NOT export through Claude Code — this is PHI. Handle in a HIPAA-safe environment.**

---

## PA → Refill System Handoff (IMPORTANT)

The PA module and refill system are **two separate services with a clean handoff point.**

### Ownership Boundaries

| Stage | Owner | System |
|-------|-------|--------|
| Probability → Eligibility → PA Processing (Rounds 1-5) | **Jena & Rhea** | PA Module (this repo) |
| PA Approved → Customer pays $75/mo → Active Member | **Automatic** | PA payment trigger (`INS-ONGOING` → `active_management`) |
| Refill reminders, check-ins, subscription management | **Kira (Customer Support)** | Refill System (`bodygood-refill-api` repo) |

### The Handoff Moment

When a PA is approved:
1. Jena/Rhea mark the submission as `approved` in the PA admin
2. Case advances to `pending_activation` → customer pays $85 activation
3. Customer pays $75/mo (`INS-ONGOING`) → case moves to `active_management`
4. **Jena & Rhea are done.** The case stays at `active_management`. No more PA work.
5. ~1-2 days later: customer picks up medication at pharmacy
6. **3 weeks after approval:** Refill system sends first reminder (email + SMS)
7. From here, **Kira owns the relationship** — refill check-ins, payment issues, subscription changes

### What Happens on Denial (All 5 Rounds Exhausted)

1. Case moves to `closed_exhausted`
2. Customer is offered the **self-pay option** (cash-pay program, no insurance)
3. If they choose self-pay, they enter the normal self-pay product flow — separate from the PA module entirely
4. If they leave, case stays `closed_exhausted` with full documentation of every attempt

### Refill System Location

The refill backend is a **separate Express.js microservice**:
- **Repo:** `joinbodygood/bodygood-refill-api` (GitHub)
- **Plan:** `docs/superpowers/plans/2026-04-03-refill-backend-microservices.md` (on desktop, not in this repo)
- **Stack:** Express.js, TypeScript, Prisma, Gmail API, Twilio, PayPal
- **Currently lives in:** Zoho Creator (being replaced by the new build)

### Integration Point (for later)

The PA module fires a `pa.approved` webhook when a drug is approved. The refill system should listen for this to:
- Know when to start the 3-week refill countdown
- Link the patient to their approved medication
- Set up the first RefillCycle

This webhook integration is **not built yet** — it's the bridge Ayush will connect once both systems are running.

The PA module does NOT need to know about refills. The refill system does NOT need to know about PA rounds. They connect through:
1. The `pa.approved` webhook event
2. The `INS-ONGOING` PayPal subscription (shared payment infrastructure)
3. Patient email as the shared identifier

---

## Superseded Documents

These files in `attached_assets/` are **OUTDATED** — do not follow them:
- `AYUSH-HANDOFF-README_(2)_1774843973272.md` — references Shopify/Cloudflare Worker/Zoho Creator architecture
- `cloudflare-worker-coverage-check_(2)_1774843973270.js` — replaced by `eligibility-service.ts`

The authoritative spec is: `docs/superpowers/specs/2026-04-03-pa-module-design.md`
