"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Calendar, RotateCcw, AlertTriangle, ChevronLeft } from "lucide-react";
import { QuizStep } from "./QuizStep";
import { InterstitialCard } from "./InterstitialCard";
import { EmailCapture } from "./EmailCapture";
import { StateSelect } from "./StateSelect";

export type QuizState = {
  currentStep: number;
  // Phase 1 — Screening
  state: string | null;
  disqualified: boolean;
  disqualifyReason: string | null;
  // Phase 2 — Routing
  weightGoal: string | null;       // Q3: 10-20 / 20-40 / 40-60 / 60plus
  story: string | null;            // Q4: experienced / first-timer / educated / overwhelmed
  needleComfort: string | null;    // Q5: fine / prefer-avoid / absolutely-not
  insuranceInterest: string | null;// Q6: yes / no / not-sure
  priority: string | null;         // Q7: affordable / brand-name / best-results
  timeline: string | null;         // Q8: this-week / next-month / researching / waiting
  // Phase 3 — Capture
  firstName: string | null;
  email: string | null;
  phone: string | null;
  insuranceType: string | null;    // Q10: employer / private / medicaid-medicare / uninsured / prefer-not-say
};

const initialState: QuizState = {
  currentStep: 0,
  state: null,
  disqualified: false,
  disqualifyReason: null,
  weightGoal: null,
  story: null,
  needleComfort: null,
  insuranceInterest: null,
  priority: null,
  timeline: null,
  firstName: null,
  email: null,
  phone: null,
  insuranceType: null,
};

type StepId =
  | "hook"
  | "state"
  | "medical"
  | "weight-goal"
  | "story"
  | "card-education"
  | "needles"
  | "insurance-interest"
  | "priority"
  | "card-trust"
  | "timeline"
  | "card-stats"
  | "email"
  | "insurance-type";

const STEPS: StepId[] = [
  "hook",
  "state",
  "medical",
  "weight-goal",
  "story",
  "card-education",
  "needles",
  "insurance-interest",
  "priority",
  "card-trust",
  "timeline",
  "card-stats",
  "email",
  "insurance-type",
];

function determineOutcome(state: QuizState, isOral: boolean = false): string {
  // Oral path: outcome driven entirely by oral-specific priority choice
  if (isOral) {
    if (state.priority === "oral-appetite") return "oral-appetite";
    if (state.priority === "oral-metabolic") return "oral-metabolic";
    if (state.priority === "oral-wegovy") return "oral-wegovy";
    return "oral-appetite";
  }

  // Hard override: absolutely no needles → oral (unless brand-name → branded)
  if (state.needleComfort === "absolutely-not") {
    if (state.priority === "brand-name") return "branded";
    return "oral";
  }

  // Insurance path
  if (
    state.insuranceInterest === "yes" &&
    state.insuranceType &&
    state.insuranceType !== "medicaid-medicare" &&
    state.insuranceType !== "uninsured" &&
    state.insuranceType !== "prefer-not-say"
  ) {
    return "insurance";
  }

  // Brand-name path
  if (state.priority === "brand-name") return "branded";

  // Oral preference
  if (state.needleComfort === "prefer-avoid") return "oral";

  // Default: compounded
  return "compounded";
}

const TOTAL_QUESTIONS = 10; // Q1–Q10 (not counting cards or hook)
const STEP_TO_QNUM: Partial<Record<StepId, number>> = {
  "state": 1,
  "medical": 2,
  "weight-goal": 3,
  "story": 4,
  "needles": 5,
  "insurance-interest": 6,
  "priority": 7,
  "timeline": 8,
  "email": 9,
  "insurance-type": 10,
};

const ORAL_STEP_TO_QNUM: Partial<Record<StepId, number>> = {
  "state": 1, "medical": 2, "weight-goal": 3, "story": 4,
  "priority": 5, "timeline": 6, "email": 7,
};

