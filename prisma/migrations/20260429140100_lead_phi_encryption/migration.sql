ALTER TABLE "InsuranceCheckLead" ADD COLUMN "emailHash" TEXT NOT NULL DEFAULT '';
DROP INDEX IF EXISTS "InsuranceCheckLead_email_idx";
CREATE INDEX "InsuranceCheckLead_emailHash_idx" ON "InsuranceCheckLead"("emailHash");
-- Note: existing rows (none in prod yet) keep email column unchanged.
-- Once deployed, all NEW rows will have encrypted email + populated emailHash.
