import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = splitCSVRow(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  return lines.slice(1).map((line) => {
    const values = splitCSVRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim();
    });
    return row;
  });
}

function splitCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function generateCode(firstName: string, lastName: string): string {
  const f = (firstName[0] ?? "X").toUpperCase();
  const l = lastName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X").padEnd(4, "X");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${f}${l}${rand}`;
}

async function uniqueCode(base: string): Promise<string> {
  let code = base;
  let attempt = 0;
  while (attempt < 10) {
    const exists = await db.referralMember.findUnique({ where: { referralCode: code } });
    if (!exists) return code;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    code = base.slice(0, 5) + rand;
    attempt++;
  }
  return base + Date.now().toString(36).toUpperCase().slice(-4);
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { csv, filename } = await req.json();
  if (!csv) return NextResponse.json({ error: "CSV content required" }, { status: 400 });

  const rows = parseCSV(csv);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bodygoodstudio.com";

  let imported = 0;
  let skipped = 0;
  let errors = 0;
  const errorNotes: string[] = [];

  for (const row of rows) {
    const email = (row.email ?? "").toLowerCase().trim();
    const firstName = row.first_name ?? row.firstname ?? "";
    const lastName = row.last_name ?? row.lastname ?? "";
    const phone = row.phone_number ?? row.phone ?? "";
    const status = (row.status ?? "").toUpperCase();
    const legacyUrl = row.url ?? "";

    if (!email || !email.includes("@")) { skipped++; continue; }
    if (status !== "ENABLED") { skipped++; continue; }
    if (!firstName) { skipped++; continue; }

    try {
      const existing = await db.referralMember.findUnique({ where: { email } });
      if (existing) { skipped++; continue; }

      const codeBase = generateCode(firstName, lastName);
      const referralCode = await uniqueCode(codeBase);

      const linkedCustomer = await db.importedCustomer.findUnique({ where: { email } });

      await db.referralMember.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || null,
          referralCode,
          status: "enabled",
          legacyReferralUrl: legacyUrl || null,
          linkedCustomerEmail: linkedCustomer ? email : null,
        },
      });

      imported++;
    } catch (err) {
      errors++;
      errorNotes.push(`${email}: ${String(err).slice(0, 100)}`);
    }
  }

  await db.importLog.create({
    data: {
      type: "referrals",
      filename: filename ?? null,
      status: errors > 0 && imported === 0 ? "failed" : "completed",
      imported,
      skipped,
      errors,
      total: rows.length,
      notes: errorNotes.slice(0, 20).join("\n") || null,
    },
  });

  return NextResponse.json({ imported, skipped, errors, total: rows.length });
}
