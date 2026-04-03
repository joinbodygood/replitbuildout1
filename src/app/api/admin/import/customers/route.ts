import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

const SEGMENT_MAP: Array<{ patterns: string[]; key: string; label: string }> = [
  { patterns: ["#self-pay", "self-pay"],                              key: "self-pay",         label: "Self-Pay Customers" },
  { patterns: ["#compound", "compound"],                             key: "compound",         label: "Compound Medication Customers" },
  { patterns: ["#insurance", "insurance"],                           key: "insurance",        label: "Insurance Customers" },
  { patterns: ["#oral", "oral"],                                     key: "oral",             label: "Oral Medication Customers" },
  { patterns: ["quiz-lead"],                                         key: "quiz-lead",        label: "Quiz Leads" },
  { patterns: ["#vip", "gold vip", "#gold", "vip"],                  key: "vip",              label: "VIP Customers" },
  { patterns: ["#vitaminsandsupplements", "vitaminsandsupplements"], key: "supplements",      label: "Supplement Customers" },
  { patterns: ["newsletter", "email-subscriber", "email subscriber"],key: "email-subscriber", label: "Email Subscribers" },
];

function computeSegments(tags: string): string[] {
  const tagLower = tags.toLowerCase();
  const segs: string[] = [];
  for (const seg of SEGMENT_MAP) {
    if (seg.patterns.some((p) => tagLower.includes(p.toLowerCase()))) {
      segs.push(seg.key);
    }
  }
  return segs;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawCustomers: any[];
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const text     = await file.text();
    rawCustomers   = JSON.parse(text);
    if (!Array.isArray(rawCustomers)) throw new Error("Expected JSON array");
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
  }

  let skipped   = 0;  // no email
  let imported  = 0;
  let merged    = 0;  // duplicates merged

  // Deduplicate incoming list by email — keep the one with more orders
  const byEmail = new Map<string, any>();
  for (const c of rawCustomers) {
    const email = (c.email ?? "").trim().toLowerCase();
    if (!email) { skipped++; continue; }
    const existing = byEmail.get(email);
    if (!existing || (c.orders_count ?? 0) > (existing.orders_count ?? 0)) {
      byEmail.set(email, c);
    } else {
      merged++;
    }
  }

  const toImport = Array.from(byEmail.values());

  // Upsert in batches of 200
  const BATCH = 200;
  for (let i = 0; i < toImport.length; i += BATCH) {
    const batch = toImport.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (c) => {
        const email    = c.email.trim().toLowerCase();
        const tags     = typeof c.tags === "string" ? c.tags : (Array.isArray(c.tags) ? c.tags.join(",") : "");
        const segments = computeSegments(tags);
        const shopifyCreatedAt = c.created_at ? new Date(c.created_at) : null;
        // Check if email already exists in DB
        const existing = await db.importedCustomer.findUnique({ where: { email } });
        if (existing) {
          // Merge: keep higher ordersCount
          if ((c.orders_count ?? 0) > existing.ordersCount) {
            await db.importedCustomer.update({
              where: { email },
              data: {
                shopifyId:        String(c.id ?? ""),
                firstName:        c.first_name ?? existing.firstName,
                lastName:         c.last_name  ?? existing.lastName,
                phone:            c.phone      ?? existing.phone,
                tags,
                segments,
                ordersCount:      c.orders_count  ?? existing.ordersCount,
                totalSpent:       parseFloat(c.total_spent ?? "0") || existing.totalSpent,
                state:            c.state ?? existing.state,
                shopifyCreatedAt: shopifyCreatedAt ?? existing.shopifyCreatedAt,
              },
            });
          }
          merged++;
        } else {
          await db.importedCustomer.create({
            data: {
              shopifyId:        c.id ? String(c.id) : null,
              email,
              firstName:        c.first_name ?? null,
              lastName:         c.last_name  ?? null,
              phone:            c.phone      ?? null,
              tags,
              segments,
              ordersCount:      c.orders_count  ?? 0,
              totalSpent:       parseFloat(c.total_spent ?? "0") || 0,
              state:            c.state ?? "enabled",
              shopifyCreatedAt,
            },
          });
          imported++;
        }
      })
    );
  }

  const total = await db.importedCustomer.count();
  return NextResponse.json({ success: true, imported, merged, skipped, total });
}
