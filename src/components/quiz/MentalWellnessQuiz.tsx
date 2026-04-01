"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  Check,
  ArrowRight,
  Loader2,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type ScreenType =
  | "intro"
  | "questions"
  | "safety"
  | "crisis"
  | "consult"
  | "email"
  | "processing";

interface QuizOption {
  value: string;
  label: string;
  sublabel?: string;
  showText?: boolean;
  textPlaceholder?: string;
  exclusive?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "single-with-text" | "multi";
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "concern",
    question: "What brings you here today?",
    subtitle:
      "There are no wrong answers. Choose what resonates most — you can discuss anything else with your provider.",
    type: "single-with-text",
    options: [
      {
        value: "anxiety",
        label: "Anxiety or constant worry",
        sublabel: "Racing thoughts, tension, restlessness, feeling on edge",
      },
      {
        value: "depression",
        label: "Low mood or depression",
        sublabel: "Sadness, hopelessness, loss of interest in things you once enjoyed",
      },
      {
        value: "adhd",
        label: "ADHD / focus & attention",
        sublabel: "Difficulty concentrating, staying on task, or feeling mentally scattered",
      },
      {
        value: "sleep",
        label: "Insomnia or sleep issues",
        sublabel: "Trouble falling asleep, staying asleep, or waking up feeling rested",
      },
      {
        value: "stress",
        label: "Stress or burnout",
        sublabel: "Chronic overwhelm, exhaustion, or feeling emotionally depleted",
      },
      {
        value: "other",
        label: "Something else",
        sublabel: "I'd like to describe it in my own words",
        showText: true,
        textPlaceholder: "Briefly describe what you're experiencing…",
      },
    ],
  },
  {
    id: "severity",
    question: "How much are these symptoms affecting your daily life?",
    subtitle:
      "This helps our physician understand how much support you need right now.",
    type: "single",
    options: [
      {
        value: "mild",
        label: "Mildly — I can manage, but want support",
        sublabel: "Noticeable but not disrupting my routine",
      },
      {
        value: "moderate",
        label: "Moderately — it's getting in the way",
        sublabel: "Affecting work, focus, or relationships at times",
      },
      {
        value: "significant",
        label: "Significantly — most days are a struggle",
        sublabel: "Daily functioning is impacted and it's hard to stay on top of things",
      },
      {
        value: "severe",
        label: "Severely — it's affecting everything",
        sublabel: "Work, relationships, and basic daily tasks are all impacted",
      },
    ],
  },
  {
    id: "frequency",
    question: "How often do you experience these symptoms?",
    type: "single",
    options: [
      { value: "daily", label: "Daily", sublabel: "Every day, without much relief" },
      {
        value: "several-week",
        label: "Several times a week",
        sublabel: "Frequent, but not every single day",
      },
      {
        value: "few-month",
        label: "A few times a month",
        sublabel: "Episodic — comes and goes",
      },
      {
        value: "occasional",
        label: "Occasionally",
        sublabel: "Infrequent, but noticeable when it happens",
      },
    ],
  },
  {
    id: "duration",
    question: "How long have you been experiencing this?",
    type: "single",
    options: [
      {
        value: "recent",
        label: "Less than 1 month",
        sublabel: "Something shifted recently",
      },
      {
        value: "months-1-6",
        label: "1 to 6 months",
        sublabel: "It's been building for a while",
      },
      {
        value: "months-6-12",
        label: "6 months to a year",
        sublabel: "Ongoing and affecting my life",
      },
      {
        value: "year-plus",
        label: "Over a year",
        sublabel: "This has been part of my experience for some time",
      },
    ],
  },
  {
    id: "prior_treatments",
    question: "Have you tried any of the following?",
    subtitle:
      "Select all that apply. This helps us understand what you've already explored.",
    type: "multi",
    options: [
      { value: "therapy", label: "Therapy or counseling" },
      { value: "prescription", label: "Prescription medication" },
      {
        value: "otc",
        label: "Over-the-counter supplements",
        sublabel: "Melatonin, CBD, herbal supplements, etc.",
      },
      {
        value: "meditation",
        label: "Meditation or mindfulness apps",
        sublabel: "Calm, Headspace, or similar",
      },
      {
        value: "none",
        label: "None — this is my first time seeking help",
        exclusive: true,
      },
    ],
  },
  {
    id: "current_meds",
    question: "Are you currently taking any medications for mental health?",
    subtitle:
      "Your answer is confidential and helps your physician evaluate options safely.",
    type: "single-with-text",
    options: [
      {
        value: "yes",
        label: "Yes",
        sublabel: "I'll list them below",
        showText: true,
        textPlaceholder: "e.g. Lexapro 10mg, Trazodone 50mg",
      },
      {
        value: "no",
        label: "No",
        sublabel: "I am not currently taking any mental health medications",
      },
      {
        value: "stopped",
        label: "Previously, but I stopped",
        sublabel: "I can share more details if helpful",
        showText: true,
        textPlaceholder: "What did you take, and why did you stop? (optional)",
      },
    ],
  },
  {
    id: "therapy_status",
    question: "Are you currently seeing a therapist or counselor?",
    type: "single",
    options: [
      { value: "yes-therapy", label: "Yes", sublabel: "I have an active therapist" },
      {
        value: "interested",
        label: "No, but I'm open to it",
        sublabel: "I'd like to explore therapy alongside medication",
      },
      {
        value: "not-interested",
        label: "No, and not right now",
        sublabel: "I'd prefer to start with medication management for now",
      },
    ],
  },
  {
    id: "goals",
    question: "What are you hoping to achieve?",
    subtitle:
      "Select all that apply. There are no right or wrong goals.",
    type: "multi",
    options: [
      { value: "manage-anxiety", label: "Better manage daily anxiety or worry" },
      { value: "focus", label: "Improve focus and productivity" },
      { value: "sleep", label: "Sleep better and wake up rested" },
      { value: "mood", label: "Stabilize my mood" },
      { value: "coping", label: "Reduce unhealthy coping habits" },
      { value: "other-goals", label: "Something else" },
    ],
  },
  {
    id: "preference",
    question: "Do you have a preference for your treatment approach?",
    subtitle:
      "Your physician makes the final recommendation — this helps them understand your comfort level.",
    type: "single",
    options: [
      {
        value: "open-med",
        label: "Open to medication",
        sublabel: "Whatever the doctor recommends works for me",
      },
      {
        value: "non-med-first",
        label: "Prefer non-medication options first",
        sublabel: "I'd like to try other approaches before medication",
      },
      {
        value: "open-anything",
        label: "Open to anything — I trust the physician",
        sublabel: "I'll defer entirely to my provider's judgment",
      },
    ],
  },
];

