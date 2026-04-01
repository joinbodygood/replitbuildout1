"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  Check,
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  HeartHandshake,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ── Types ─────────────────────────────────────────────────────────────────
type Step = "intro" | "questions" | "safety" | "email" | "processing";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  reassurance?: string;
  options: Option[];
  multi?: boolean;
  isSafetyScreen?: boolean;
  hasConditionalText?: boolean;
  conditionalTextTrigger?: string;
  conditionalTextPlaceholder?: string;
}

// ── Questions ─────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: "concern",
    question: "What brings you here today?",
    subtitle: "Pick the one that feels most like you.",
    reassurance: "You're not alone — many women experience this. There are no wrong answers.",
    options: [
      { value: "dryness",        label: "Vaginal dryness or discomfort",            sublabel: "Dryness during intimacy, irritation, or burning" },
      { value: "yeast",          label: "Recurrent yeast infections",               sublabel: "Itching, thick discharge, or frequent flare-ups" },
      { value: "bv",             label: "Bacterial vaginosis (BV)",                 sublabel: "Unusual odor, thin grayish or white discharge" },
      { value: "uti-prevention", label: "UTI prevention",                           sublabel: "I keep getting UTIs and want to stop the cycle" },
      { value: "libido",         label: "Low libido or decreased sexual desire",    sublabel: "Changes in interest, arousal, or sensitivity" },
      { value: "hormonal",       label: "Hormonal changes",                         sublabel: "Perimenopause, menopause, or irregular periods" },
      { value: "general",        label: "General intimate wellness — help me figure it out", sublabel: "I'm not quite sure what I need" },
    ],
  },
  {
    id: "duration",
    question: "How long have you been experiencing this?",
    reassurance: "Understanding timing helps us find the right approach for your body.",
    options: [
      { value: "under-1mo",   label: "Less than 1 month" },
      { value: "1-3mo",       label: "1–3 months" },
      { value: "3-6mo",       label: "3–6 months" },
      { value: "6mo-plus",    label: "6+ months" },
      { value: "on-and-off",  label: "On and off for years" },
    ],
  },
  {
    id: "severity",
    question: "How much is this affecting your daily life or relationships?",
    reassurance: "There's no right or wrong here — we just want to understand your experience.",
    options: [
      { value: "mild",        label: "Mildly — it's manageable",                 sublabel: "I notice it, but it hasn't disrupted my routine" },
      { value: "moderate",    label: "Moderately — it's becoming a problem",      sublabel: "It's starting to affect my confidence or comfort" },
      { value: "significant", label: "Significantly — it's affecting my quality of life", sublabel: "It's impacting my relationships, sleep, or wellbeing" },
    ],
  },
  {
    id: "previous_treatments",
    question: "Have you tried anything for this before?",
    subtitle: "Select all that apply.",
    reassurance: "Knowing what you've already tried helps us recommend something more effective.",
    multi: true,
    options: [
      { value: "otc",            label: "Over-the-counter products",      sublabel: "Creams, supplements, wipes, or gels" },
      { value: "prescription",   label: "Prescription medication" },
      { value: "hormone-therapy",label: "Hormone therapy (HRT)" },
      { value: "home-remedies",  label: "Home remedies or lifestyle changes" },
      { value: "nothing",        label: "Nothing — this is my first time seeking help" },
    ],
  },
  {
    id: "medications",
    question: "Are you currently taking any medications?",
    subtitle: "Including birth control, hormone therapy, or any other prescriptions.",
    reassurance: "This helps our physician team check for any important interactions.",
    hasConditionalText: true,
    conditionalTextTrigger: "yes",
    conditionalTextPlaceholder: "e.g. birth control pill, metformin, levothyroxine…",
    options: [
      { value: "yes", label: "Yes — I'll share the details below" },
      { value: "no",  label: "No, I'm not currently taking any medications" },
    ],
  },
  {
    id: "life_stage",
    question: "Which best describes where you are right now?",
    reassurance: "This helps us understand your hormonal context — completely normal wherever you are.",
    options: [
      { value: "pre-menopausal",  label: "Pre-menopausal — regular cycles",             sublabel: "My periods are regular and predictable" },
      { value: "peri",            label: "Perimenopause — cycles becoming irregular",    sublabel: "Changes in frequency, flow, or timing" },
      { value: "menopause",       label: "Menopause — no period for 12+ months" },
      { value: "post-menopause",  label: "Post-menopause" },
      { value: "prefer-not",      label: "Prefer not to say" },
    ],
  },
  {
    id: "safety_screen",
    question: "Do any of the following apply to you?",
    subtitle: "Select all that apply. Your safety is our first priority.",
    multi: true,
    isSafetyScreen: true,
    options: [
      { value: "pregnant",            label: "Currently pregnant or breastfeeding" },
      { value: "cancer-history",      label: "History of hormone-sensitive cancer", sublabel: "Breast, ovarian, or uterine cancer" },
      { value: "unexplained-bleeding",label: "Currently experiencing unexplained vaginal bleeding" },
      { value: "none",               label: "None of these apply to me" },
    ],
  },
  {
    id: "treatment_preference",
    question: "Do you have a preference for how you'd like to use your treatment?",
    reassurance: "Every option is equally effective — this is purely your preference.",
    options: [
      { value: "topical",       label: "Topical cream or gel",             sublabel: "Applied directly — fast-acting and localized" },
      { value: "oral",          label: "Oral medication",                   sublabel: "Taken by mouth — convenient and discreet" },
      { value: "no-preference", label: "No preference — whatever works best", sublabel: "Our physician will choose the optimal form for you" },
    ],
  },
];

