-- CreateEnum
CREATE TYPE "InsuranceOrigin" AS ENUM ('aca', 'medicare', 'medicaid', 'employer', 'federal_military');

-- CreateEnum
CREATE TYPE "CoverageStatus" AS ENUM ('not_on_formulary', 'unlikely', 'coverage_with_pa', 'high_probability');

-- CreateEnum
CREATE TYPE "CoverageSource" AS ENUM ('healthcare_gov_api', 'qhp_file', 'medicare_part_d', 'medicaid_state', 'pbm_baseline', 'carrier_scrape', 'manual', 'default_fallback');

-- CreateEnum
CREATE TYPE "ResultBucket" AS ENUM ('not_on_formulary', 'unlikely', 'coverage_with_pa', 'high_probability');

-- CreateTable
CREATE TABLE "CoverageIndex" (
    "id" TEXT NOT NULL,
    "insuranceOrigin" "InsuranceOrigin" NOT NULL,
    "carrierKey" TEXT NOT NULL,
    "planId" TEXT,
    "state" TEXT NOT NULL,
    "pbm" TEXT,
    "medication" TEXT NOT NULL,
    "indicationKey" TEXT NOT NULL,
    "status" "CoverageStatus" NOT NULL,
    "probLow" INTEGER NOT NULL,
    "probHigh" INTEGER NOT NULL,
    "paRequired" BOOLEAN NOT NULL DEFAULT true,
    "stepTherapy" BOOLEAN NOT NULL DEFAULT false,
    "tier" INTEGER,
    "notes" TEXT,
    "source" "CoverageSource" NOT NULL,
    "sourceEvidenceUrl" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageIndex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverageDefault" (
    "id" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "indicationKey" TEXT NOT NULL,
    "probLow" INTEGER NOT NULL,
    "probHigh" INTEGER NOT NULL,
    "paRequired" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverageDefault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcaPlanDirectory" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "carrierKey" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planYear" INTEGER NOT NULL,
    "metalLevel" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcaPlanDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCheckLead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "emailConsent" BOOLEAN NOT NULL DEFAULT true,
    "intakeJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL,
    "resultHistory" JSONB,
    "resultBucket" "ResultBucket" NOT NULL,
    "bestMedication" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "zohoLeadId" TEXT,
    "convertedToPaid" BOOLEAN NOT NULL DEFAULT false,
    "convertedAt" TIMESTAMP(3),
    "locale" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "InsuranceCheckLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerRun" (
    "id" TEXT NOT NULL,
    "workerName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "rowsWritten" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "WorkerRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoverageIndex_insuranceOrigin_carrierKey_state_idx" ON "CoverageIndex"("insuranceOrigin", "carrierKey", "state");

-- CreateIndex
CREATE INDEX "CoverageIndex_planId_idx" ON "CoverageIndex"("planId");

-- CreateIndex
CREATE INDEX "CoverageIndex_medication_indicationKey_idx" ON "CoverageIndex"("medication", "indicationKey");

-- CreateIndex
CREATE INDEX "CoverageIndex_lastSeenAt_idx" ON "CoverageIndex"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageIndex_carrierKey_state_medication_indicationKey_key" ON "CoverageIndex"("carrierKey", "state", "medication", "indicationKey");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageIndex_planId_medication_indicationKey_key" ON "CoverageIndex"("planId", "medication", "indicationKey");

-- CreateIndex
CREATE UNIQUE INDEX "CoverageDefault_medication_indicationKey_key" ON "CoverageDefault"("medication", "indicationKey");

-- CreateIndex
CREATE UNIQUE INDEX "AcaPlanDirectory_planId_key" ON "AcaPlanDirectory"("planId");

-- CreateIndex
CREATE INDEX "AcaPlanDirectory_carrierKey_state_idx" ON "AcaPlanDirectory"("carrierKey", "state");

-- CreateIndex
CREATE INDEX "AcaPlanDirectory_state_planName_idx" ON "AcaPlanDirectory"("state", "planName");

-- CreateIndex
CREATE INDEX "InsuranceCheckLead_email_idx" ON "InsuranceCheckLead"("email");

-- CreateIndex
CREATE INDEX "InsuranceCheckLead_createdAt_idx" ON "InsuranceCheckLead"("createdAt");

-- CreateIndex
CREATE INDEX "InsuranceCheckLead_resultBucket_idx" ON "InsuranceCheckLead"("resultBucket");

-- CreateIndex
CREATE INDEX "WorkerRun_workerName_startedAt_idx" ON "WorkerRun"("workerName", "startedAt");

-- CreateIndex
CREATE INDEX "WorkerRun_status_idx" ON "WorkerRun"("status");

