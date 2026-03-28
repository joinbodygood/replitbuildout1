"use client";

import { CategoryQuizEngine } from "./CategoryQuizEngine";
import type { QuizQuestion } from "./CategoryQuizEngine";

const questions: QuizQuestion[] = [
  {
    id: "concern",
    question: "What's your primary skin concern?",
    subtitle: "Pick the one that bothers you most — we'll build your formula around it.",
    options: [
      {
        value: "anti-aging",
        label: "Anti-aging & fine lines",
        sublabel: "Wrinkles, skin laxity, dullness, loss of glow",
      },
      {
        value: "dark-spots",
        label: "Dark spots & uneven skin tone",
        sublabel: "Melasma, hyperpigmentation, discoloration, post-acne marks",
      },
      {
        value: "hormonal-acne",
        label: "Hormonal acne",
        sublabel: "Breakouts that flare with your cycle, around the chin and jawline",
      },
      {
        value: "rosacea",
        label: "Rosacea & redness",
        sublabel: "Persistent flushing, visible redness, sensitive or reactive skin",
      },
      {
        value: "glow",
        label: "Overall glow & maintenance",
        sublabel: "No major concerns — just want medical-grade skincare",
      },
    ],
  },
  {
    id: "skin-tone",
    question: "How would you describe your skin tone?",
    subtitle: "This helps us choose the safest and most effective formula strength for you.",
    options: [
      { value: "light", label: "Fair to light", sublabel: "Burns easily, rarely tans" },
      { value: "medium", label: "Medium (olive or tan)", sublabel: "Sometimes burns, often tans" },
      { value: "deep", label: "Deep to very deep", sublabel: "Rarely burns — may have concerns with hyperpigmentation or melasma" },
    ],
  },
  {
    id: "sensitivity",
    question: "How sensitive is your skin?",
    options: [
      {
        value: "normal",
        label: "Normal — I can tolerate most things",
        sublabel: "Skin doesn't usually react to new products",
      },
      {
        value: "moderate",
        label: "Somewhat sensitive",
        sublabel: "Some products cause redness or irritation",
      },
      {
        value: "very",
        label: "Very sensitive or reactive",
        sublabel: "Rosacea, eczema, or I'm pregnant/nursing",
      },
    ],
  },
  {
    id: "experience",
    question: "Have you used prescription skincare before?",
    options: [
      {
        value: "none",
        label: "Never — new to prescription skincare",
        sublabel: "This would be my first time",
      },
      {
        value: "otc-retinol",
        label: "OTC retinol only",
        sublabel: "Used store-bought retinol or vitamin C serums",
      },
      {
        value: "tretinoin",
        label: "Prescription tretinoin",
        sublabel: "Used Retin-A or a compounded tretinoin formula",
      },
      {
        value: "hydroquinone",
        label: "Prescription hydroquinone or steroids",
        sublabel: "Used stronger brightening or anti-inflammatory prescriptions",
      },
    ],
  },
];

function getOutcome(answers: Record<string, string | string[]>): string {
  const concern = answers.concern as string;
  const tone = answers["skin-tone"] as string;
  const sensitivity = answers.sensitivity as string;

  if (concern === "anti-aging" || concern === "glow") {
    if (sensitivity === "very") return "rosacea";
    return "anti-aging";
  }
  if (concern === "dark-spots") {
    return "hyperpigmentation";
  }
  if (concern === "hormonal-acne") return "hormonal-acne";
  if (concern === "rosacea") return "rosacea";
  return "anti-aging";
}

export function SkinQuiz() {
  return (
    <CategoryQuizEngine
      category="skin"
      title="What's the best skincare formula for your skin?"
      subtitle="Answer 4 quick questions. Get a medical-grade formula matched to your specific concern — shipped to your door or prescribed to your pharmacy."
      badge="Skincare & Glow"
      questions={questions}
      getOutcome={getOutcome}
      resultBasePath="/quiz/skin/result"
    />
  );
}
