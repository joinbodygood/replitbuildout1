"use client";

import { CategoryQuizEngine } from "./CategoryQuizEngine";
import type { QuizQuestion } from "./CategoryQuizEngine";

const questions: QuizQuestion[] = [
  {
    id: "experiencing",
    question: "What are you experiencing?",
    subtitle: "Pick the one that fits you best. You can always discuss others with your provider.",
    options: [
      {
        value: "anxiety",
        label: "Anxiety or constant worry",
        sublabel: "Racing thoughts, tension, restlessness, feeling on edge",
      },
      {
        value: "performance",
        label: "Panic or performance anxiety",
        sublabel: "Fear of public speaking, presentations, social situations",
      },
      {
        value: "sleep",
        label: "Trouble sleeping",
        sublabel: "Difficulty falling asleep, staying asleep, or feeling rested",
      },
      {
        value: "depression",
        label: "Low mood or depression",
        sublabel: "Sadness, hopelessness, loss of interest in things you enjoyed",
      },
      {
        value: "motivation",
        label: "Low energy or motivation",
        sublabel: "Burnout, brain fog, feeling flat or unmotivated",
      },
      {
        value: "not-sure",
        label: "I'm not sure — I just don't feel like myself",
        sublabel: "Let a provider assess and recommend the right path",
      },
    ],
  },
  {
    id: "duration",
    question: "How long have you been feeling this way?",
    options: [
      {
        value: "recent",
        label: "Just started",
        sublabel: "A few weeks — something changed recently",
      },
      {
        value: "months",
        label: "A few months",
        sublabel: "Ongoing but manageable",
      },
      {
        value: "year-plus",
        label: "Over a year",
        sublabel: "Chronic — has been affecting my daily life",
      },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you about treatment?",
    options: [
      {
        value: "non-addictive",
        label: "Non-addictive medications only",
        sublabel: "No benzodiazepines, no stimulants — evidence-based alternatives",
      },
      {
        value: "fast",
        label: "Fastest path to feeling better",
        sublabel: "I want to start as soon as possible",
      },
      {
        value: "insurance",
        label: "I want to use my insurance",
        sublabel: "Prefer medications covered by my plan at my local pharmacy",
      },
      {
        value: "assess",
        label: "I just want to talk to a doctor first",
        sublabel: "Not ready to commit — just want a professional opinion",
      },
    ],
  },
];

function getOutcome(answers: Record<string, string | string[]>): string {
  const exp = answers.experiencing as string;

  if (exp === "anxiety") return "anxiety";
  if (exp === "performance") return "performance";
  if (exp === "sleep") return "sleep";
  if (exp === "depression") return "depression";
  if (exp === "motivation") return "motivation";
  return "assessment";
}

export function MentalWellnessQuiz() {
  return (
    <CategoryQuizEngine
      category="mental-wellness"
      title="Let's find the right support for your mental wellness."
      subtitle="Answer 3 quick questions. We use evidence-based, non-addictive medications — no Xanax, no Adderall. Just real medicine that works."
      badge="Mental Wellness"
      questions={questions}
      getOutcome={getOutcome}
      resultBasePath="/quiz/mental-wellness/result"
    />
  );
}
