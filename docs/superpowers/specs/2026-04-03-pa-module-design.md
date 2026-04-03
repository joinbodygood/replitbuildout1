# PA Module Design Spec — Body Good Studio

**Date:** 2026-04-03
**Status:** Approved — Ready for Implementation
**Authors:** Dr. Linda Moleon + Claude (Architecture)
**For:** Ayush (Development) — backend integration into Replit buildout
**Stack:** Next.js 16 + TypeScript + Prisma 5 + PostgreSQL

---

## 1. Overview

The PA Module is the operational backbone of Body Good Studio's insurance navigation program. It replaces 6 disconnected Zoho modules (CRM Eligibility_Check_Module + Creator Prior_Authorization_Module + 4 manual processes) with a single integrated system inside the Replit admin dashboard.

**Architecture:** Hybrid microservice — self-contained module within the existing Next.js app. All PA logic lives in `src/lib/pa/` as importable TypeScript services. API routes at `/api/pa/*` are thin wrappers. Ayush can extract the module cleanly for his rebuild.

**Primary users:** Jena & Rhea (PA team) — process all 5 stages daily.

**Revenue model:**
| SKU | Price | Trigger |
|-----|-------|---------|
| INS-ELIG | $25 one-time | Customer opts in after >65% probability score |
| INS-PA | $50 one-time | Team confirms eligibility, customer pays for PA processing + consultation |
| INS-APPROVE | $85 one-time | PA approved, activation fee |
| INS-ONGOING | $75/month | Ongoing insurance management membership |

---

## 2. The 5-Stage Pipeline

| Stage | Trigger | What Happens | Status Values |
|-------|---------|--------------|---------------|
| **1. Probability Check** | Customer completes free quiz | Client-side probability engine scores coverage odds. If >65%, customer sees option to buy $25 eligibility check | `probability` → qualifiedAt set or stage → `closed_ineligible` |
| **2. Eligibility Check** | Customer pays $25 (INS-ELIG) | 5-database search + Stedi API benefit confirmation. Results land in Jena/Rhea's queue for review | `eligibility_review` → `pending_pa_purchase` / `closed_ineligible` |
| **3. PA Processing** | Team confirms eligibility, customer pays $50 (INS-PA) | Scorched Earth engine activates. Up to 5 rounds of PA submissions, pivots, appeals, external review, state complaint | `pa_processing` (paRound 1→5) → `closed_approved` / `closed_exhausted` |
| **4. Activation** | PA approved by insurer | Customer pays $85 (INS-APPROVE), team sets up insurance billing, pharmacy routing | `pending_activation` → `active_management` |
| **5. Ongoing Management** | Customer on $75/mo (INS-ONGOING) membership | Monthly check-ins, refill management, re-auth if needed | `active_management` (ongoing) / `closed_cancelled` |

### Scorched Earth Rounds (Stage 3 Detail)

| Round | Drugs | Indication | Strategy |
|-------|-------|------------|----------|
| 1 | Wegovy + Zepbound | Weight/CV/OSA | Standard PA, simultaneous submission |
| 2 | Ozempic + Mounjaro | Metabolic/endocrine | NEW PAs (not appeals), different drug + indication. Lead with prediabetes + metabolic syndrome |
| 3 | All 4 drugs | Appeals | Formal appeals of all denials, each demands peer-to-peer review |
| 4 | Best candidate | External review | Independent review under ACA Section 2719 / 45 CFR 147.136. Insurer must accept decision |
| 5 | N/A | State DOI complaint | Regulatory complaint filed by patient, prepared by Body Good |

---

## 3. Database Schema

New Prisma models added to `prisma/schema.prisma`. All existing models remain unchanged.

### InsuranceCase

