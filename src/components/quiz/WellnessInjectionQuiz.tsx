"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  Check,
  Syringe,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// ─── Types ─────────────────────────────────────────────────────────────────

type Screen = "intro" | "questions" | "email" | "processing";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  showText?: boolean;
  textPlaceholder?: string;
  exclusive?: boolean;
}

interface Question {
  id: string;
  question: string;
  subtitle?: string;
  type: "single" | "multi" | "single-text";
  options: Option[];
}

// ─── Conditional concern questions ─────────────────────────────────────────

const CONCERN_QUESTIONS: Record<string, Question> = {
  energy: {
    id: "specific_concern",
    question: "Is your fatigue more physical, mental, or both?",
    subtitle: "This helps us match you to the right formula.",
    type: "single",
    options: [
      { value: "physical", label: "Physical fatigue", sublabel: "Muscle tiredness, low stamina, post-workout crash" },
      { value: "mental",   label: "Mental fatigue",   sublabel: "Brain fog, difficulty concentrating, low motivation" },
      { value: "both",     label: "Both equally",      sublabel: "I feel run-down physically and mentally" },
    ],
  },
  "detox-skin": {
    id: "specific_concern",
    question: "Are you more focused on skin clarity or internal detox?",
    type: "single",
    options: [
      { value: "skin",   label: "Skin clarity & glow",    sublabel: "Brighter complexion, fewer blemishes, radiance" },
      { value: "detox",  label: "Internal detox",          sublabel: "Liver support, toxin elimination, cellular cleanse" },
      { value: "both",   label: "Both — inside and out",   sublabel: "I want the full detox and glow effect" },
    ],
  },
  "fat-burning": {
    id: "specific_concern",
    question: "Are you currently on a weight loss program?",
    type: "single",
    options: [
      { value: "on-glp1",   label: "Yes — on GLP-1 medication",      sublabel: "Semaglutide, tirzepatide, or similar" },
      { value: "on-diet",   label: "Yes — diet & exercise program",   sublabel: "Eating well and working out regularly" },
      { value: "standalone", label: "No — starting fresh",            sublabel: "Looking to kickstart my metabolism" },
    ],
  },
  athletic: {
    id: "specific_concern",
    question: "What's your primary athletic focus?",
    type: "single",
    options: [
      { value: "recovery",    label: "Recovery",             sublabel: "Muscle repair, soreness reduction, faster bounce-back" },
      { value: "performance", label: "Performance",          sublabel: "Endurance, strength, workout output" },
      { value: "both",        label: "Recovery & performance", sublabel: "I want to optimize both" },
    ],
  },
  "anti-aging": {
    id: "specific_concern",
    question: "What aspect of anti-aging are you most focused on?",
    type: "single",
    options: [
      { value: "cellular", label: "Cellular repair",       sublabel: "DNA protection, mitochondrial health, longevity" },
      { value: "hormone",  label: "Hormone optimization",  sublabel: "Growth hormone, energy, muscle preservation" },
      { value: "both",     label: "Both — the full stack", sublabel: "I want comprehensive anti-aging support" },
    ],
  },
  immune: {
    id: "specific_concern",
    question: "What's driving your interest in immune support?",
    type: "single",
    options: [
      { value: "general",    label: "General immunity boost",         sublabel: "Staying healthy, preventing illness" },
      { value: "recovery",   label: "Recovery from illness or surgery", sublabel: "Getting back to 100% faster" },
      { value: "antioxidant", label: "Oxidative stress & antioxidants", sublabel: "Fighting inflammation and free radicals" },
    ],
  },
  "sleep-stress": {
    id: "specific_concern",
    question: "Which is affecting your quality of life most?",
    type: "single",
    options: [
      { value: "sleep",  label: "Sleep quality",     sublabel: "Trouble falling or staying asleep, waking unrefreshed" },
      { value: "stress", label: "Stress & burnout",  sublabel: "Feeling overwhelmed, wired-but-tired, anxious" },
      { value: "both",   label: "Both equally",      sublabel: "Poor sleep and chronic stress are intertwined for me" },
    ],
  },
};

