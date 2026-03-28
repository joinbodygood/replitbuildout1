"use client";

import { CategoryQuizEngine } from "./CategoryQuizEngine";
import type { QuizQuestion } from "./CategoryQuizEngine";

const questions: QuizQuestion[] = [
  {
    id: "gender",
    question: "Are you looking for hair loss treatment for…",
    options: [
      {
        value: "women",
        label: "Women's hair loss",
        sublabel: "Thinning, shedding, hormonal or postpartum hair loss",
      },
      {
        value: "men",
        label: "Men's hair loss",
        sublabel: "Receding hairline, thinning crown, male pattern baldness",
      },
    ],
  },
  {
    id: "duration",
    question: "How long have you been experiencing hair loss?",
    options: [
      {
        value: "recent",
        label: "Just started (under 6 months)",
        sublabel: "Noticing it for the first time",
      },
      {
        value: "one-two",
        label: "1 to 2 years",
        sublabel: "Gradual but noticeable progression",
      },
      {
        value: "three-plus",
        label: "3 or more years",
        sublabel: "Long-standing issue",
      },
    ],
  },
  {
    id: "type",
    question: "How would you describe your hair loss?",
    options: [
      {
        value: "thinning",
        label: "Overall thinning",
        sublabel: "Hair is finer and less dense everywhere",
      },
      {
        value: "shedding",
        label: "More shedding than usual",
        sublabel: "Noticing more hair in the shower or brush",
      },
      {
        value: "receding",
        label: "Receding hairline",
        sublabel: "Temples or front hairline pulling back",
      },
      {
        value: "patches",
        label: "Bald patches or significant crown loss",
        sublabel: "Specific areas with visible thinning or baldness",
      },
      {
        value: "hormonal",
        label: "Postpartum or hormone-related",
        sublabel: "After pregnancy, menopause, or hormonal changes",
      },
    ],
  },
  {
    id: "history",
    question: "Have you tried any hair loss treatments before?",
    options: [
      {
        value: "nothing",
        label: "Nothing yet",
        sublabel: "This is my first time seeking treatment",
      },
      {
        value: "otc",
        label: "OTC products (Rogaine, minoxidil foam)",
        sublabel: "Over-the-counter treatments from a drugstore",
      },
      {
        value: "prescription",
        label: "Prescription medication",
        sublabel: "Finasteride, spironolactone, or something from a doctor",
      },
      {
        value: "multiple",
        label: "Multiple things — nothing working great",
        sublabel: "Ready to try a more targeted approach",
      },
    ],
  },
];

function getOutcome(answers: Record<string, string | string[]>): string {
  const gender = answers.gender as string;
  const duration = answers.duration as string;
  const type = answers.type as string;
  const history = answers.history as string;

  if (gender === "women") {
    if (
      type === "patches" ||
      type === "hormonal" ||
      duration === "three-plus" ||
      history === "multiple"
    )
      return "women-max";
    if (duration === "one-two" || type === "receding" || history === "prescription")
      return "women-moderate";
    return "women-mild";
  } else {
    if (type === "patches" || history === "multiple" || duration === "three-plus")
      return "men-max";
    if (duration === "one-two" || type === "thinning" || type === "receding")
      return "men-combo";
    return "men-basic";
  }
}

export function HairQuiz() {
  return (
    <CategoryQuizEngine
      category="hair"
      title="What's the best hair treatment for you?"
      subtitle="Answer 4 quick questions and get a personalized recommendation — compounded formulas shipped to your door, or a prescription sent to your pharmacy."
      badge="Hair Restoration"
      questions={questions}
      getOutcome={getOutcome}
      resultBasePath="/quiz/hair/result"
    />
  );
}