```prisma
model InsuranceCase {
  id                    String    @id @default(cuid())
  
  // Patient info (denormalized for queue display, canonical source is Order/QuizLead)
  patientEmail          String
  patientName           String
  patientDob            String?
  patientPhone          String?
  patientState          String    // 2-letter state code
  
  // Insurance info
  carrierId             String?
  carrierName           String?
  memberId              String?
  groupNumber           String?
  planName              String?
  planType              String?   // commercial, aca, employer_erisa, medicare, medicaid, tricare
  subscriberName        String?
  subscriberDob         String?
  subscriberRelation    String?   // self, spouse, child, other
  
  // Document URLs (S3)
  insuranceCardFrontUrl String?
  insuranceCardBackUrl  String?
  idCardFrontUrl        String?
  idCardBackUrl         String?
  
  // Probability (from free check)
  probabilityScore      Float?    // 0-100
  probabilityBucket     String?   // green, yellow, red
  qualifiedAt           DateTime?
  
  // Eligibility (from $25 check)
  eligibilityData       Json?     // Full Stedi + 5-source results
  eligibilityCheckedAt  DateTime?
  eligibilityConfirmedAt DateTime?
  eligibilityConfirmedBy String?  // admin user ID
  
  // Stage tracking
  stage                 String    @default("probability") 
  // Values: probability, eligibility_review, pending_pa_purchase, pa_processing, 
  //         pending_activation, active_management, closed_approved, closed_exhausted, 
  //         closed_ineligible, closed_cancelled
  
  paRound               Int       @default(0) // Current round (0 = not started, 1-5)
  
  // Assignment
  assignedToId          String?
  assignedTo            AdminUser? @relation(fields: [assignedToId], references: [id])
  
  // Linking
  orderId               String?   // Link to Order that triggered this case
  quizLeadId            String?   // Link to QuizLead if originated from quiz
  zohoContactId         String?   // Legacy Zoho link (for migration)
  zohoCrmRecordId       String?   // Legacy Zoho CRM record ID
  
  // Timestamps
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  approvedAt            DateTime?
  closedAt              DateTime?
  
  // Public status token (for patient-facing status page)
  statusToken           String    @unique @default(cuid())
  
  // Relations
  submissions           PASubmission[]
  clinicalData          PatientClinicalData?
  notes                 CaseNote[]
  
  @@index([patientEmail])
  @@index([stage])
  @@index([assignedToId])
  @@index([statusToken])
}
```

### PASubmission

```prisma
model PASubmission {
  id                String    @id @default(cuid())
  caseId            String
  case              InsuranceCase @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  // What was submitted
  drug              String    // wegovy, zepbound, ozempic, mounjaro
  round             Int       // 1-5
  indication        String    // weight_cv, weight_osa, metabolic, appeal, external_review, state_complaint
  
  // Status
  status            String    @default("drafted")
  // Values: drafted, submitted, pending_response, approved, denied, 
  //         appeal_filed, external_review, state_complaint
  
  // Generated letter
  letterText        String?   @db.Text
  letterVersion     Int       @default(1)
  
  // Denial tracking (filled when denied)
  denialReason      String?   // Non-Formulary, Not Medically Necessary, Step Therapy Required, etc.
  denialRef         String?   // Reference number from insurer
  denialDate        DateTime?
  denialText        String?   @db.Text // Exact denial language pasted by team
  
  // Dates
  draftedAt         DateTime  @default(now())
  submittedAt       DateTime?
  respondedAt       DateTime?
  
  // For Round 4: external review
  externalReviewOutcome String? // overturned, upheld, partial, pending
  
  // For Round 5: state complaint
  stateComplaintFiled   Boolean @default(false)
  stateComplaintOutcome String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([caseId])
  @@index([drug])
  @@index([round])
  @@index([status])
}
```

### PatientClinicalData