// ─── Static questions (non-conditional) ───────────────────────────────────

const STATIC_AFTER_CONCERN: Question[] = [
  {
    id: "injection_experience",
    question: "Have you done self-administered injections before?",
    subtitle: "All our wellness injections are subcutaneous (sub-Q) — similar to insulin shots. Easy to learn.",
    type: "single",
    options: [
      { value: "yes",       label: "Yes — I'm comfortable with it",       sublabel: "I've done sub-Q or IM injections before" },
      { value: "no-open",   label: "No — but I'm open to learning",       sublabel: "I'd like guidance and I'm willing to try" },
      { value: "no-prefer", label: "No — I'd prefer to avoid injections", sublabel: "Show me the easiest option available" },
    ],
  },
  {
    id: "current_supplements",
    question: "Are you currently taking any vitamins, supplements, or treatments?",
    subtitle: "Select all that apply — this helps us avoid redundancy and find the best complement.",
    type: "multi",
    options: [
      { value: "none",       label: "None — starting fresh",               exclusive: true },
      { value: "otc-vits",   label: "OTC vitamins (B12, D, Iron, etc.)"  },
      { value: "protein",    label: "Protein powders or amino acids"       },
      { value: "iv-therapy", label: "IV therapy or drip bars"             },
      { value: "weight-meds", label: "GLP-1 or weight loss medications"   },
      { value: "rx-meds",    label: "Other prescription medications"       },
    ],
  },
  {
    id: "allergies",
    question: "Any known allergies to vitamins, supplements, or injectable ingredients?",
    type: "single-text",
    options: [
      { value: "no",  label: "No known allergies",                sublabel: "I haven't had any reactions" },
      {
        value: "yes",
        label: "Yes — I have a known allergy or sensitivity",
        sublabel: "I'll describe it below",
        showText: true,
        textPlaceholder: "e.g. sulfa allergy, sensitivity to B vitamins, etc.",
      },
    ],
  },
  {
    id: "budget",
    question: "What's your comfortable monthly range for wellness supplements?",
    subtitle: "We'll prioritize options that fit your budget without compromising on quality.",
    type: "single",
    options: [
      { value: "under50",  label: "Under $50/mo",     sublabel: "Keep it lean — essentials only" },
      { value: "50-100",   label: "$50–$100/mo",      sublabel: "Good value, meaningful results" },
      { value: "100-150",  label: "$100–$150/mo",     sublabel: "Investing in my health seriously" },
      { value: "150plus",  label: "$150+/mo",         sublabel: "I want the best — top-tier options" },
    ],
  },
];

// ─── Outcome logic ─────────────────────────────────────────────────────────

function getOutcome(answers: Record<string, string | string[]>): string {
  const goal    = answers.primary_goal as string;
  const concern = answers.specific_concern as string;
  const budget  = answers.budget as string;
  const exp     = answers.injection_experience as string;

  // Hard budget floor — B12 is the only sub-$60 option
  if (budget === "under50") return "vitamin-b12";

  if (goal === "energy") {
    if (concern === "mental") return "vitamin-b12";
    // physical or both → Lipotropic Super B
    return "lipotropic-super-b";
  }

  if (goal === "detox-skin") return "glutathione";

  if (goal === "fat-burning") {
    if (concern === "standalone" && budget === "50-100") return "l-carnitine";
    return "lipotropic-super-b";
  }

  if (goal === "athletic") {
    if (concern === "recovery" || concern === "both") return "pentadeca-arginate";
    return "l-carnitine"; // performance
  }

  if (goal === "anti-aging") return "nad-plus";

  if (goal === "immune") {
    if (concern === "antioxidant") return "glutathione";
    return "ascorbic-acid"; // general or illness recovery
  }

  if (goal === "sleep-stress") {
    if (concern === "stress") return "nad-plus";
    return "sermorelin"; // sleep or both
  }

  if (exp === "no-prefer") return "vitamin-b12";

  return "lipotropic-super-b";
}

