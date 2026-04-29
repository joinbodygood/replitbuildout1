import { db } from "@/lib/db";
import type { IntakeAnswers } from "@/lib/insurance/routing";
import type { CoverageResult } from "@/lib/insurance/confidence-engine";
import type { ResultBucket } from "@prisma/client";
import { encrypt, hashEmail } from "@/lib/crypto/lead-encryption";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function upsertLead(args: {
  intake: IntakeAnswers;
  result: CoverageResult;
  ipAddress: string | null;
  userAgent: string | null;
  locale: string;
}) {
  const { intake, result, ipAddress, userAgent, locale } = args;
  const bucket = result.bucket as ResultBucket;
  const bestMed = result.medications.length === 0
    ? "wegovy"
    : result.medications.reduce((best, m) =>
        (m.probHigh > best.probHigh ? m : best), result.medications[0]).medication;

  const recent = await db.insuranceCheckLead.findFirst({
    where: { emailHash: hashEmail(intake.contact.email), createdAt: { gt: new Date(Date.now() - SEVEN_DAYS_MS) } },
    orderBy: { createdAt: "desc" },
  });

  if (recent) {
    const history = (recent.resultHistory as unknown[] | null) ?? [];
    return db.insuranceCheckLead.update({
      where: { id: recent.id },
      data: {
        intakeJson: { ct: encrypt(JSON.stringify(intake)) } as never,
        resultJson: { ct: encrypt(JSON.stringify(result)) } as never,
        resultHistory: [...history, recent.resultJson] as never,
        resultBucket: bucket,
        bestMedication: bestMed,
        firstName: intake.contact.firstName,
        emailHash: hashEmail(intake.contact.email),
        phone: intake.contact.phone ? encrypt(intake.contact.phone) : null,
        smsConsent: intake.contact.smsConsent,
        emailConsent: intake.contact.emailConsent,
      },
    });
  }

  return db.insuranceCheckLead.create({
    data: {
      firstName: intake.contact.firstName,
      email: encrypt(intake.contact.email.toLowerCase()),
      emailHash: hashEmail(intake.contact.email),
      phone: intake.contact.phone ? encrypt(intake.contact.phone) : null,
      smsConsent: intake.contact.smsConsent,
      emailConsent: intake.contact.emailConsent,
      intakeJson: { ct: encrypt(JSON.stringify(intake)) } as never,
      resultJson: { ct: encrypt(JSON.stringify(result)) } as never,
      resultBucket: bucket,
      bestMedication: bestMed,
      utmSource: intake.utm.source ?? null,
      utmMedium: intake.utm.medium ?? null,
      utmCampaign: intake.utm.campaign ?? null,
      ipAddress,
      userAgent,
      locale,
    },
  });
}

export async function markConvertedToPaid(leadId: string) {
  return db.insuranceCheckLead.update({
    where: { id: leadId },
    data: { convertedToPaid: true, convertedAt: new Date() },
  });
}
