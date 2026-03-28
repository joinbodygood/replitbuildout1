"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { QuizStep } from "./QuizStep";
import { InterstitialCard } from "./InterstitialCard";
import { BMICalculator } from "./BMICalculator";
import { EmailCapture } from "./EmailCapture";
import { InsuranceQuestions } from "./InsuranceQuestions";

export type QuizState = {
  currentStep: number;
  goal: string | null;
  bmi: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  disqualified: boolean;
  disqualifyReason: string | null;
  email: string | null;
  phone: string | null;
  hasInsurance: string | null; // "yes" | "no" | "prefer-not"
  insuranceCarrier: string | null;
  insurancePlanType: string | null;
  insuranceState: string | null;
  insuranceProbability: number | null;
  needleComfort: string | null; // "comfortable" | "no-needles" | "either"
  priority: string | null; // "lowest-cost" | "fda-branded" | "not-sure"
  brandedPreference: string | null; // "wegovy-pill" | "wegovy-injection" | "zepbound-kwikpen" | "zepbound-vial" | "not-sure"
};

const initialState: QuizState = {
  currentStep: 0,
  goal: null,
  bmi: null,
  heightFeet: null,
  heightInches: null,
  weight: null,
  disqualified: false,
  disqualifyReason: null,
  email: null,
  phone: null,
  hasInsurance: null,
  insuranceCarrier: null,
  insurancePlanType: null,
  insuranceState: null,
  insuranceProbability: null,
  needleComfort: null,
  priority: null,
  brandedPreference: null,
};

// Step definitions with their types
type StepDef =
  | { type: "question"; id: string }
  | { type: "interstitial"; id: string }
  | { type: "bmi"; id: string }
  | { type: "medical"; id: string }
  | { type: "email"; id: string }
  | { type: "insurance-check"; id: string }
  | { type: "insurance-details"; id: string }
  | { type: "needles"; id: string }
  | { type: "education"; id: string }
  | { type: "priority"; id: string }
  | { type: "branded-preference"; id: string };

const STEPS: StepDef[] = [
  { type: "question", id: "goal" },
  { type: "bmi", id: "bmi" },
  { type: "interstitial", id: "stats" },           // Card A: You're Not Alone
  { type: "medical", id: "medical" },
  { type: "interstitial", id: "dr-linda" },         // Card B: Meet Dr. Linda
  { type: "email", id: "email" },
  { type: "insurance-check", id: "insurance-check" },
  // Steps 7+ are conditional — handled by getNextStep
  { type: "insurance-details", id: "insurance-details" },
  { type: "needles", id: "needles" },
  { type: "interstitial", id: "education" },         // Card C: Semaglutide vs Tirzepatide
  { type: "priority", id: "priority" },
  { type: "branded-preference", id: "branded-preference" },
];

function getNextStep(state: QuizState, currentStep: number): number | "outcome" {
  const currentId = STEPS[currentStep]?.id;

  // After insurance check
  if (currentId === "insurance-check") {
    if (state.hasInsurance === "yes") return currentStep + 1; // insurance details
    return currentStep + 2; // skip to needles
  }

  // After insurance details — route based on probability
  if (currentId === "insurance-details") {
    if (state.insuranceProbability && state.insuranceProbability >= 70) return "outcome";
    return currentStep + 1; // needles
  }

  // After needles
  if (currentId === "needles") {
    if (state.needleComfort === "no-needles") return "outcome";
    return currentStep + 1; // education card
  }

  // After priority
  if (currentId === "priority") {
    if (state.priority === "lowest-cost" || state.priority === "not-sure") return "outcome";
    return currentStep + 1; // branded preference
  }

  // After branded preference
  if (currentId === "branded-preference") return "outcome";

  // Default: next step
  return currentStep + 1;
}

function determineOutcome(state: QuizState): string {
  // Insurance path
  if (state.hasInsurance === "yes" && state.insuranceProbability && state.insuranceProbability >= 70) {
    return "insurance";
  }

  // No needles path
  if (state.needleComfort === "no-needles") {
    return "oral";
  }

  // Branded path
  if (state.priority === "fda-branded") {
    return "branded";
  }

  // Default: compounded
  return "compounded";
}