// ─── Progress bar ──────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-[#F0F0F0] rounded-full h-1.5 mb-7 overflow-hidden">
      <div
        className="h-1.5 rounded-full bg-brand-red transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function WellnessInjectionQuiz() {
  const router = useRouter();
  const locale = useLocale();

  const [screen, setScreen]       = useState<Screen>("intro");
  const [answers, setAnswers]     = useState<Record<string, string | string[]>>({});
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [pendingSingle, setPendingSingle] = useState<string | null>(null);

  // Email
  const [firstName, setFirstName]   = useState("");
  const [email, setEmail]           = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Build the ordered question list dynamically
  const primaryGoal = answers.primary_goal as string | undefined;
  const concernQ    = primaryGoal ? CONCERN_QUESTIONS[primaryGoal] : null;

  const allQuestions: Question[] = [
    {
      id: "primary_goal",
      question: "What are you looking to improve?",
      subtitle: "Choose the goal that matters most to you right now.",
      type: "single",
      options: [
        { value: "energy",       label: "Energy & fatigue",               sublabel: "Fight exhaustion, brain fog, and low stamina" },
        { value: "detox-skin",   label: "Detox & skin health",            sublabel: "Glow from the inside out, support liver & cell health" },
        { value: "fat-burning",  label: "Fat burning & metabolism",       sublabel: "Accelerate fat loss and metabolic rate" },
        { value: "athletic",     label: "Athletic performance & recovery", sublabel: "Train harder, recover faster, preserve muscle" },
        { value: "anti-aging",   label: "Anti-aging & longevity",         sublabel: "Cellular repair, hormone optimization, long-term vitality" },
        { value: "immune",       label: "Immune support",                  sublabel: "Strengthen defenses, fight oxidative stress" },
        { value: "sleep-stress", label: "Sleep & stress",                  sublabel: "Deeper sleep, less cortisol, better resilience" },
      ],
    },
    ...(concernQ ? [concernQ] : []),
    ...STATIC_AFTER_CONCERN,
  ];

  const [qIndex, setQIndex] = useState(0);
  const currentQ = allQuestions[qIndex];
  const totalQ   = allQuestions.length;
  const isMulti  = currentQ?.type === "multi";
  const isSingleText = currentQ?.type === "single-text";

  // Progress
  const pct = screen === "intro"      ? 0
            : screen === "questions"  ? Math.round(((qIndex + 1) / (totalQ + 1)) * 100)
            : screen === "email"      ? 90
            : 100;

  // ── Handlers ──

  function handleSingleSelect(value: string) {
    const opt = currentQ.options.find((o) => o.value === value);
    if (opt?.showText) { setPendingSingle(value); return; }
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    setPendingSingle(null);
    setTimeout(() => advance(newAnswers), 200);
  }

  function handleSingleTextContinue() {
    if (!pendingSingle) return;
    const newAnswers = { ...answers, [currentQ.id]: pendingSingle };
    setAnswers(newAnswers);
    setPendingSingle(null);
    advance(newAnswers);
  }

  function handleMultiToggle(value: string, exclusive?: boolean) {
    if (exclusive) { setSelectedMulti([value]); return; }
    setSelectedMulti((prev) => {
      const withoutExcl = prev.filter(
        (v) => !currentQ.options.find((o) => o.value === v)?.exclusive
      );
      return withoutExcl.includes(value)
        ? withoutExcl.filter((v) => v !== value)
        : [...withoutExcl, value];
    });
  }

  function handleMultiContinue() {
    if (selectedMulti.length === 0) return;
    const newAnswers = { ...answers, [currentQ.id]: selectedMulti };
    setAnswers(newAnswers);
    setSelectedMulti([]);
    advance(newAnswers);
  }

  function advance(newAnswers: Record<string, string | string[]>) {
    // If we just answered primary_goal, rebuild index (concern Q may appear)
    if (currentQ.id === "primary_goal") {
      setQIndex(1); // concern Q is always at index 1 after primary_goal
      return;
    }
    if (qIndex + 1 < allQuestions.length) {
      setQIndex(qIndex + 1);
    } else {
      setScreen("email");
    }
  }

  function handleBack() {
    setSelectedMulti([]);
    setPendingSingle(null);
    if (qIndex === 0) { setScreen("intro"); return; }
    // If going back from concern Q, clear it
    if (qIndex === 1 && currentQ.id === "specific_concern") {
      setAnswers((prev) => { const a = { ...prev }; delete a.specific_concern; return a; });
    }
    setQIndex(qIndex - 1);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("Please enter a valid email."); return; }
    setEmailError("");
    setSubmitting(true);
    setScreen("processing");

    const outcome = getOutcome(answers);

    try {
      await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || null,
          quizOutcome: `wellness-injection:${outcome}`,
          locale,
          answers: { ...answers, textValues },
        }),
      });
    } catch { /* non-blocking */ }

    await new Promise((r) => setTimeout(r, 1400));

    const qp = new URLSearchParams();
    if (answers.primary_goal)         qp.set("goal",    answers.primary_goal as string);
    if (answers.specific_concern)     qp.set("concern", answers.specific_concern as string);
    if (answers.budget)               qp.set("budget",  answers.budget as string);
    if (answers.injection_experience) qp.set("exp",     answers.injection_experience as string);
    router.push(`/${locale}/quiz/wellness-injections/result/${outcome}?${qp.toString()}`);
  }

  // ─── INTRO ─────────────────────────────────────────────────────────────

  if (screen === "intro") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <Syringe size={12} />
              Wellness Injections
            </div>
            <h1
              className="text-[#0C0D0F] text-3xl md:text-4xl font-bold leading-tight mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Find your perfect wellness injection in 2 minutes.
            </h1>
            <p className="text-[#55575A] text-base mb-6 leading-relaxed">
              Answer 6 quick questions and we&apos;ll match you to the single best
              injectable based on your goals, budget, and lifestyle.
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
                    We use your responses only to personalize your recommendation.
                    Free, no account required, takes about 2 minutes.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setScreen("questions")}
              size="lg"
              variant="primary"
              className="w-full rounded-full"
            >
              Find My Injection →
            </Button>
            <p className="text-[#55575A] text-xs mt-3">
              Free · No account required · Takes about 2 minutes
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─── PROCESSING ─────────────────────────────────────────────────────────

  if (screen === "processing") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-sm mx-auto text-center">
            <Loader2 size={40} className="text-brand-red animate-spin mx-auto mb-5" />
            <h2
              className="text-[#0C0D0F] text-xl font-bold mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Matching your profile…
            </h2>
            <p className="text-[#55575A] text-sm">
              We&apos;re finding the best injectable for your goals and budget.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─── EMAIL ──────────────────────────────────────────────────────────────

  if (screen === "email") {
    return (
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
        <Container narrow>
          <div className="max-w-lg mx-auto">
            <ProgressBar pct={pct} />
            <button
              onClick={() => { setScreen("questions"); setQIndex(totalQ - 1); }}
              className="flex items-center gap-1 text-[#55575A] text-sm mb-6 hover:text-[#0C0D0F] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div className="inline-flex items-center gap-2 bg-[#E8F5EE] text-[#1B8A4A] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
              <Check size={12} />
              Almost there
            </div>
            <h2
              className="text-[#0C0D0F] text-2xl font-bold mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Where should we send your recommendation?
            </h2>
            <p className="text-[#55575A] text-sm mb-7 leading-relaxed">
              We&apos;ll email you your personalized match and a first-time discount if available.
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3.5 text-[14px] text-[#0C0D0F] focus:outline-none focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/10 transition-all"
              />
              <div>
                <input
                  type="email"
                  placeholder="Email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-4 py-3.5 text-[14px] text-[#0C0D0F] focus:outline-none focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/10 transition-all ${
                    emailError ? "border-red-400" : "border-[#E5E5E5]"
                  }`}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">{emailError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                variant="primary"
                className="w-full rounded-full"
              >
                {submitting ? "Analyzing your answers…" : "See My Recommendation →"}
              </Button>
            </form>
            <p className="text-[#55575A] text-xs text-center mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // ─── QUESTIONS ──────────────────────────────────────────────────────────

  const isSelected = (val: string) =>
    isMulti
      ? selectedMulti.includes(val)
      : (pendingSingle === val ||
         (!pendingSingle && answers[currentQ.id] === val));

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16 bg-white">
      <Container narrow>
        <div className="max-w-lg mx-auto">
          <ProgressBar pct={pct} />

          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[#55575A] text-sm mb-6 hover:text-[#0C0D0F] transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <p className="text-[#55575A] text-xs uppercase tracking-wider mb-2">
            Question {qIndex + 1} of {totalQ}
          </p>
          <h2
            className="text-[#0C0D0F] text-xl md:text-2xl font-bold mb-2 leading-snug"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {currentQ.question}
          </h2>
          {currentQ.subtitle && (
            <p className="text-[#55575A] text-sm mb-5 leading-relaxed">
              {currentQ.subtitle}
            </p>
          )}
          {!currentQ.subtitle && <div className="mb-5" />}

          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const selected = isSelected(opt.value);
              const showField = opt.showText && selected && (isSingleText || isMulti);

              return (
                <div key={opt.value}>
                  <button
                    onClick={() =>
                      isMulti
                        ? handleMultiToggle(opt.value, opt.exclusive)
                        : handleSingleSelect(opt.value)
                    }
                    className={`w-full text-left rounded-xl border-2 px-5 py-4 flex items-start gap-3 transition-all duration-150 ${
                      selected
                        ? "border-brand-red bg-brand-red/5"
                        : "border-[#E5E5E5] bg-white hover:border-brand-red/40 hover:bg-[#FFF5F5]"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 ${
                        isMulti ? "rounded" : "rounded-full"
                      } border-2 flex items-center justify-center transition-colors ${
                        selected ? "bg-brand-red border-brand-red" : "border-gray-300"
                      }`}
                    >
                      {selected && <Check size={11} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#0C0D0F] font-medium text-[14px]">
                        {opt.label}
                      </p>
                      {opt.sublabel && (
                        <p className="text-[#55575A] text-[12px] mt-0.5">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                  </button>
                  {showField && (
                    <div className="mt-2 ml-8">
                      <textarea
                        placeholder={opt.textPlaceholder ?? "Tell us more…"}
                        value={textValues[opt.value] ?? ""}
                        onChange={(e) =>
                          setTextValues((prev) => ({ ...prev, [opt.value]: e.target.value }))
                        }
                        rows={2}
                        className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13px] text-[#0C0D0F] focus:outline-none focus:border-brand-red/50 focus:ring-2 focus:ring-brand-red/10 resize-none transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Single-text continue button */}
          {isSingleText && pendingSingle && (
            <Button
              onClick={handleSingleTextContinue}
              size="lg"
              variant="primary"
              className="w-full rounded-full mt-5"
            >
              Continue →
            </Button>
          )}

          {/* Multi continue button */}
          {isMulti && (
            <Button
              onClick={handleMultiContinue}
              disabled={selectedMulti.length === 0}
              size="lg"
              variant="primary"
              className="w-full rounded-full mt-5"
            >
              Continue →
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