```prisma
model PatientClinicalData {
  id              String    @id @default(cuid())
  caseId          String    @unique
  case            InsuranceCase @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  // Labs
  bmi             Float?
  a1c             Float?
  fastingGlucose  Float?
  fastingInsulin  Float?
  triglycerides   Float?
  hdl             Float?
  homaIr          Float?    // Calculated: (insulin * glucose) / 405
  
  // Diagnoses (array of ICD-10 code IDs matching constants.ts)
  diagnoses       Json      @default("[]") // string[]
  
  // Prior treatments (array of treatment IDs matching constants.ts)
  priorTreatments Json      @default("[]") // string[]
  
  // Additional clinical notes
  clinicalNotes   String?   @db.Text
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### CaseNote

```prisma
model CaseNote {
  id        String    @id @default(cuid())
  caseId    String
  case      InsuranceCase @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  authorId  String?   // AdminUser ID (null for system-generated notes)
  content   String    @db.Text
  
  type      String    @default("note")
  // Values: note, status_change, stage_change, letter_generated, 
  //         denial_logged, assignment_change, eligibility_confirmed, system
  
  metadata  Json?     // Additional structured data (e.g., old/new status for changes)
  
  createdAt DateTime  @default(now())
  
  @@index([caseId])
}
```

### AdminUser Relation Update

```prisma
// Add to existing AdminUser model:
model AdminUser {
  // ... existing fields ...
  assignedCases InsuranceCase[]
}
```

---

## 4. API Endpoints

All routes under `/api/pa/*`. Auth required (admin session) unless marked Public.

### Cases

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/cases` | GET | List cases. Query params: `stage`, `assignedTo`, `search` (email/name), `page`, `limit`, `sort` |
| `/api/pa/cases` | POST | Create case manually or from eligibility purchase |
| `/api/pa/cases/[id]` | GET | Full case detail with submissions, clinical data, notes |
| `/api/pa/cases/[id]` | PATCH | Update case fields (stage, assignment, carrier info, etc.) |
| `/api/pa/cases/[id]/clinical` | PUT | Upsert clinical data (labs, diagnoses, treatments). Auto-calculates HOMA-IR |

### PA Submissions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/cases/[id]/submissions` | GET | List all submissions for a case |
| `/api/pa/cases/[id]/submissions` | POST | Create single submission with generated letter |
| `/api/pa/cases/[id]/submissions/[subId]` | PATCH | Update submission (status, denial info, dates) |
| `/api/pa/cases/[id]/submissions/[subId]/letter` | POST | Regenerate letter with current case data |

### Rounds

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/cases/[id]/launch-round` | POST | Launch round N. Body: `{ round: 1-5 }`. Creates all submissions for that round with generated letters. Advances case stage. |

### Notes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/cases/[id]/notes` | GET | List notes for a case (paginated, newest first) |
| `/api/pa/cases/[id]/notes` | POST | Add a note. Body: `{ content, type? }` |

### Eligibility

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/eligibility-check` | POST | Run 5-source + Stedi eligibility check. Creates/updates case. |

### Stats

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/stats` | GET | Dashboard stats: cases by stage, approval rates per drug, avg processing time, team workload |

### Public

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pa/case-status/[token]` | GET | Patient-facing status lookup. No auth. Returns stage (friendly text), per-drug status, next step. No clinical details exposed. |

---

## 5. Service Layer (`src/lib/pa/`)

### types.ts

All TypeScript interfaces for InsuranceCase, PASubmission, PatientClinicalData, CaseNote, plus:
- `Diagnosis` — `{ id, label, icdCode }` 
- `Treatment` — `{ id, label }`
- `StateDOI` — `{ name, phone, url, method, extReview }`
- `DenialReason` — enum of standard denial reasons
- `RoundConfig` — defines which drugs + indications per round
- `LaunchRoundResult` — submissions created + letters generated
- `CaseStats` — dashboard statistics shape
- `PublicCaseStatus` — patient-facing status (no PHI)

### constants.ts

Ported from v5 JSX, converted to typed TypeScript objects:
- `DIAGNOSES: Diagnosis[]` — 18 ICD-10 codes (E66.811 through M19.90)
- `TREATMENTS: Treatment[]` — 12 prior treatments
- `DENIAL_REASONS: string[]` — 8 standard reasons
- `STATE_DOI: Record<string, StateDOI>` — 21 states + OTHER
- `ROUND_CONFIG: Record<number, RoundConfig>` — drugs and indications per round
- `STAGE_ORDER: string[]` — canonical stage progression
- `DRUG_NAMES: Record<string, string>` — display names

### case-service.ts

```typescript
// Core CRUD
createCase(data: CreateCaseInput): Promise<InsuranceCase>
getCase(id: string): Promise<CaseWithRelations>
listCases(filters: CaseFilters): Promise<PaginatedResult<InsuranceCaseSummary>>
updateCase(id: string, data: UpdateCaseInput): Promise<InsuranceCase>

// Stage transitions (creates CaseNote automatically)
advanceStage(id: string, newStage: string, adminId: string): Promise<InsuranceCase>

// Assignment
assignCase(id: string, adminId: string, assignedById: string): Promise<InsuranceCase>
getUnassignedCases(): Promise<InsuranceCase[]>
```

### clinical-service.ts

```typescript
// Upsert clinical data + auto-calculate HOMA-IR
upsertClinical(caseId: string, data: ClinicalInput): Promise<PatientClinicalData>

// Auto-detect diagnoses from lab values
// A1C > 5.7 → prediabetes (R73.03)
// HOMA-IR > 2.5 → hyperinsulinemia (E16.1)
// Triglycerides > 150 → hypertriglyceridemia (E78.1)
// HDL < 40M/50F → low HDL (E78.6)
// BMI 30-34.9 → obesity class 1 (E66.811), 35-39.9 → class 2, 40+ → class 3
// A1C >= 6.5 → T2DM (E11.9)
// 3+ metabolic markers → metabolic syndrome (E88.81)
autoDetectDiagnoses(clinical: PatientClinicalData): string[]
```

### pa-engine.ts

Ported from `glp1-pa-engine-v5-scorched-earth.jsx`. Pure TypeScript, no React dependency.

```typescript
// Generate letter for a single submission
generateLetter(params: LetterParams): string
// LetterParams: { patient, clinical, diagnoses, treatments, drug, round, 
//                 indication, allDenials, insuranceType, stateInfo, notes,
//                 extReviewOutcome? }

// Launch an entire round — creates all submissions with letters
launchRound(caseId: string, round: number, adminId: string): Promise<LaunchRoundResult>

// Regenerate a single letter with current case data  
regenerateLetter(submissionId: string): Promise<PASubmission>

// Get denial-specific rebuttal language
getDenialRebuttal(reason: string, drug: string, diagnoses: string[]): string

// Determine best medication pathway based on denial history
analyzeBestPathway(denials: PASubmission[]): { drug: string, indication: string, reasoning: string }
```

**Round logic (from v5):**

| Round | Function | Drugs Created |
|-------|----------|---------------|
| 1 | `genR1Letters` | Wegovy (weight/CV) + Zepbound (weight/OSA) |
| 2 | `genR2Letters` | Ozempic (metabolic) + Mounjaro (metabolic) — NEW PAs, NOT appeals |
| 3 | `genR3Letters` | Appeal all 4 denied drugs — each demands P2P review |
| 4 | `genR4Letter` | External independent review request (best candidate drug) |
| 5 | `genR5Letter` | State insurance commissioner complaint |

### eligibility-service.ts

```typescript
// Run full eligibility check (wraps existing coverage-check pipeline)
runEligibilityCheck(caseId: string, input: EligibilityInput): Promise<EligibilityResult>

// Recheck benefits (before launching new round)
recheckBenefits(caseId: string): Promise<EligibilityResult>
```

Calls existing `src/lib/insurance/stedi.ts`, `confidence-engine.ts`, `web-search.ts`, and `glp1-probability-database.json`. Does not duplicate — imports and orchestrates.

### assignment-service.ts

```typescript
// Auto-assign to team member with fewest active cases
// Filters to AdminUsers with role: clinical_admin or support
autoAssign(caseId: string): Promise<InsuranceCase>

// Manual reassignment
reassign(caseId: string, newAdminId: string, reassignedById: string): Promise<InsuranceCase>

// Get team workload stats
getWorkload(): Promise<{ adminId: string, name: string, activeCases: number }[]>
```

### webhook-service.ts

```typescript
// Fire webhook on PA events (stage change, denial, approval, etc.)
fireEvent(event: PAEvent): Promise<void>

// PAEvent: { type, caseId, patientEmail, data, timestamp }
// Types: pa.case_created, pa.stage_changed, pa.submission_created, 
//        pa.denial_logged, pa.approved, pa.exhausted, pa.round_launched
```

Fire-and-forget to `PA_STATUS_WEBHOOK_URL`. Silent failure if URL not configured (same pattern as existing n8n webhooks).

---

## 6. Integration Points

### 6a. Existing Coverage Check → Auto Case Creation

When `/api/coverage-check` completes and the request includes an order with `INS-ELIG` SKU:
1. `eligibility-service.ts` creates an `InsuranceCase` at stage `eligibility_review`
2. Attaches full eligibility results to `eligibilityData`
3. Auto-assigns to team member with fewest active eligibility cases
4. Case appears in Work Queue immediately

### 6b. Payment Triggers → Stage Advancement

Hook into existing PayPal capture flow. When an order is captured with an insurance SKU:

| SKU | Action |
|-----|--------|
| `INS-ELIG` ($25) | Create case at `eligibility_review` (if not already created by coverage check) |
| `INS-PA` ($50) | Find case by email, advance to `pa_processing`, set `paRound = 1` |
| `INS-APPROVE` ($85) | Find case by email, advance to `pending_activation` |
| `INS-ONGOING` ($75/mo) | Find case by email, advance to `active_management` |

Detection happens in `webhook-service.ts` which is called from the existing PayPal webhook handler.

### 6c. Patient-Facing Status Page

Public page at `/[locale]/insurance-status`. Patient enters email + last 4 of member ID. Returns friendly status:

| Stage | Patient Sees |
|-------|-------------|
| `eligibility_review` | "We're reviewing your insurance coverage. You'll hear from us within 24-48 hours." |
| `pending_pa_purchase` | "Great news — you're eligible! Complete your PA purchase to proceed." |
| `pa_processing` | "Your prior authorization is being processed. Round [N] of 5 is active." |
| `pending_activation` | "Your PA was approved! Complete activation to start your medication." |
| `active_management` | "You're all set. Your next refill check is [date]." |
| `closed_approved` | "Your case is complete. Insurance is covering your medication." |
| `closed_exhausted` | "We've exhausted all insurance options. Contact us about our cash-pay program." |

### 6d. Outbound Webhooks

Every significant event fires to `PA_STATUS_WEBHOOK_URL`:

```json
{
  "event": "pa.stage_changed",
  "caseId": "clxyz...",
  "patientEmail": "patient@email.com",
  "patientName": "Maria Santos",
  "data": {
    "previousStage": "eligibility_review",
    "newStage": "pa_processing",
    "round": 1
  },
  "timestamp": "2026-04-03T14:30:00Z"
}
```

Events: `pa.case_created`, `pa.stage_changed`, `pa.submission_created`, `pa.denial_logged`, `pa.approved`, `pa.exhausted`, `pa.round_launched`

### 6e. Stedi Integration

Reuses existing `src/lib/insurance/stedi.ts` and Cloudflare Worker relay. No new Stedi code — `eligibility-service.ts` imports and calls the existing functions.

---

## 7. Zoho Migration

One-time script at `scripts/migrate-zoho.ts`. Idempotent (safe to re-run).

### Source Data

| Zoho Source | Records | Key Fields |
|-------------|---------|------------|
| CRM `Eligibility_Check_Module` | ~200 | Insurance cards (uploaded JPGs), per-drug status, eligibility status |
| Creator `Prior_Authorization_Module` | ~200 | Per-drug PA outcomes, assigned_to, notes |

### Mapping

| Zoho Field | → Our Field |
|------------|-------------|
| CRM `First_Name` + `Last_Name` | `InsuranceCase.patientName` |
| CRM `Email` | `InsuranceCase.patientEmail` |
| CRM `DOB` | `InsuranceCase.patientDob` |
| CRM `Phone` | `InsuranceCase.patientPhone` |
| CRM `Eligibility_Status` | `InsuranceCase.stage` (mapped from "New -- Not Started" etc.) |
| CRM `Insurance_Doc` / `Insurance_Doc_Back` | `InsuranceCase.insuranceCardFrontUrl` / `BackUrl` |
| CRM `Identity_Doc` / `Identity_Doc_Back` | `InsuranceCase.idCardFrontUrl` / `BackUrl` |
| CRM per-drug fields (Wegovy/Zepbound/Mounjaro/Ozempic) | `PASubmission` records per drug |
| Creator `PA_Status` per drug | `PASubmission.status` |
| Creator `Assigned_To` | `InsuranceCase.assignedToId` (matched by name) |
| Creator `Notes` | `CaseNote` record |
| CRM record ID | `InsuranceCase.zohoCrmRecordId` |

### Deduplication

Match on email between CRM and Creator records. One `InsuranceCase` per unique patient email. Creator PA outcomes become `PASubmission` records linked to the case.

### Execution

```bash
npx tsx scripts/migrate-zoho.ts
```

Uses Zoho CRM and Creator MCP tools for data extraction. Requires active MCP connection to Zoho during execution (not stored credentials). Falls back to exported CSV if MCP unavailable. Logs all operations to `ImportLog` table.

---

## 8. File Structure

```
src/
├── lib/pa/                              # ALL PA backend logic
│   ├── types.ts                         # TypeScript interfaces
│   ├── constants.ts                     # ICD-10, treatments, state DOI, denial reasons
│   ├── case-service.ts                  # Case CRUD, stage transitions
│   ├── clinical-service.ts              # Lab analysis, diagnosis auto-detection
│   ├── pa-engine.ts                     # Scorched Earth letter generation
│   ├── eligibility-service.ts           # 5-source check orchestration
│   ├── assignment-service.ts            # Team assignment logic
│   └── webhook-service.ts              # Outbound event webhooks
│
├── app/api/pa/                          # API routes (thin wrappers)
│   ├── cases/
│   │   ├── route.ts                     # GET list, POST create
│   │   └── [id]/
│   │       ├── route.ts                 # GET detail, PATCH update
│   │       ├── clinical/route.ts        # PUT upsert clinical data
│   │       ├── submissions/
│   │       │   ├── route.ts             # GET list, POST create
│   │       │   └── [subId]/
│   │       │       ├── route.ts         # PATCH update
│   │       │       └── letter/route.ts  # POST regenerate
│   │       ├── launch-round/route.ts    # POST launch round N
│   │       └── notes/route.ts           # GET/POST
│   ├── eligibility-check/route.ts       # POST run check
│   ├── stats/route.ts                   # GET dashboard stats
│   └── case-status/[token]/route.ts     # GET public status (no auth)
│
├── app/admin/(dashboard)/prior-auth/    # Admin pages (stubs for Ayush)
│   ├── page.tsx                         # Work Queue stub
│   └── cases/[id]/page.tsx              # Case Detail stub
│
scripts/
└── migrate-zoho.ts                      # One-time Zoho migration
│
prisma/
└── schema.prisma                        # New models added
```

---

## 9. Environment Variables

```env
# === PA MODULE (new) ===
STEDI_API_KEY=                    # Stedi eligibility API
STEDI_PORTAL_EMAIL=               # Stedi portal automation (fallback)
STEDI_PORTAL_PASSWORD=            # Stedi portal automation (fallback)
S3_BUCKET=                        # Insurance card image storage
S3_REGION=                        # S3 region
S3_ACCESS_KEY=                    # S3 access key
S3_SECRET_KEY=                    # S3 secret key
PA_STATUS_WEBHOOK_URL=            # Outbound PA event webhook

# === EXISTING (already configured) ===
DATABASE_URL=                     # PostgreSQL connection
PAYPAL_CLIENT_ID=                 # PayPal payments
PAYPAL_CLIENT_SECRET=             # PayPal payments
N8N_WEBHOOK_URL=                  # n8n automation webhook
ANTHROPIC_API_KEY=                # Claude API
```

---

## 10. Build Priority

| Step | Deliverable | Depends On | Description |
|------|-------------|------------|-------------|
| 1 | Prisma models + migration | Nothing | Add 4 new models to schema.prisma, run migration |
| 2 | `types.ts` + `constants.ts` | Nothing | All TypeScript interfaces, ICD-10 codes, state DOI data |
| 3 | `case-service.ts` | Steps 1-2 | Case CRUD, stage transitions, assignment, audit notes |
| 4 | `clinical-service.ts` | Step 2 | Lab analysis, HOMA-IR calculation, diagnosis auto-detection |
| 5 | `pa-engine.ts` | Steps 2, 4 | Port Scorched Earth v5 to TypeScript. Letter generation for all 5 rounds |
| 6 | `eligibility-service.ts` | Steps 1, 3 | Wire existing coverage-check pipeline into case creation |
| 7 | `assignment-service.ts` + `webhook-service.ts` | Step 3 | Team assignment + outbound webhooks |
| 8 | All API routes | Steps 3-7 | Thin wrappers calling service functions |
| 9 | Payment trigger wiring | Steps 3, 8 | PayPal webhook → case stage advancement |
| 10 | Zoho migration script | Steps 1, 3 | One-time migration of 200+ records |

Admin frontend pages are **stubs only** with JSDoc comments showing API endpoints, data shapes, and intended UI. Ayush builds the real frontend.

---

## 11. Admin UI Design (Reference for Ayush)

### Work Queue (`/admin/prior-auth`)

- Default view: "My Cases" filtered to logged-in admin
- Grouped sections: Needs Action → Waiting on Response → Recently Completed
- Each row: patient name, carrier, state, stage badge, assigned team member, per-drug status dots, time since last activity
- Stage filter pills at top with counts
- Stats popover: cases by stage, approval rates, avg processing time

### Case Detail (`/admin/prior-auth/cases/[id]`)

Two-column layout:
- **Left panel:** Patient snapshot, insurance card thumbnails, clinical data (editable labs), diagnoses (checkboxes with auto-detect button), prior treatments
- **Right panel:** Stage tracker (vertical stepper), drug status matrix (drugs x rounds), current round actions (view/edit/submit letters, log denials), case notes timeline

Key interactions:
- "Auto-detect Diagnoses" — reads labs, checks applicable ICD-10 codes
- "Launch Round N" — generates all letters for that round, creates submissions
- "Log Denial" — opens form for denial reason, ref #, date, exact language
- "Regenerate Letter" — re-generates with updated case data
- "Mark Submitted" / "Mark Approved" / "Mark Denied" — status transitions

### Sidebar Navigation Addition

New group "Insurance" in AdminSidebar.tsx NAV array:
- Work Queue → `/admin/prior-auth`
- All Cases → `/admin/prior-auth/cases`

---

## 12. Approval Rate Benchmarks (from Zoho Production Data)

These rates inform the Scorched Earth strategy and help Jena/Rhea prioritize:

| Drug | Round 1-2 Approval Rate | Notes |
|------|------------------------|-------|
| Mounjaro | 93% | Almost always approved under metabolic indication (Round 2) |
| Ozempic | 94% | Almost always approved under metabolic indication (Round 2) |
| Wegovy | 16% | Rarely approved — weight indication triggers denials. Primary purpose is to generate denial for appeal leverage |
| Zepbound | 8% | Rarely approved — same strategy as Wegovy |

**Strategy implication:** Rounds 1-2 are designed so that Wegovy/Zepbound denials create the paper trail needed for Ozempic/Mounjaro metabolic pivots and subsequent appeals. The "loss" in Round 1 is a strategic asset in Rounds 3-5.
