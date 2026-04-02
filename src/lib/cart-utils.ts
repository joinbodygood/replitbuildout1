import type { CartItem } from "@/context/CartContext";

/** Weight-loss flows that can coexist with wellness injections */
const WL_FLOWS = new Set(["compounded-glp1", "oral-glp1", "branded-rx", "insurance"]);

/** Human-readable program labels for conflict messages */
export const FLOW_PROGRAM_LABELS: Record<string, string> = {
  "wellness-injection": "Wellness Injection",
  "mental-health":      "Mental Health",
  "compounded-glp1":    "Weight Loss (Compounded GLP-1)",
  "oral-glp1":          "Weight Loss (Oral)",
  "branded-rx":         "Weight Loss (Brand Rx)",
  "insurance":          "Weight Loss (Insurance)",
  "hair-loss":          "Hair Loss",
  "feminine-health":    "Feminine Health",
};

/**
 * Returns the display label of any program already in the cart that would
 * conflict with `targetFlow`, or null if no conflict exists.
 *
 * Exception: Weight Loss flows and Wellness Injection can coexist because
 * the GLP-1 medical intake already covers all wellness-injection questions.
 */
export function detectCartConflict(
  targetFlow: string,
  currentItems: CartItem[],
): string | null {
  const existingFlows = [
    ...new Set(
      currentItems
        .filter((i) => i.flow && i.flow !== targetFlow)
        .map((i) => i.flow!),
    ),
  ];

  for (const existingFlow of existingFlows) {
    // WL + WI exception — these two groups can coexist
    if (
      (WL_FLOWS.has(targetFlow) && existingFlow === "wellness-injection") ||
      (targetFlow === "wellness-injection" && WL_FLOWS.has(existingFlow))
    ) {
      continue;
    }
    return FLOW_PROGRAM_LABELS[existingFlow] ?? existingFlow;
  }

  return null;
}
