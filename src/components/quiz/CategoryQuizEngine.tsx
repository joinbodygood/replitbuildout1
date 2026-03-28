"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export interface QuizOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: QuizOption[];
  multi?: boolean;
}

interface CategoryQuizEngineProps {
  category: string;
  title: string;
  subtitle: string;
  badge?: string;
  questions: QuizQuestion[];
  getOutcome: (answers: Record<string, string | string[]>) => string;
  resultBasePath: string;
}

type Step = "intro" | "questions" | "email" | "processing";

export function CategoryQuizEngine({
  category,
  title,
  subtitle,
  badge,
  questions,
  getOutcome,
  resultBasePath,
}: CategoryQuizEngineProps) {
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState<Step>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[questionIndex];
  const progress =
    step === "intro"
      ? 0
      : step === "questions"
      ? Math.round(((questionIndex + 1) / (questions.length + 1)) * 100)
      : step === "email"
      ? 90
      : 100;

  function handleOptionClick(value: string) {
    if (!currentQuestion) return;

    if (currentQuestion.multi) {
      setSelectedValues((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      setSelectedValues([]);

      setTimeout(() => {
        if (questionIndex < questions.length - 1) {
          setQuestionIndex((i) => i + 1);
        } else {
          setStep("email");
        }
      }, 200);
    }
  }

  function handleMultiContinue() {
    if (!currentQuestion || selectedValues.length === 0) return;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedValues };
    setAnswers(newAnswers);
    setSelectedValues([]);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep("email");
    }
  }

  function handleBack() {
    if (step === "email") {
      setStep("questions");
      return;
    }
    if (step === "questions") {
      if (questionIndex === 0) {
        setStep("intro");
      } else {
        setQuestionIndex((i) => i - 1);
      }
    }
  }

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
          quizOutcome: `${category}:${outcome}`,
          locale,
        }),
      });
    } catch {
    }

    await new Promise((r) => setTimeout(r, 1400));
    router.push(`/${locale}${resultBasePath}/${outcome}`);
  }

  if (step === "intro") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center py-16">
        <Container narrow>
          <div className="text-center">
            {badge && (
              <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                {badge}
              </div>
            )}
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto mb-8">
              {subtitle}
            </p>
            <Button
              onClick={() => setStep("questions")}
              size="lg"
              variant="primary"
              className="rounded-full px-10"
            >
              Take the 2-Minute Quiz →
            </Button>
            <p className="text-body-muted text-sm mt-4">
              Free. No login required. Takes less than 2 minutes.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  if (step === "processing") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center py-16">
        <Container narrow>
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-6 text-brand-red" size={40} />
            <h2 className="font-heading text-heading text-2xl font-bold mb-3">
              Building your recommendation…
            </h2>
            <p className="text-body-muted">
              Our providers are reviewing your answers.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  if (step === "email") {
    return (
      <section className="min-h-[70vh] flex items-center justify-center py-16">
        <Container narrow>
          <div className="max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
              <div
                className="bg-brand-red h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-body-muted text-sm mb-6 hover:text-body transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <h2 className="font-heading text-heading text-2xl font-bold mb-2">
              Almost there — where should we send your recommendation?
            </h2>
            <p className="text-body-muted text-sm mb-6">
              Your personalized treatment plan is ready. Enter your email to see it.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">
                  First name (optional)
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full border border-border rounded-lg px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-body mb-1">
                  Email address <span className="text-brand-red">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-border rounded-lg px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-brand-red"
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

              <p className="text-xs text-body-muted text-center">
                No spam. No selling your data. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center py-16">
      <Container narrow>
        <div className="max-w-lg mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8">
            <div
              className="bg-brand-red h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-body-muted text-sm mb-6 hover:text-body transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <p className="text-body-muted text-xs uppercase tracking-wider mb-2">
            Question {questionIndex + 1} of {questions.length}
          </p>

          <h2 className="font-heading text-heading text-xl md:text-2xl font-bold mb-2">
            {currentQuestion.question}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-body-muted text-sm mb-6">
              {currentQuestion.subtitle}
            </p>
          )}
          {!currentQuestion.subtitle && <div className="mb-6" />}

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedValues.includes(opt.value) ||
                (!currentQuestion.multi && answers[currentQuestion.id] === opt.value);

              return (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value)}
                  className={`w-full text-left rounded-xl border-2 px-5 py-4 transition-all duration-150 flex items-start gap-3 ${
                    isSelected
                      ? "border-brand-red bg-brand-red/5"
                      : "border-border bg-white hover:border-brand-red/40 hover:bg-brand-pink-soft"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-brand-red border-brand-red"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div>
                    <p className="font-medium text-body leading-snug">{opt.label}</p>
                    {opt.sublabel && (
                      <p className="text-body-muted text-xs mt-0.5">{opt.sublabel}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {currentQuestion.multi && (
            <div className="mt-6">
              <Button
                onClick={handleMultiContinue}
                size="lg"
                variant="primary"
                className="w-full rounded-full"
                disabled={selectedValues.length === 0}
              >
                Continue <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
