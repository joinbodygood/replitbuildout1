import type { ProbabilityRange } from "./modifiers";

export type ResultLabel = "not_on_formulary" | "unlikely" | "coverage_with_pa" | "high_probability";

export function mapToLabel(prob: ProbabilityRange, paRequired: boolean): ResultLabel {
  if (prob.probLow === 0 && prob.probHigh === 0) return "not_on_formulary";
  if (prob.probHigh < 35) return "unlikely";
  if (prob.probLow >= 65 && !paRequired) return "high_probability";
  return "coverage_with_pa";
}

export const LABEL_DISPLAY: Record<ResultLabel, string> = {
  not_on_formulary: "Not on Formulary",
  unlikely: "Unlikely",
  coverage_with_pa: "Coverage with PA",
  high_probability: "High Probability",
};