// Questions are split around the safety screen: first 4, then safety, then 5 more
const QUESTIONS_BEFORE_SAFETY = 4;
const TOTAL_QUESTIONS = QUESTIONS.length; // 9

function getOutcome(answers: Record<string, string | string[]>): string {
  const concern = answers.concern as string;
  const severity = answers.severity as string;

  if (concern === "sleep") return "sleep";
  if (concern === "depression") return "depression";
  if (concern === "adhd") return "motivation";
  if (concern === "stress") {
    return severity === "severe" || severity === "significant"
      ? "anxiety"
      : "motivation";
  }
  if (concern === "anxiety" || concern === "other") return "anxiety";
  return "assessment";
}

export function MentalWellnessQuiz() {
  const router = useRouter();
  const locale = useLocale();

  const [screen, setScreen] = useState<ScreenType>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [pendingSingleValue, setPendingSingleValue] = useState<string | null>(null);

  // Safety screen state
  const [selfHarm, setSelfHarm] = useState<boolean | null>(null);
  const [flaggedConditions, setFlaggedConditions] = useState<string[]>([]);

  // Email screen state
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[questionIndex];
  const isBeforeSafety = questionIndex < QUESTIONS_BEFORE_SAFETY;

  // Question number for display (1-indexed, safety screen is between Q4 and Q5)
  const displayQuestionNum = questionIndex + 1;
  const safetyQuestionNum = QUESTIONS_BEFORE_SAFETY + 1; // Q5 is safety

  // Progress bar
  const totalSteps = TOTAL_QUESTIONS + 2; // questions + safety + contraindications
  let progressStep = 0;
  if (screen === "intro") progressStep = 0;
  else if (screen === "questions") {
    progressStep = isBeforeSafety
      ? questionIndex + 1
      : questionIndex + 3; // +3: past safety(+1) and contraindications(+1)
  } else if (screen === "safety") progressStep = QUESTIONS_BEFORE_SAFETY + 1;
  else if (screen === "email") progressStep = totalSteps - 1;
  else if (screen === "processing") progressStep = totalSteps;
  const progress = Math.round((progressStep / totalSteps) * 100);

  function handleBack() {
    setSelectedValues([]);
    setPendingSingleValue(null);

    if (screen === "email") {
      setScreen("questions");
      return;
    }
    if (screen === "safety") {
      setScreen("questions");
      setQuestionIndex(QUESTIONS_BEFORE_SAFETY - 1);
      return;
    }
    if (screen === "questions") {
      if (questionIndex === 0) {
        setScreen("intro");
      } else if (questionIndex === QUESTIONS_BEFORE_SAFETY) {
        // Coming back from first post-safety question → return to safety screen
        setScreen("safety");
      } else {
        setQuestionIndex((i) => i - 1);
      }
    }
  }

  function advanceAfterQuestion(newAnswers: Record<string, string | string[]>) {
    setAnswers(newAnswers);
    setSelectedValues([]);
    setPendingSingleValue(null);

    if (questionIndex === QUESTIONS_BEFORE_SAFETY - 1) {
      // Q4 done → go to safety screen
      setScreen("safety");
    } else if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setScreen("email");
    }
  }

  function handleSingleSelect(value: string) {
    const opt = currentQuestion.options.find((o) => o.value === value);
    if (opt?.showText) {
      setPendingSingleValue(value);
      return;
    }
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setTimeout(() => advanceAfterQuestion(newAnswers), 200);
  }

  function handleSingleWithTextContinue() {
    if (!pendingSingleValue) return;
    const newAnswers = { ...answers, [currentQuestion.id]: pendingSingleValue };
    setPendingSingleValue(null);
    advanceAfterQuestion(newAnswers);
  }

  function handleMultiToggle(value: string, exclusive?: boolean) {
    if (exclusive) {
      setSelectedValues([value]);
      return;
    }
    setSelectedValues((prev) => {
      const withoutExclusive = prev.filter(
        (v) => !currentQuestion.options.find((o) => o.value === v)?.exclusive
      );
      return withoutExclusive.includes(value)
        ? withoutExclusive.filter((v) => v !== value)
        : [...withoutExclusive, value];
    });
  }

  function handleMultiContinue() {
    if (selectedValues.length === 0) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedValues };
    advanceAfterQuestion(newAnswers);
  }

  function handleSafetySubmit() {
    if (selfHarm === null) return;
    if (selfHarm) {
      setScreen("crisis");
      return;
    }
    if (flaggedConditions.length > 0) {
      setScreen("consult");
      return;
    }
    setScreen("questions");
    setQuestionIndex(QUESTIONS_BEFORE_SAFETY);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsSubmitting(true);
    setScreen("processing");

    const outcome = getOutcome(answers);

    try {
      await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || null,
          quizOutcome: `mental-wellness:${outcome}`,
          locale,
          answers,
        }),
      });
    } catch {
      // non-blocking
    }

    await new Promise((r) => setTimeout(r, 1400));
    const qp = new URLSearchParams();
    if (answers.concern) qp.set("concern", answers.concern as string);
    if (answers.severity) qp.set("severity", answers.severity as string);
    if (answers.duration) qp.set("duration", answers.duration as string);
    if (flaggedConditions.length > 0) qp.set("flagged", "1");
    router.push(`/${locale}/quiz/mental-wellness/result/${outcome}?${qp.toString()}`);
  }

  // ─── INTRO SCREEN ──────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <Heart size={12} />
              Mental Wellness
            </div>
            <h1
              className="text-[#0C0D0F] text-3xl md:text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Let&apos;s find the right support for your mental health.
            </h1>
            <p className="text-[#55575A] text-base mb-6 leading-relaxed">
              This quiz helps our physician understand your mental health needs so
              they can provide a personalized recommendation.
            </p>

            <div className="bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl p-5 mb-7 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#E8F5EE] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock size={15} className="text-[#1B8A4A]" />
                </div>
                <div>
                  <p
                    className="text-[#0C0D0F] font-semibold text-[13px] mb-1"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Your answers are confidential
                  </p>
                  <p className="text-[#55575A] text-[12px] leading-relaxed">
                    Your responses are not shared outside of your care team. There
                    are no wrong answers — be as honest as you feel comfortable.
                    This takes about 3 minutes.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setScreen("questions");
                setQuestionIndex(0);
              }}
              size="lg"
              variant="primary"
              className="rounded-full px-10 w-full sm:w-auto"
            >
              Start the Quiz <ArrowRight size={16} className="ml-1 inline" />
            </Button>
            <p className="text-[#55575A] text-xs mt-4">
              Free · No account required · Takes about 3 minutes
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─── CRISIS SCREEN ─────────────────────────────────────────────────────
  if (screen === "crisis") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto">
            <div className="bg-[#FFF5F5] border-2 border-[#FCA5A5] rounded-2xl p-7 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
                <Heart size={22} className="text-[#DC2626]" />
              </div>
              <h2
                className="text-[#0C0D0F] text-xl font-bold mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                You don&apos;t have to face this alone.
              </h2>
              <p className="text-[#55575A] text-sm leading-relaxed mb-5">
                If you&apos;re having thoughts of self-harm or suicide, please reach
                out for immediate support. These resources are free, confidential,
                and available 24/7.
              </p>

              <div className="space-y-3 mb-5">
                <a
                  href="tel:988"
                  className="flex items-center gap-3 bg-white border-2 border-[#DC2626] rounded-xl px-5 py-4 hover:bg-[#FFF5F5] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[#DC2626]" />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-[#0C0D0F] font-semibold text-[13px]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      988 Suicide &amp; Crisis Lifeline
                    </p>
                    <p className="text-[#55575A] text-[11px]">
                      Call or text 988 — available 24/7
                    </p>
                  </div>
                </a>

                <a
                  href="sms:741741&body=HOME"
                  className="flex items-center gap-3 bg-white border-2 border-[#DC2626] rounded-xl px-5 py-4 hover:bg-[#FFF5F5] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-[#DC2626]" />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-[#0C0D0F] font-semibold text-[13px]"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Crisis Text Line
                    </p>
                    <p className="text-[#55575A] text-[11px]">
                      Text HOME to 741741 — free, confidential
                    </p>
                  </div>
                </a>
              </div>

              <p className="text-[#55575A] text-xs leading-relaxed">
                Once you&apos;re feeling safe and supported, we&apos;re here to
                help you find ongoing mental health care. Please don&apos;t hesitate
                to come back.
              </p>
            </div>

            <button
              onClick={() => {
                setSelfHarm(null);
                setFlaggedConditions([]);
                setScreen("safety");
              }}
              className="w-full text-center text-[#55575A] text-sm underline underline-offset-2 hover:text-[#0C0D0F] transition-colors"
            >
              Go back
            </button>
          </div>
        </Container>
      </section>
    );
  }

  // ─── CONSULT SCREEN ────────────────────────────────────────────────────
  if (screen === "consult") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto">
            <div className="bg-[#EBF2FF] border-2 border-[#93C5FD] rounded-2xl p-7 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#DBEAFE] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={22} className="text-[#1A6EED]" />
              </div>
              <h2
                className="text-[#0C0D0F] text-xl font-bold mb-3"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                A direct consultation is the best next step for you.
              </h2>
              <p className="text-[#55575A] text-sm leading-relaxed mb-5">
                Based on your answers, we recommend speaking directly with one of
                our physicians rather than going through the self-serve flow. This
                ensures you get the most personalized, safe care possible.
              </p>

              <div className="bg-white rounded-xl p-4 mb-5 text-left">
                <p
                  className="text-[#0C0D0F] font-semibold text-[12px] mb-2"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Why we&apos;re recommending a consultation:
                </p>
                <ul className="space-y-1.5">
                  {flaggedConditions.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-[12px] text-[#55575A]">
                      <Check size={13} className="text-[#1A6EED] flex-shrink-0 mt-0.5" />
                      {c === "pregnant" && "You indicated you are pregnant or breastfeeding"}
                      {c === "under18" && "You indicated you are under 18 years old"}
                      {c === "bipolar" && "You indicated a history of bipolar disorder or psychosis"}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => router.push(`/${locale}/contact`)}
                size="lg"
                variant="primary"
                className="w-full rounded-full"
              >
                Schedule a Consultation →
              </Button>
            </div>

            <button
              onClick={() => {
                setFlaggedConditions([]);
                setScreen("safety");
              }}
              className="w-full text-center text-[#55575A] text-sm underline underline-offset-2 hover:text-[#0C0D0F] transition-colors"
            >
              Go back and review my answers
            </button>
          </div>
        </Container>
      </section>
    );
  }

  // ─── PROCESSING SCREEN ─────────────────────────────────────────────────
  if (screen === "processing") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-6 text-brand-red" size={40} />
            <h2
              className="text-[#0C0D0F] text-2xl font-bold mb-3"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Building your personalized recommendation…
            </h2>
            <p className="text-[#55575A] text-sm">
              Our physician is reviewing your answers. This only takes a moment.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─── EMAIL SCREEN ──────────────────────────────────────────────────────
  if (screen === "email") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-md mx-auto">
            <ProgressBar progress={progress} />

            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[#55575A] text-sm mb-6 hover:text-[#0C0D0F] transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <h2
              className="text-[#0C0D0F] text-2xl font-bold mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Your recommendation is ready.
            </h2>
            <p className="text-[#55575A] text-sm mb-6">
              Enter your email to see your personalized treatment plan. We&apos;ll
              also send you a copy for your records.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0C0D0F] mb-1">
                  First name <span className="text-[#55575A] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
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
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
                {emailError && (
                  <p className="text-red-600 text-xs mt-1">{emailError}</p>
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

              <p className="text-xs text-[#55575A] text-center flex items-center justify-center gap-1">
                <Lock size={11} />
                No spam. Your data is never sold. HIPAA compliant.
              </p>
            </form>
          </div>
        </Container>
      </section>
    );
  }

  // ─── SAFETY SCREEN ─────────────────────────────────────────────────────
  if (screen === "safety") {
    const anyFlagged =
      flaggedConditions.length > 0 || selfHarm === true;
    const canContinue = selfHarm !== null;

    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto">
            <ProgressBar progress={progress} />

            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-[#55575A] text-sm mb-6 hover:text-[#0C0D0F] transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#55575A] text-xs uppercase tracking-wider">
                Question {safetyQuestionNum} of {TOTAL_QUESTIONS + 1}
              </span>
            </div>

            <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 mb-6">
              <AlertTriangle size={16} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <p className="text-[#55575A] text-[12px] leading-relaxed">
                Before we continue — these questions help us make sure the
                self-serve path is right for you. Your answers are confidential.
              </p>
            </div>

            <h2
              className="text-[#0C0D0F] text-xl font-bold mb-5"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              A few important health questions
            </h2>

            {/* Self-harm question — always first and always required */}
            <div className="mb-6">
              <p className="text-[#0C0D0F] font-semibold text-[14px] mb-3">
                Are you currently experiencing thoughts of self-harm or suicide?
              </p>
              <div className="flex gap-3">
                {[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ].map(({ value, label }) => (
                  <button
                    key={String(value)}
                    onClick={() => setSelfHarm(value)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-[13px] transition-all ${
                      selfHarm === value
                        ? "border-brand-red bg-brand-red/5 text-brand-red"
                        : "border-[#E5E5E5] bg-white text-[#0C0D0F] hover:border-brand-red/40"
                    }`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selfHarm === true && (
                <p className="text-[#DC2626] text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  We&apos;ll direct you to immediate support resources.
                </p>
              )}
            </div>

            {/* Conditional flags — only show if self-harm is No */}
            {selfHarm === false && (
              <div className="mb-6">
                <p className="text-[#0C0D0F] font-semibold text-[14px] mb-1">
                  Do any of the following apply to you?
                </p>
                <p className="text-[#55575A] text-[12px] mb-3">
                  Select all that apply, or skip if none apply.
                </p>
                <div className="space-y-2">
                  {[
                    {
                      id: "pregnant",
                      label: "I am currently pregnant or breastfeeding",
                    },
                    {
                      id: "under18",
                      label: "I am under 18 years old",
                    },
                    {
                      id: "bipolar",
                      label: "I have a history of bipolar disorder or psychosis",
                    },
                  ].map((item) => {
                    const isChecked = flaggedConditions.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          setFlaggedConditions((prev) =>
                            prev.includes(item.id)
                              ? prev.filter((x) => x !== item.id)
                              : [...prev, item.id]
                          )
                        }
                        className={`w-full text-left rounded-xl border-2 px-5 py-3.5 flex items-center gap-3 transition-all ${
                          isChecked
                            ? "border-brand-red bg-brand-red/5"
                            : "border-[#E5E5E5] bg-white hover:border-brand-red/30"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isChecked
                              ? "bg-brand-red border-brand-red"
                              : "border-gray-300"
                          }`}
                        >
                          {isChecked && (
                            <Check size={11} className="text-white" />
                          )}
                        </div>
                        <span className="text-[13px] text-[#0C0D0F] font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={handleSafetySubmit}
              size="lg"
              variant="primary"
              className="w-full rounded-full"
              disabled={!canContinue}
            >
              {anyFlagged && selfHarm
                ? "See Support Resources →"
                : anyFlagged
                ? "See Recommended Next Steps →"
                : "Continue →"}
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  // ─── QUESTION SCREEN ───────────────────────────────────────────────────
  const isMulti = currentQuestion.type === "multi";
  const isSingleWithText = currentQuestion.type === "single-with-text";

  // For display: questions after safety get +1 in numbering (for the safety screen)
  const adjustedNum = isBeforeSafety
    ? displayQuestionNum
    : displayQuestionNum + 1;
  const totalDisplayed = TOTAL_QUESTIONS + 1; // +1 for safety screen

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
      <Container narrow>
        <div className="max-w-lg mx-auto">
          <ProgressBar progress={progress} />

          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[#55575A] text-sm mb-6 hover:text-[#0C0D0F] transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <p className="text-[#55575A] text-xs uppercase tracking-wider mb-2">
            Question {adjustedNum} of {totalDisplayed}
          </p>

          <h2
            className="text-[#0C0D0F] text-xl md:text-2xl font-bold mb-2 leading-snug"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {currentQuestion.question}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-[#55575A] text-sm mb-5 leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          )}
          {!currentQuestion.subtitle && <div className="mb-5" />}

          <div className="space-y-2.5">
            {currentQuestion.options.map((opt) => {
              const isSelectedMulti = isMulti && selectedValues.includes(opt.value);
              const isSelectedSingle =
                !isMulti &&
                (pendingSingleValue === opt.value ||
                  (!pendingSingleValue &&
                    answers[currentQuestion.id] === opt.value));
              const isSelected = isSelectedMulti || isSelectedSingle;
              const showTextField =
                opt.showText &&
                isSelected &&
                (pendingSingleValue === opt.value ||
                  (!isSingleWithText && isSelectedMulti));

              return (
                <div key={opt.value}>
                  <button
                    onClick={() =>
                      isMulti
                        ? handleMultiToggle(opt.value, opt.exclusive)
                        : handleSingleSelect(opt.value)
                    }
                    className={`w-full text-left rounded-xl border-2 px-5 py-4 flex items-start gap-3 transition-all duration-150 ${
                      isSelected
                        ? "border-brand-red bg-brand-red/5"
                        : "border-[#E5E5E5] bg-white hover:border-brand-red/40 hover:bg-[#FFF5F5]"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 ${
                        isMulti ? "rounded" : "rounded-full"
                      } border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-brand-red border-brand-red"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <Check size={11} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#0C0D0F] text-[14px] leading-snug">
                        {opt.label}
                      </p>
                      {opt.sublabel && (
                        <p className="text-[#55575A] text-xs mt-0.5">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Text field for "other" / meds / stopped options */}
                  {opt.showText && pendingSingleValue === opt.value && (
                    <div className="mt-2 ml-2">
                      <textarea
                        autoFocus
                        rows={2}
                        value={textValues[currentQuestion.id] ?? ""}
                        onChange={(e) =>
                          setTextValues((prev) => ({
                            ...prev,
                            [currentQuestion.id]: e.target.value,
                          }))
                        }
                        placeholder={opt.textPlaceholder ?? "Type here…"}
                        className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[#0C0D0F] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                      />
                      <Button
                        onClick={handleSingleWithTextContinue}
                        size="md"
                        variant="primary"
                        className="mt-2 rounded-full w-full"
                      >
                        Continue <ArrowRight size={14} className="ml-1 inline" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isMulti && (
            <div className="mt-5">
              <Button
                onClick={handleMultiContinue}
                size="lg"
                variant="primary"
                className="w-full rounded-full"
                disabled={selectedValues.length === 0}
              >
                Continue <ArrowRight size={16} className="ml-1 inline" />
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mb-8">
      <div
        className="bg-brand-red h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