export function QuizEngine() {
  const [state, setState] = useState<QuizState>(initialState);
  const router = useRouter();
  const locale = useLocale();

  // Save state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bg_quiz_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (state.currentStep > 0) {
      localStorage.setItem("bg_quiz_state", JSON.stringify(state));
    }
  }, [state]);

  // Track analytics
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", `quiz_step_${state.currentStep}`, {
        step_id: STEPS[state.currentStep]?.id,
      });
    }
  }, [state.currentStep]);

  const totalSteps = STEPS.length;
  const progress = Math.round(((state.currentStep + 1) / totalSteps) * 100);

  function advance(updates: Partial<QuizState> = {}) {
    const newState = { ...state, ...updates };
    const next = getNextStep(newState, state.currentStep);

    if (next === "outcome") {
      const outcome = determineOutcome(newState);
      localStorage.removeItem("bg_quiz_state");

      // Fire lead to API
      fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newState.email,
          phone: newState.phone,
          bmi: newState.bmi,
          quizOutcome: outcome,
          locale,
          utmSource: new URLSearchParams(window.location.search).get("utm_source"),
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
        }),
      }).catch(() => {});

      router.push(`/${locale}/quiz/result/${outcome}`);
      return;
    }

    setState({ ...newState, currentStep: next as number });
  }

  function goBack() {
    if (state.currentStep > 0) {
      setState({ ...state, currentStep: state.currentStep - 1 });
    }
  }

  // Disqualification screen
  if (state.disqualified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-brand-red text-2xl">!</span>
          </div>
          <h2 className="font-heading text-heading text-2xl font-bold mb-4">
            {locale === "es"
              ? "Este programa puede no ser adecuado para ti"
              : "This program may not be right for you"}
          </h2>
          <p className="text-body-muted mb-6">
            {locale === "es"
              ? "Basado en tus respuestas, te recomendamos hablar con nuestro equipo m\u00e9dico directamente."
              : "Based on your answers, we recommend speaking with our medical team directly."}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center bg-brand-red text-white font-heading font-semibold px-8 py-3.5 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
          >
            {locale === "es" ? "Cont\u00e1ctanos" : "Contact Us"}
          </a>
        </div>
      </div>
    );
  }

  const currentStepDef = STEPS[state.currentStep];
  if (!currentStepDef) return null;

  return (
    <div className="min-h-[60vh]">
      {/* Progress Bar */}
      <div className="w-full bg-border h-1.5">
        <div
          className="bg-brand-red h-1.5 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back button */}
        {state.currentStep > 0 && (
          <button
            onClick={goBack}
            className="text-body-muted text-sm hover:text-brand-red transition-colors mb-6 flex items-center gap-1"
          >
            <span>{"\u2190"}</span> {locale === "es" ? "Atr\u00e1s" : "Back"}
          </button>
        )}

        {/* Step content */}
        {currentStepDef.type === "question" && currentStepDef.id === "goal" && (
          <QuizStep
            question={locale === "es" ? "\u00bfCu\u00e1l es tu objetivo principal?" : "What's your primary goal?"}
            options={[
              { label: locale === "es" ? "Bajar de peso" : "Lose weight", value: "lose" },
              { label: locale === "es" ? "Mantener mi peso" : "Maintain my weight", value: "maintain" },
              { label: locale === "es" ? "Ambos" : "Both", value: "both" },
            ]}
            onSelect={(value) => advance({ goal: value })}
          />
        )}

        {currentStepDef.type === "bmi" && (
          <BMICalculator
            locale={locale}
            onComplete={(bmi, feet, inches, weight) =>
              advance({ bmi, heightFeet: feet, heightInches: inches, weight })
            }
          />
        )}

        {currentStepDef.type === "interstitial" && currentStepDef.id === "stats" && (
          <InterstitialCard
            variant="stats"
            locale={locale}
            onContinue={() => advance()}
          />
        )}

        {currentStepDef.type === "medical" && (
          <QuizStep
            question={
              locale === "es"
                ? "\u00bfAlguna de estas condiciones aplica a ti?"
                : "Do any of the following apply to you?"
            }
            subtitle={
              locale === "es"
                ? "Selecciona todas las que apliquen, o 'Ninguna'"
                : "Select all that apply, or 'None of these'"
            }
            options={[
              { label: locale === "es" ? "Actualmente embarazada o en lactancia" : "Currently pregnant or breastfeeding", value: "pregnant" },
              { label: locale === "es" ? "Diabetes Tipo 1" : "Type 1 Diabetes", value: "type1" },
              { label: locale === "es" ? "Historial de c\u00e1ncer medular de tiroides" : "History of medullary thyroid cancer", value: "thyroid" },
              { label: locale === "es" ? "Historial de pancreatitis" : "History of pancreatitis", value: "pancreatitis" },
              { label: locale === "es" ? "Ninguna de estas" : "None of these", value: "none" },
            ]}
            onSelect={(value) => {
              if (value !== "none") {
                setState({
                  ...state,
                  disqualified: true,
                  disqualifyReason: value,
                });
              } else {
                advance();
              }
            }}
          />
        )}

        {currentStepDef.type === "interstitial" && currentStepDef.id === "dr-linda" && (
          <InterstitialCard
            variant="dr-linda"
            locale={locale}
            onContinue={() => advance()}
          />
        )}

        {currentStepDef.type === "email" && (
          <EmailCapture
            locale={locale}
            onSubmit={(email, phone) => advance({ email, phone })}
          />
        )}

        {currentStepDef.type === "insurance-check" && (
          <QuizStep
            question={
              locale === "es"
                ? "\u00bfTienes seguro m\u00e9dico actualmente?"
                : "Do you currently have health insurance?"
            }
            options={[
              { label: locale === "es" ? "S\u00ed" : "Yes", value: "yes" },
              { label: locale === "es" ? "No" : "No", value: "no" },
              { label: locale === "es" ? "Prefiero no usar mi seguro" : "Prefer not to use insurance", value: "prefer-not" },
            ]}
            onSelect={(value) => advance({ hasInsurance: value })}
          />
        )}

        {currentStepDef.type === "insurance-details" && (
          <InsuranceQuestions
            locale={locale}
            onSubmit={(carrier, planType, insuranceState, probability) =>
              advance({
                insuranceCarrier: carrier,
                insurancePlanType: planType,
                insuranceState: insuranceState,
                insuranceProbability: probability,
              })
            }
          />
        )}

        {currentStepDef.type === "needles" && (
          <QuizStep
            question={
              locale === "es"
                ? "\u00bfC\u00f3mo te sientes con las inyecciones?"
                : "How do you feel about injections?"
            }
            options={[
              { label: locale === "es" ? "C\u00f3moda con inyecciones" : "Comfortable with injections", value: "comfortable" },
              { label: locale === "es" ? "Prefiero sin agujas" : "Prefer no needles", value: "no-needles" },
              { label: locale === "es" ? "Abierta a cualquiera" : "Open to either", value: "either" },
            ]}
            onSelect={(value) => advance({ needleComfort: value })}
          />
        )}

        {currentStepDef.type === "interstitial" && currentStepDef.id === "education" && (
          <InterstitialCard
            variant="education"
            locale={locale}
            onContinue={() => advance()}
          />
        )}

        {currentStepDef.type === "priority" && (
          <QuizStep
            question={
              locale === "es"
                ? "\u00bfQu\u00e9 es lo m\u00e1s importante para ti?"
                : "What matters most to you?"
            }
            options={[
              { label: locale === "es" ? "Costo mensual m\u00e1s bajo" : "Lowest monthly cost", value: "lowest-cost" },
              { label: locale === "es" ? "Medicamento de marca aprobado por FDA" : "FDA-approved branded medication", value: "fda-branded" },
              { label: locale === "es" ? "No estoy segura \u2014 mu\u00e9strame las opciones" : "Not sure \u2014 show me options", value: "not-sure" },
            ]}
            onSelect={(value) => advance({ priority: value })}
          />
        )}

        {currentStepDef.type === "branded-preference" && (
          <QuizStep
            question={
              locale === "es"
                ? "\u00bfQu\u00e9 medicamento de marca prefieres?"
                : "Which branded medication do you prefer?"
            }
            subtitle={
              locale === "es"
                ? "Pagas $45 por la receta + el costo del medicamento en la farmacia"
                : "You pay $45 for the prescription + medication cost at the pharmacy"
            }
            options={[
              { label: locale === "es" ? "Wegovy Pastilla (~$149-299/mes)" : "Wegovy Pill (~$149-299/mo)", value: "wegovy-pill" },
              { label: locale === "es" ? "Wegovy Inyecci\u00f3n (~$349/mes)" : "Wegovy Injection (~$349/mo)", value: "wegovy-injection" },
              { label: locale === "es" ? "Zepbound KwikPen (~$299-449/mes)" : "Zepbound KwikPen (~$299-449/mo)", value: "zepbound-kwikpen" },
              { label: locale === "es" ? "Zepbound Vial (~$299-449/mes)" : "Zepbound Vial (~$299-449/mo)", value: "zepbound-vial" },
            ]}
            onSelect={(value) => advance({ brandedPreference: value })}
          />
        )}
      </div>
    </div>
  );
}