export function QuizEngine({ forceReset = false, isBrandPath = false, isOralPath = false }: { forceReset?: boolean; isBrandPath?: boolean; isOralPath?: boolean }) {
  const [state, setState] = useState<QuizState>(initialState);
  const [showLanding, setShowLanding] = useState(true);
  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const isEs = locale === "es";

  // Handle ?reset=true bypass (admin/testing)
  useEffect(() => {
    if (forceReset) {
      localStorage.removeItem("bg_quiz_state_v2");
      setState(initialState);
      setShowLanding(false);
      setState({ ...initialState, currentStep: 1 });
      return;
    }
    // Oral and brand paths always start fresh at the landing page —
    // cached state from a different flow must not bleed through
    if (isOralPath || isBrandPath) {
      localStorage.removeItem("bg_quiz_state_v2");
      return;
    }
    const saved = localStorage.getItem("bg_quiz_state_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        setShowLanding(false);
      } catch {}
    }
  }, [forceReset, isOralPath, isBrandPath]);

  useEffect(() => {
    if (state.currentStep > 0) {
      localStorage.setItem("bg_quiz_state_v2", JSON.stringify(state));
    }
  }, [state]);

  // Oral path: if cached state restored at a skipped step, auto-advance to priority
  useEffect(() => {
    if (!isOralPath || showLanding || state.disqualified) return;
    const stepId = STEPS[state.currentStep];
    if (stepId === "card-education" || stepId === "needles" || stepId === "insurance-interest") {
      setState((prev) => ({
        ...prev,
        needleComfort: "absolutely-not",
        insuranceInterest: "no",
        currentStep: STEPS.indexOf("priority"),
      }));
    }
  }, [isOralPath, state.currentStep, showLanding, state.disqualified]);

  const currentStepId = STEPS[state.currentStep];
  const qNum = isOralPath ? ORAL_STEP_TO_QNUM[currentStepId] : STEP_TO_QNUM[currentStepId];
  const totalQuestions = isOralPath ? 7 : TOTAL_QUESTIONS;
  const progress = Math.round(((state.currentStep + 1) / STEPS.length) * 100);

  function advance(updates: Partial<QuizState> = {}) {
    const newState = { ...state, ...updates, currentStep: state.currentStep + 1 };

    // Brand (Cash Pay) path: skip insurance-interest + priority — patient already chose brand, comparison shown on result page
    if (isBrandPath && STEPS[newState.currentStep] === "insurance-interest") {
      const cardTrustIdx = STEPS.indexOf("card-trust");
      setState({ ...newState, insuranceInterest: "no", priority: "brand-name", currentStep: cardTrustIdx });
      return;
    }
    // Safety: also skip priority individually in case we land on it via other paths
    if (isBrandPath && STEPS[newState.currentStep] === "priority") {
      setState({ ...newState, priority: "brand-name", currentStep: newState.currentStep + 1 });
      return;
    }

    // Oral path: skip card-education, needles, insurance-interest — jump straight to priority
    if (isOralPath && STEPS[newState.currentStep] === "card-education") {
      setState({
        ...newState,
        needleComfort: "absolutely-not",
        insuranceInterest: "no",
        currentStep: STEPS.indexOf("priority"),
      });
      return;
    }

    // Skip insurance-type if not interested in insurance
    if (STEPS[newState.currentStep] === "insurance-type") {
      if (newState.insuranceInterest !== "yes") {
        // Skip this step and go to outcome
        finalize(newState);
        return;
      }
    }

    if (newState.currentStep >= STEPS.length) {
      finalize(newState);
      return;
    }

    setState(newState);
  }

  function finalize(finalState: QuizState) {
    const outcome = determineOutcome(finalState, isOralPath);
    localStorage.removeItem("bg_quiz_state_v2");

    fetch("/api/quiz-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: finalState.email,
        firstName: finalState.firstName,
        phone: finalState.phone,
        quizOutcome: outcome,
        locale,
        weightGoal: finalState.weightGoal,
        story: finalState.story,
        timeline: finalState.timeline,
        insuranceInterest: finalState.insuranceInterest,
        insuranceType: finalState.insuranceType,
        utmSource: new URLSearchParams(window.location.search).get("utm_source"),
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium"),
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign"),
      }),
    }).catch(() => {});

    router.push(`/${locale}/quiz/result/${outcome}`);
  }

  function goBack() {
    if (state.currentStep > 0) {
      const prevStep = state.currentStep - 1;
      // Brand path: skip back over both priority and insurance-interest — land on needles
      if (isBrandPath && (STEPS[prevStep] === "priority" || STEPS[prevStep] === "insurance-interest")) {
        const needlesIdx = STEPS.indexOf("needles");
        setState({ ...state, currentStep: needlesIdx });
        return;
      }
      // Oral path: skip back over insurance-interest, needles, or card-education — land on story
      if (isOralPath && (STEPS[prevStep] === "card-education" || STEPS[prevStep] === "needles" || STEPS[prevStep] === "insurance-interest")) {
        const storyIdx = STEPS.indexOf("story");
        setState({ ...state, currentStep: storyIdx });
        return;
      }
      setState({ ...state, currentStep: prevStep });
    }
  }

  // Retake confirmation modal
  if (state.disqualified && showRetakeConfirm) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="font-heading text-heading text-xl font-bold mb-4">
            {isEs
              ? "Antes de retomar el quiz"
              : "Before you retake the quiz"}
          </h2>
          <p className="text-body-muted text-sm leading-relaxed mb-8">
            {isEs
              ? "¿Estás segura? Si alguna de las condiciones de la pantalla anterior aplica a ti, nuestro equipo médico puede revisar tu situación específica personalmente. El quiz está diseñado para protegerte, no para bloquearte."
              : "Are you sure? If any of the conditions on the previous screen apply to you, our medical team can review your specific situation personally. The quiz is designed to protect you, not block you."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowRetakeConfirm(false)}
              className="inline-flex items-center justify-center gap-2 border border-border text-heading font-heading font-semibold px-6 py-3 rounded-pill hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {isEs ? "Regresar" : "Go Back"}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("bg_quiz_state_v2");
                setState({ ...initialState, currentStep: 1 });
                setShowLanding(false);
                setShowRetakeConfirm(false);
              }}
              className="inline-flex items-center justify-center gap-2 bg-brand-red text-white font-heading font-semibold px-6 py-3 rounded-pill hover:bg-brand-red-hover transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {isEs ? "Retomar el Quiz" : "Retake Quiz"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Disqualification screen — branching paths
  if (state.disqualified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 bg-brand-pink-soft rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-red/20">
            <AlertTriangle className="w-6 h-6 text-brand-red" />
          </div>
          <h2 className="font-heading text-heading text-2xl font-bold mb-4">
            {isEs
              ? "Basado en tus respuestas, GLP-1 puede requerir una revisión médica primero."
              : "Based on your answers, GLP-1 may require a medical review first."}
          </h2>
          <p className="text-body-muted mb-3 text-sm leading-relaxed">
            {isEs
              ? "Ciertas condiciones médicas requieren evaluación adicional antes de iniciar la terapia GLP-1. Esto no es una determinación médica final — es una pantalla de seguridad para protegerte."
              : "Certain medical conditions require additional evaluation before starting GLP-1 therapy. This isn't a final medical determination — it's a safety screen to protect you."}
          </p>
          <p className="text-body-muted mb-8 text-sm">
            {isEs
              ? "Nuestro equipo de médicos puede revisar tu situación específica personalmente."
              : "Our physician team can review your specific situation personally."}
          </p>

          {/* Primary CTA */}
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center justify-center gap-2 w-full bg-brand-red text-white font-heading font-semibold px-8 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base text-base mb-4"
          >
            <Calendar className="w-5 h-5" />
            {isEs ? "Agendar una Consulta" : "Schedule a Consultation"}
          </a>

          {/* Secondary retake link */}
          <button
            onClick={() => setShowRetakeConfirm(true)}
            className="inline-flex items-center justify-center gap-1.5 text-body-muted text-sm hover:text-brand-red transition-colors underline underline-offset-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isEs
              ? "Puede que haya respondido incorrectamente — retomar el quiz"
              : "I may have answered incorrectly — retake the quiz"}
          </button>

          <p className="text-body-muted text-xs mt-6 italic">
            {isEs
              ? "Tus respuestas son anónimas y no se almacenan con tu email. Esto no es un diagnóstico."
              : "Your answers are anonymous and are not stored with your email. This is not a diagnosis."}
          </p>
        </div>
      </div>
    );
  }

  // Landing hook
  if (showLanding) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest mb-4">
            {isEs ? "Quiz de 2 Minutos" : "2-Minute Quiz"}
          </p>
          <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {isEs
              ? "¿Cuál es el mejor programa de pérdida de peso para tu cuerpo, presupuesto y estilo de vida?"
              : "What's the best weight loss program for YOUR body, budget, and lifestyle?"}
          </h1>
          <p className="text-body-muted text-lg mb-8 leading-relaxed">
            {isEs
              ? "Responde unas preguntas rápidas. Obtén una recomendación personalizada de una médica que ha estado exactamente donde tú estás."
              : "Answer a few quick questions. Get a personalized recommendation from a doctor who's been exactly where you are."}
          </p>
          <button
            onClick={() => { setShowLanding(false); setState({ ...initialState, currentStep: 1 }); }}
            className="bg-brand-red text-white font-heading font-semibold px-12 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base text-lg"
          >
            {isEs ? "Tomar el Quiz de 2 Minutos →" : "Take the 2-Minute Quiz →"}
          </button>
          <p className="text-body-muted text-xs mt-4">
            {isEs ? "Gratis. Sin registro. Menos de 2 minutos." : "Free. No login required. Takes less than 2 minutes."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh]">
      {/* Progress bar */}
      <div className="w-full bg-border h-1.5">
        <div
          className="bg-brand-red h-1.5 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Question counter + back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={state.currentStep > 1 ? goBack : () => setShowLanding(true)}
            className="text-body-muted text-sm hover:text-brand-red transition-colors flex items-center gap-1"
          >
            ← {isEs ? "Atrás" : "Back"}
          </button>
          {qNum && (
            <span className="text-body-muted text-xs font-semibold uppercase tracking-wide">
              {isEs ? `Pregunta ${qNum} de ${totalQuestions}` : `Question ${qNum} of ${totalQuestions}`}
            </span>
          )}
        </div>

        {/* Step content */}
        {currentStepId === "state" && (
          <StateSelect locale={locale} onSelect={(s) => advance({ state: s })} />
        )}

        {currentStepId === "medical" && (
          <QuizStep
            question={isEs ? "¿Alguna de las siguientes condiciones aplica a ti?" : "Do any of the following apply to you?"}
            subtitle={isEs ? "Selecciona todas las que apliquen" : "Select all that apply, or choose 'None of the above'"}
            multiSelect
            clearValue="none"
            options={[
              { label: isEs ? "Diabetes Tipo 1" : "Type 1 diabetes", value: "type1", isDisqualify: true },
              { label: isEs ? "Pancreatitis crónica" : "Chronic pancreatitis", value: "pancreatitis", isDisqualify: true },
              { label: isEs ? "Gastroparesis (parálisis gástrica)" : "Gastroparesis (stomach paralysis)", value: "gastroparesis", isDisqualify: true },
              { label: isEs ? "MEN II (Neoplasia Endocrina Múltiple tipo 2)" : "MEN II (Multiple Endocrine Neoplasia type 2)", value: "men2", isDisqualify: true },
              { label: isEs ? "Historial personal o familiar de cáncer medular de tiroides" : "Personal or family history of medullary thyroid cancer", value: "thyroid", isDisqualify: true },
              { label: isEs ? "Actualmente embarazada o en lactancia" : "Currently pregnant or breastfeeding", value: "pregnant", isDisqualify: true },
              { label: isEs ? "Ninguna de las anteriores aplica a mí" : "None of the above apply to me", value: "none", isClear: true },
            ]}
            onSelect={(value) => {
              if (value === "none") {
                advance();
              } else {
                setState({ ...state, disqualified: true, disqualifyReason: value });
              }
            }}
          />
        )}

        {currentStepId === "weight-goal" && (
          <QuizStep
            question={isEs ? "¿Cuánto peso estás buscando perder?" : "How much weight are you looking to lose?"}
            options={[
              { label: isEs ? "10–20 lbs" : "10–20 lbs", sub: isEs ? '"Quiero bajar una o dos tallas"' : '"I want to drop a size or two"', value: "10-20" },
              { label: isEs ? "20–40 lbs" : "20–40 lbs", sub: isEs ? '"Tengo una cantidad considerable que perder"' : '"I\'ve got a solid chunk to lose"', value: "20-40" },
              { label: isEs ? "40–60 lbs" : "40–60 lbs", sub: isEs ? '"Estoy lista para una transformación real"' : '"I\'m ready for a real transformation"', value: "40-60" },
              { label: isEs ? "60+ lbs" : "60+ lbs", sub: isEs ? '"Necesito apoyo significativo"' : '"I need significant support"', value: "60plus" },
            ]}
            onSelect={(value) => advance({ weightGoal: value })}
          />
        )}

        {currentStepId === "story" && (
          <QuizStep
            question={isEs ? "¿Cuál de estas se parece más a tu historia?" : "Which of these feels most like your story?"}
            options={[
              {
                label: isEs
                  ? '"He probado GLP-1 antes pero paré — y el peso volvió."'
                  : '"I\'ve tried GLP-1s before but stopped — and the weight came back."',
                value: "experienced",
              },
              {
                label: isEs
                  ? '"He probado cada dieta, cada programa, todo EXCEPTO medicamentos."'
                  : '"I\'ve tried every diet, every program, everything EXCEPT medication."',
                value: "first-timer",
              },
              {
                label: isEs
                  ? '"Sé que estos medicamentos funcionan — solo necesito encontrar el correcto al precio correcto."'
                  : '"I know these medications work — I just need help finding the right one at the right price."',
                value: "educated",
              },
              {
                label: isEs
                  ? '"Apenas estoy empezando a investigar esto — realmente no sé por dónde empezar."'
                  : '"I\'m just starting to look into this — I don\'t really know where to begin."',
                value: "overwhelmed",
              },
            ]}
            onSelect={(value) => advance({ story: value })}
          />
        )}

        {currentStepId === "card-education" && !isOralPath && (
          <InterstitialCard variant="education" locale={locale} onContinue={() => advance()} isBrandPath={isBrandPath} />
        )}

        {currentStepId === "needles" && !isOralPath && (
          <QuizStep
            question={isEs ? "¿Cómo te sientes con las auto-inyecciones?" : "How do you feel about self-injections?"}
            options={[
              {
                label: isEs ? '"Totalmente bien — las agujas no me molestan"' : '"Totally fine — needles don\'t bother me"',
                value: "fine",
              },
              {
                label: isEs ? '"Preferiría evitarlas si es posible"' : '"I\'d prefer to avoid them if possible"',
                value: "prefer-avoid",
              },
              {
                label: isEs ? '"Absolutamente no — sin agujas"' : '"Absolutely not — no needles"',
                value: "absolutely-not",
              },
            ]}
            onSelect={(value) => advance({ needleComfort: value })}
          />
        )}

        {currentStepId === "insurance-interest" && !isOralPath && (
          <QuizStep
            question={
              isEs
                ? "¿Estás interesada en usar tu seguro médico para cubrir tu medicamento?"
                : "Are you interested in using health insurance to cover your medication?"
            }
            options={[
              {
                label: isEs
                  ? '"Sí — me encantaría ver si mi seguro cubre esto"'
                  : '"Yes — I\'d love to see if my insurance covers this"',
                value: "yes",
              },
              {
                label: isEs
                  ? '"No — prefiero pagar de mi bolsillo y evitar el proceso del seguro"'
                  : '"No — I\'d rather pay out of pocket and skip the insurance hassle"',
                value: "no",
              },
              {
                label: isEs
                  ? '"No estoy segura — muéstrame todas mis opciones"'
                  : '"I\'m not sure — show me all my options"',
                value: "not-sure",
              },
            ]}
            onSelect={(value) => advance({ insuranceInterest: value })}
          />
        )}

        {currentStepId === "priority" && !isOralPath && (
          <QuizStep
            question={
              isEs
                ? "Cuando se trata de tu medicamento, ¿qué importa más?"
                : "When it comes to your medication, what matters most?"
            }
            options={[
              {
                label: isEs ? '"Dame la opción más asequible"' : '"Give me the most affordable option"',
                sub: isEs
                  ? "Quiero medicamento efectivo al menor costo mensual."
                  : "I want effective medication at the lowest monthly cost.",
                value: "affordable",
              },
              {
                label: isEs ? '"Quiero el medicamento de marca exacto"' : '"I want the exact brand-name medication"',
                sub: isEs ? "Wegovy, Zepbound — los que he escuchado." : "Wegovy, Zepbound — the ones I've been hearing about.",
                value: "brand-name",
              },
              {
                label: isEs ? '"Quiero lo que me dará los mejores resultados"' : '"I want whatever\'s going to get me the best results"',
                sub: isEs
                  ? "Emparéjame con la opción más efectiva para mis objetivos."
                  : "Match me to the most effective option for my goals.",
                value: "best-results",
              },
            ]}
            onSelect={(value) => advance({ priority: value })}
          />
        )}

        {currentStepId === "priority" && isOralPath && (
          <QuizStep
            question={
              isEs
                ? "¿Cuál de estas describe mejor tu objetivo principal?"
                : "Which of these best describes your main goal?"
            }
            options={[
              {
                label: isEs
                  ? '"Control del apetito — reducir el hambre y la resistencia a la insulina"'
                  : '"Appetite control — reduce hunger and insulin resistance"',
                sub: isEs
                  ? "Ideal para PCOS, prediabetes o hambre constante."
                  : "Ideal for PCOS, pre-diabetes, or persistent hunger.",
                value: "oral-appetite",
              },
              {
                label: isEs
                  ? '"Reinicio metabólico — calmar los antojos y la inflamación"'
                  : '"Metabolic reset — quiet cravings and reduce inflammation"',
                sub: isEs
                  ? "Ideal para comer emocionalmente o antojos frecuentes."
                  : "Ideal for emotional eating or frequent food cravings.",
                value: "oral-metabolic",
              },
              {
                label: isEs
                  ? '"Quiero la pastilla oral de Wegovy aprobada por la FDA"'
                  : '"I want the FDA-approved oral Wegovy pill"',
                sub: isEs
                  ? "Semaglutide oral — la misma eficacia, sin inyecciones. Se paga en la farmacia."
                  : "Oral semaglutide — same proven efficacy, no injections. Filled at your pharmacy.",
                value: "oral-wegovy",
              },
            ]}
            onSelect={(value) => advance({ priority: value })}
          />
        )}

        {currentStepId === "card-trust" && (
          <InterstitialCard variant="trust" locale={locale} onContinue={() => advance()} />
        )}

        {currentStepId === "timeline" && (
          <QuizStep
            question={isEs ? "¿Cuándo estás pensando en comenzar?" : "How soon are you looking to get started?"}
            options={[
              {
                label: isEs ? '"Esta semana — estoy lista ahora"' : '"This week — I\'m ready now"',
                value: "this-week",
              },
              {
                label: isEs ? '"Dentro del próximo mes"' : '"Within the next month"',
                value: "next-month",
              },
              {
                label: isEs ? '"Estoy investigando y comparando opciones"' : '"I\'m researching and comparing options"',
                value: "researching",
              },
              {
                label: isEs ? '"Estoy esperando el momento correcto"' : '"I\'m waiting for the right moment"',
                value: "waiting",
              },
            ]}
            onSelect={(value) => advance({ timeline: value })}
          />
        )}

        {currentStepId === "card-stats" && (
          <InterstitialCard variant="stats" locale={locale} onContinue={() => advance()} />
        )}

        {currentStepId === "email" && (
          <EmailCapture
            locale={locale}
            onSubmit={(email, firstName, phone) => advance({ email, firstName, phone })}
          />
        )}

        {currentStepId === "insurance-type" && (
          <QuizStep
            question={
              isEs
                ? "Una última cosa — ¿qué tipo de seguro tienes actualmente?"
                : "One last thing — do you currently have health insurance?"
            }
            options={[
              {
                label: isEs ? '"Sí — a través de mi empleador"' : '"Yes — through my employer"',
                value: "employer",
              },
              {
                label: isEs ? '"Sí — tengo seguro privado o del mercado"' : '"Yes — I have private/marketplace insurance"',
                value: "private",
              },
              {
                label: isEs ? '"Sí — Medicaid/Medicare"' : '"Yes — Medicaid/Medicare"',
                value: "medicaid-medicare",
              },
              {
                label: isEs ? '"No — no tengo seguro / pago de mi bolsillo"' : '"No — I\'m uninsured or self-pay"',
                value: "uninsured",
              },
              {
                label: isEs ? '"No estoy segura / prefiero no decir"' : '"I\'m not sure / I\'d rather not say"',
                value: "prefer-not-say",
              },
            ]}
            onSelect={(value) => {
              const updates = { insuranceType: value };
              finalize({ ...state, ...updates });
            }}
          />
        )}
      </div>
    </div>
  );
}
