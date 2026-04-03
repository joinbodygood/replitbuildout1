import { findCaseByEmail } from "./case-service";
import { advanceStage } from "./case-service";
import { autoAssign } from "./assignment-service";
import { createCase } from "./case-service";
import { fireEvent, buildEvent } from "./webhook-service";

const PA_SKUS: Record<string, { stage: string; paRound?: number }> = {
  "INS-ELIG": { stage: "eligibility_review" },
  "INS-PA": { stage: "pa_processing", paRound: 1 },
  "INS-APPROVE": { stage: "pending_activation" },
  "INS-ONGOING": { stage: "active_management" },
};

export async function handleInsurancePayment(order: {
  email: string;
  items: { sku?: string; productName: string }[];
  id: string;
  shippingName?: string;
  shippingState?: string;
}) {
  for (const item of order.items) {
    const sku = item.sku?.toUpperCase();
    if (!sku || !PA_SKUS[sku]) continue;

    const config = PA_SKUS[sku];
    let insuranceCase = await findCaseByEmail(order.email);

    if (!insuranceCase && sku === "INS-ELIG") {
      insuranceCase = await createCase({
        patientEmail: order.email,
        patientName: order.shippingName ?? order.email,
        patientState: order.shippingState ?? "FL",
        orderId: order.id,
        stage: config.stage,
      });
      await autoAssign(insuranceCase.id);
    } else if (insuranceCase) {
      await advanceStage(insuranceCase.id, config.stage, "system");
    }

    if (insuranceCase) {
      await fireEvent(
        buildEvent("pa.stage_changed", insuranceCase.id, order.email, insuranceCase.patientName, {
          trigger: "payment",
          sku,
          newStage: config.stage,
        })
      );
    }
  }
}
