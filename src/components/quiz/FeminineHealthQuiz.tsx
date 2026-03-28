"use client";

import { CategoryQuizEngine } from "./CategoryQuizEngine";
import type { QuizQuestion } from "./CategoryQuizEngine";

const questions: QuizQuestion[] = [
  {
    id: "concern",
    question: "What's your main concern today?",
    subtitle: "Pick the one that describes you best — we'll match you with the right treatment.",
    options: [
      {
        value: "uti",
        label: "I think I have a UTI",
        sublabel: "Burning or pain when urinating, urgency, frequent urination",
      },
      {
        value: "yeast",
        label: "I think I have a yeast infection",
        sublabel: "Itching, cottage cheese-like discharge, irritation",
      },
      {
        value: "bv",
        label: "I think I have BV (bacterial vaginosis)",
        sublabel: "Unusual odor, thin grayish or white discharge",
      },
      {
        value: "dryness",
        label: "Vaginal dryness or discomfort",
        sublabel: "Dryness during intimacy, irritation, menopause-related changes",
      },
      {
        value: "intimacy",
        label: "Boost intimacy & sexual wellness",
        sublabel: "Arousal, desire, sensitivity, or connection",
      },
      {
        value: "prevention",
        label: "Prevent recurring infections",
        sublabel: "I keep getting UTIs, yeast infections, or BV",
      },
    ],
  },
  {
    id: "urgency",
    question: "How urgent is this for you?",
    options: [
      {
        value: "today",
        label: "I need treatment today",
        sublabel: "Symptomatic right now — I want the fastest path to relief",
      },
      {
        value: "ongoing",
        label: "This is an ongoing issue",
        sublabel: "It comes back frequently — I want a long-term solution",
      },
      {
        value: "proactive",
        label: "I'm being proactive",
        sublabel: "No active symptoms — I want to prevent future issues",
      },
    ],
  },
  {
    id: "insurance",
    question: "Do you have health insurance?",
    subtitle: "This helps us show you the most affordable path.",
    options: [
      {
        value: "yes",
        label: "Yes, I have health insurance",
        sublabel: "I'd like to use it if possible",
      },
      {
        value: "no",
        label: "No, or I prefer to pay directly",
        sublabel: "Self-pay or cash pricing",
      },
    ],
  },
];

function getOutcome(answers: Record<string, string | string[]>): string {
  const concern = answers.concern as string;

  if (concern === "uti" || concern === "yeast" || concern === "bv") {
    return "acute-infection";
  }
  if (concern === "dryness") return "vaginal-dryness";
  if (concern === "intimacy") return "intimacy";
  if (concern === "prevention") return "prevention";
  return "acute-infection";
}

export function FeminineHealthQuiz() {
  return (
    <CategoryQuizEngine
      category="feminine-health"
      title="Get treatment for what your body is telling you."
      subtitle="Answer 3 quick questions. We'll match you with the right provider and treatment — same day for acute issues."
      badge="Feminine Health"
      questions={questions}
      getOutcome={getOutcome}
      resultBasePath="/quiz/feminine-health/result"
    />
  );
}
