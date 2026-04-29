-- Drop the old full unique and add a partial unique that only fires when planId IS NULL
ALTER TABLE "CoverageIndex" DROP CONSTRAINT IF EXISTS "CoverageIndex_carrierKey_state_medication_indicationKey_key";
DROP INDEX IF EXISTS "CoverageIndex_carrierKey_state_medication_indicationKey_idx";
CREATE INDEX "CoverageIndex_carrierKey_state_medication_indicationKey_idx" ON "CoverageIndex"("carrierKey", "state", "medication", "indicationKey");
CREATE UNIQUE INDEX "CoverageIndex_no_plan_partial_uniq" ON "CoverageIndex"("carrierKey", "state", "medication", "indicationKey") WHERE "planId" IS NULL;
