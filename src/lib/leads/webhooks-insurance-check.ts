import { fireWebhook } from "@/lib/webhooks";
import type { IntakeAnswers } from "@/lib/insurance/routing";
import type { CoverageResult } from "@/lib/insurance/confidence-engine";

export async function fireLeadWebhooks(args: {
  leadId: string; intake: IntakeAnswers; result: CoverageResult; locale: string;
}) {
  const { leadId, intake, result, locale } = args;

  await fireWebhook("coverage_check.completed", {
    leadId,
    locale,
    contact: {
      firstName: intake.contact.firstName,
      email: intake.contact.email,
      phone: intake.contact.phone,
      smsConsent: intake.contact.smsConsent,
      emailConsent: intake.contact.emailConsent,
    },
    intake: {
      insuranceOrigin: intake.insuranceOrigin,
      carrier: intake.carrier,
      state: intake.state,
      zip: intake.zip,
      planName: intake.planName,
      employerSize: intake.employerSize,
      diagnoses: intake.diagnoses,
      heightInches: intake.heightInches,
      weightLb: intake.weightLb,
    },
    result: {
      bucket: result.bucket,
      medications: result.medications.map(m => ({
        medication: m.medication, status: m.status,
        probLow: m.probLow, probHigh: m.probHigh,
      })),
    },
    utm: intake.utm,
  });
}