const TOTAL_QUESTIONS = QUESTIONS.length;

// ── Outcome logic ─────────────────────────────────────────────────────────
function getOutcome(answers: Record<string, string | string[]>): string {
  const concern   = answers.concern as string;
  const duration  = answers.duration as string;
  const lifeStage = answers.life_stage as string;

  if (concern === "uti-prevention") return "prevention";

  if (concern === "yeast") {
    return duration === "on-and-off" ? "prevention" : "acute-yeast";
  }
  if (concern === "bv") {
    return duration === "on-and-off" ? "prevention" : "acute-bv";
  }

  if (concern === "dryness" || concern === "hormonal") return "vaginal-dryness";
  if (concern === "libido") return "intimacy";

  if (concern === "general") {
    if (["peri", "menopause", "post-menopause"].includes(lifeStage ?? "")) {
      return "vaginal-dryness";
    }
    return "intimacy";
  }

  return "intimacy";
}

// ── Component ─────────────────────────────────────────────────────────────
export function FeminineHealthQuiz() {
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep]               = useState<Step>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers]         = useState<Record<string, string | string[]>>({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [medicationDetail, setMedicationDetail] = useState("");
  const [firstName, setFirstName]     = useState("");
  const [email, setEmail]             = useState("");
  const [emailError, setEmailError]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[questionIndex];
  const isMedQuestion   = currentQuestion?.hasConditionalText;
  const showTextInput   = isMedQuestion && selectedValues.includes(currentQuestion.conditionalTextTrigger ?? "yes");

  // Progress: 0 at intro, scales through questions, 90 at email, 100 at processing
  const progress =
    step === "intro"      ? 0 :
    step === "questions"  ? Math.round(((questionIndex + 1) / (TOTAL_QUESTIONS + 1)) * 88) :
    step === "safety"     ? 88 :
    step === "email"      ? 92 :
    100;

  // ── Navigation ──────────────────────────────────────────────────────────
  function handleBack() {
    if (step === "email") { setStep("questions"); return; }
    if (step === "safety") { setStep("questions"); return; }
    if (step === "questions") {
      if (questionIndex === 0) { setStep("intro"); }
      else {
        setQuestionIndex((i) => i - 1);
        setSelectedValues([]);
      }
    }
  }

  function advanceQuestion(newAnswers: Record<string, string | string[]>) {
    const nextIndex = questionIndex + 1;
    if (nextIndex < QUESTIONS.length) {
      setQuestionIndex(nextIndex);
      setSelectedValues([]);
    } else {
      setStep("email");
    }
    setAnswers(newAnswers);
  }

  // ── Single-select click ──────────────────────────────────────────────────
  function handleOptionClick(value: string) {
    const q = currentQuestion;
    if (!q) return;

    if (q.multi || q.hasConditionalText) {
      // Don't auto-advance for multi-select or conditional-text questions
      if (q.multi) {
        setSelectedValues((prev) =>
          prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
      } else {
        // hasConditionalText single-select
        setSelectedValues([value]);
        if (value !== (q.conditionalTextTrigger ?? "yes")) {
          // "No" selected — auto-advance
          const newAnswers = { ...answers, [q.id]: value };
          setTimeout(() => advanceQuestion(newAnswers), 200);
        }
      }
      return;
    }

    // Regular single-select — auto-advance
    const newAnswers = { ...answers, [q.id]: value };
    setSelectedValues([value]);
    setTimeout(() => advanceQuestion(newAnswers), 200);
  }

  // ── Multi / conditional continue ────────────────────────────────────────
  function handleContinue() {
    const q = currentQuestion;
    if (!q) return;

    if (q.isSafetyScreen) {
      const hasTrigger = selectedValues.some((v) => v !== "none");
      if (hasTrigger) {
        setStep("safety");
        return;
      }
      // "None of these apply" or empty → safe to continue
      const newAnswers = { ...answers, [q.id]: selectedValues };
      advanceQuestion(newAnswers);
      return;
    }

    if (q.hasConditionalText) {
      const newAnswers = {
        ...answers,
        [q.id]: selectedValues[0] ?? "no",
        medications_detail: medicationDetail,
      };
      advanceQuestion(newAnswers);
      return;
    }

    if (q.multi) {
      if (selectedValues.length === 0) return;
      const newAnswers = { ...answers, [q.id]: selectedValues };
      advanceQuestion(newAnswers);
    }
  }

  // ── Email submit ─────────────────────────────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsSubmitting(true);
    setStep("processing");

    const outcome = getOutcome(answers);

    try {
      await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || null,
          quizOutcome: `feminine-health:${outcome}`,
          locale,
        }),
      });
    } catch {
      // non-blocking
    }

    await new Promise((r) => setTimeout(r, 1400));
    const qp = new URLSearchParams({
      concern:    (answers.concern as string) ?? "",
      life_stage: (answers.life_stage as string) ?? "",
      severity:   (answers.severity as string) ?? "",
      preference: (answers.treatment_preference as string) ?? "",
      duration:   (answers.duration as string) ?? "",
    });
    router.push(`/${locale}/quiz/feminine-health/result/${outcome}?${qp.toString()}`);
  }

  // ── Shared header (progress + back) ─────────────────────────────────────
  function QuizHeader({ showBack = true }: { showBack?: boolean }) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-brand-red h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[#55575A] text-sm mb-5 hover:text-[#0C0D0F] transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INTRO
  // ─────────────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              Feminine Health
            </div>

            <h1 className="font-heading text-[#0C0D0F] text-3xl md:text-4xl font-bold mb-4 leading-snug">
              You deserve support that actually understands your body.
            </h1>

            <p className="text-[#55575A] text-base md:text-lg mb-6 leading-relaxed max-w-md mx-auto">
              This quiz helps our physician team understand your intimate health needs so they can recommend the right solution. Your answers are completely confidential — and there are no wrong answers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              {[
                { icon: Lock,         text: "100% confidential" },
                { icon: ShieldCheck,  text: "Physician-reviewed" },
                { icon: HeartHandshake, text: "No judgment, ever" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-[#55575A] justify-center">
                  <Icon size={15} className="text-brand-red flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep("questions")}
              size="lg"
              variant="primary"
              className="rounded-full px-10"
            >
              Begin — takes about 3 minutes <ArrowRight size={16} className="ml-1" />
            </Button>
            <p className="text-[#AAAAAA] text-sm mt-4">Free · No login required</p>
          </div>
        </Container>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAFETY INTERSTITIAL
  // ─────────────────────────────────────────────────────────────────────────
  if (step === "safety") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-brand-red/10 flex items-center justify-center mx-auto mb-5">
              <HeartHandshake size={28} className="text-brand-red" />
            </div>

            <h2 className="font-heading text-[#0C0D0F] text-2xl font-bold mb-3">
              Your safety comes first.
            </h2>

            <p className="text-[#55575A] text-[15px] leading-relaxed mb-3">
              Based on what you shared, we want to make sure you receive the most appropriate care. For your safety, we recommend speaking directly with our physician team before proceeding.
            </p>
            <p className="text-[#55575A] text-[14px] leading-relaxed mb-8">
              This is not a reason to worry — our doctors are here to support you and will review your full situation personally.
            </p>

            <Button
              onClick={() => router.push(`/${locale}/contact`)}
              size="lg"
              variant="primary"
              className="rounded-full px-8 w-full mb-3"
            >
              <Phone size={16} className="mr-2" />
              Schedule a Consultation
            </Button>

            <button
              onClick={handleBack}
              className="text-sm text-[#55575A] hover:text-[#0C0D0F] transition-colors"
            >
              Go back to the quiz
            </button>
          </div>
        </Container>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PROCESSING
  // ─────────────────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="text-center max-w-md mx-auto">
            <Loader2 className="animate-spin mx-auto mb-6 text-brand-red" size={40} />
            <h2 className="font-heading text-[#0C0D0F] text-2xl font-bold mb-3">
              Reviewing your answers…
            </h2>
            <p className="text-[#55575A] text-[15px]">
              Our physician team is building your personalized recommendation.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMAIL
  // ─────────────────────────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <QuizHeader />
          <div className="max-w-md mx-auto">
            <h2 className="font-heading text-[#0C0D0F] text-2xl font-bold mb-2">
              Almost there — where should we send your recommendation?
            </h2>
            <p className="text-[#55575A] text-sm mb-6">
              Your personalized treatment plan is ready. Enter your email to see it.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0C0D0F] mb-1">
                  First name <span className="text-[#AAAAAA] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] focus:outline-none focus:ring-2 focus:ring-brand-red text-[15px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0C0D0F] mb-1">
                  Email address <span className="text-brand-red">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] focus:outline-none focus:ring-2 focus:ring-brand-red text-[15px]"
                />
                {emailError && (
                  <p className="text-red-600 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="primary"
                className="w-full rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing…" : "See My Recommendation →"}
              </Button>

              <p className="text-xs text-[#AAAAAA] text-center">
                No spam. Your information is private and never sold.
              </p>
            </form>
          </div>
        </Container>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // QUESTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const q = currentQuestion;
  const needsContinue = q.multi || q.hasConditionalText;
  const continueDisabled =
    q.multi && !q.isSafetyScreen
      ? selectedValues.length === 0
      : q.hasConditionalText
      ? selectedValues.length === 0
      : false;

  return (
    <section className="min-h-[80vh] py-12 bg-white">
      <Container narrow>
        <QuizHeader />

        <div className="max-w-lg mx-auto">
          <p className="text-[#AAAAAA] text-xs uppercase tracking-wider mb-2">
            Question {questionIndex + 1} of {TOTAL_QUESTIONS}
          </p>

          {q.reassurance && (
            <div className="inline-flex items-center gap-2 bg-brand-red/8 text-brand-red text-xs font-medium px-3 py-1.5 rounded-full mb-3">
              <HeartHandshake size={13} />
              {q.reassurance}
            </div>
          )}

          <h2 className="font-heading text-[#0C0D0F] text-xl md:text-2xl font-bold mb-1">
            {q.question}
          </h2>
          {q.subtitle && (
            <p className="text-[#55575A] text-sm mb-5">{q.subtitle}</p>
          )}
          {!q.subtitle && <div className="mb-5" />}

          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSelected =
                selectedValues.includes(opt.value) ||
                (!q.multi && !q.hasConditionalText && answers[q.id] === opt.value);

              return (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value)}
                  className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-150 flex items-start gap-3 ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5"
                      : "border-[#E5E5E5] bg-white hover:border-brand-red/40 hover:bg-[#FFF5F5]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-brand-red border-brand-red" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0C0D0F] text-[15px] leading-snug">{opt.label}</p>
                    {opt.sublabel && (
                      <p className="text-[#55575A] text-[12px] mt-0.5">{opt.sublabel}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Conditional text input for medications */}
          {showTextInput && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-[#0C0D0F] mb-1">
                Please list your current medications:
              </label>
              <textarea
                value={medicationDetail}
                onChange={(e) => setMedicationDetail(e.target.value)}
                placeholder={q.conditionalTextPlaceholder}
                rows={3}
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
              />
            </div>
          )}

          {/* Continue button for multi-select, safety screen, or conditional-text */}
          {needsContinue && (
            <div className="mt-6">
              <Button
                onClick={handleContinue}
                size="lg"
                variant="primary"
                className="w-full rounded-full"
                disabled={continueDisabled}
              >
                {q.isSafetyScreen && selectedValues.length === 0
                  ? "None of these apply — continue"
                  : "Continue"}
                {!q.isSafetyScreen && <ArrowRight size={16} className="ml-1.5" />}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
