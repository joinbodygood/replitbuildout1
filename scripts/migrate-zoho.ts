/**
 * Zoho -> PA Module Migration Script
 *
 * Migrates records from Zoho CRM (Eligibility_Check_Module) and
 * Creator (Prior_Authorization_Module) into InsuranceCase + PASubmission tables.
 *
 * Usage: npx tsx scripts/migrate-zoho.ts
 *
 * Prerequisites:
 *   - DATABASE_URL set in .env
 *   - Export Zoho data as JSON to scripts/data/
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ZohoCrmRecord {
  id: string;
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Phone?: string;
  DOB?: string;
  Eligibility_Status?: string;
  Wegovy?: string;
  Zepbound?: string;
  Mounjaro?: string;
  Ozempic?: string;
}

interface ZohoCreatorRecord {
  ID?: string;
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Wegovy?: string;
  Zepbound?: string;
  Mounjaro?: string;
  Ozempic?: string;
  Assigned_To?: string;
  Notes?: string;
  PA_Status?: string;
}

function mapStatus(zohoStatus?: string): string {
  if (!zohoStatus) return "probability";
  const s = zohoStatus.toLowerCase();
  if (s.includes("approved")) return "closed_approved";
  if (s.includes("denied")) return "closed_exhausted";
  if (s.includes("in") && s.includes("process")) return "pa_processing";
  if (s.includes("pending")) return "eligibility_review";
  return "eligibility_review";
}

function mapDrugStatus(status?: string): string {
  if (!status) return "drafted";
  const s = status.toLowerCase();
  if (s.includes("approved")) return "approved";
  if (s.includes("denied")) return "denied";
  if (s.includes("in") && s.includes("process")) return "submitted";
  if (s.includes("pending")) return "pending_response";
  if (s.includes("delayed")) return "pending_response";
  return "drafted";
}

async function main() {
  console.log("Starting Zoho migration...\n");

  let crmRecords: ZohoCrmRecord[] = [];
  let creatorRecords: ZohoCreatorRecord[] = [];

  try {
    const fs = await import("fs");
    const crmPath = "scripts/data/zoho-crm-eligibility.json";
    const creatorPath = "scripts/data/zoho-creator-pa.json";

    if (fs.existsSync(crmPath)) {
      crmRecords = JSON.parse(fs.readFileSync(crmPath, "utf-8"));
      console.log(`Loaded ${crmRecords.length} CRM records`);
    } else {
      console.log(`No CRM export found at ${crmPath} — skipping`);
    }

    if (fs.existsSync(creatorPath)) {
      creatorRecords = JSON.parse(fs.readFileSync(creatorPath, "utf-8"));
      console.log(`Loaded ${creatorRecords.length} Creator records`);
    } else {
      console.log(`No Creator export found at ${creatorPath} — skipping`);
    }
  } catch (err) {
    console.error("Error loading JSON files:", err);
    process.exit(1);
  }

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const byEmail = new Map<string, { crm?: ZohoCrmRecord; creator?: ZohoCreatorRecord }>();

  for (const r of crmRecords) {
    if (!r.Email) continue;
    const email = r.Email.toLowerCase().trim();
    byEmail.set(email, { ...byEmail.get(email), crm: r });
  }
  for (const r of creatorRecords) {
    if (!r.Email) continue;
    const email = r.Email.toLowerCase().trim();
    byEmail.set(email, { ...byEmail.get(email), creator: r });
  }

  console.log(`\nMerged to ${byEmail.size} unique patients\n`);

  for (const [email, { crm, creator }] of byEmail) {
    try {
      const existing = await prisma.insuranceCase.findFirst({
        where: { patientEmail: email },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const name = [crm?.First_Name || creator?.First_Name, crm?.Last_Name || creator?.Last_Name]
        .filter(Boolean)
        .join(" ") || email;

      const stage = mapStatus(crm?.Eligibility_Status || creator?.PA_Status);

      const insuranceCase = await prisma.insuranceCase.create({
        data: {
          patientEmail: email,
          patientName: name,
          patientDob: crm?.DOB,
          patientPhone: crm?.Phone,
          patientState: "FL",
          stage,
          zohoCrmRecordId: crm?.id,
        },
      });

      const drugs = [
        { drug: "wegovy", status: crm?.Wegovy || creator?.Wegovy },
        { drug: "zepbound", status: crm?.Zepbound || creator?.Zepbound },
        { drug: "mounjaro", status: crm?.Mounjaro || creator?.Mounjaro },
        { drug: "ozempic", status: crm?.Ozempic || creator?.Ozempic },
      ];

      for (const { drug, status } of drugs) {
        if (!status) continue;
        await prisma.pASubmission.create({
          data: {
            caseId: insuranceCase.id,
            drug,
            round: drug === "wegovy" || drug === "zepbound" ? 1 : 2,
            indication: drug === "wegovy" || drug === "zepbound" ? "weight_cv" : "metabolic",
            status: mapDrugStatus(status),
          },
        });
      }

      if (creator?.Notes) {
        await prisma.caseNote.create({
          data: {
            caseId: insuranceCase.id,
            content: `[Migrated from Zoho] ${creator.Notes}`,
            type: "system",
          },
        });
      }

      imported++;
    } catch (err) {
      console.error(`Error migrating ${email}:`, err);
      errors++;
    }
  }

  await prisma.importLog.create({
    data: {
      type: "zoho_pa_migration",
      status: "completed",
      imported,
      skipped,
      errors,
      total: byEmail.size,
      notes: `Migrated from Zoho CRM (${crmRecords.length}) + Creator (${creatorRecords.length})`,
    },
  });

  console.log(`\nMigration complete:`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Total: ${byEmail.size}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
