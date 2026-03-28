"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const CARRIERS = [
  "UnitedHealthcare", "Blue Cross Blue Shield", "Aetna", "Cigna", "Humana",
  "Kaiser Permanente", "Anthem", "Centene", "Molina", "WellCare",
  "Ambetter", "Oscar Health", "Florida Blue", "Other",
];

const PLAN_TYPES = ["PPO", "HMO", "EPO", "POS", "HDHP", "Other"];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function InsuranceCheckPage() {
  const locale = useLocale();
  const isEs = locale === "es";

  const [carrier, setCarrier] = useState("");
  const [planType, setPlanType] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ probability: number; notes: string | null } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!carrier || !planType || !state || !email) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/insurance-probability?carrier=${encodeURIComponent(carrier)}&planType=${encodeURIComponent(planType)}&state=${encodeURIComponent(state)}`
      );
      const data = await res.json();
      setResult(data);

      // Save lead
      fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          quizOutcome: "insurance-check",
          locale,
        }),
      }).catch(() => {});
    } catch {
      setResult({ probability: 50, notes: "Unable to check at this time" });
    } finally {
      setLoading(false);
    }
  }

  function getProbabilityDisplay(prob: number) {
    if (prob === -1) {
      return {
        color: "text-body-muted",
        bgColor: "bg-surface-dim",
        barColor: "bg-border",
        label: isEs ? "DATOS INSUFICIENTES" : "INSUFFICIENT DATA",
        message: isEs
          ? "No tenemos suficientes datos sobre tu aseguradora todavia. Dejanos verificar por ti."
          : "We don't have enough data on your carrier yet. Let us check for you.",
        barWidth: "50%",
      };
    }
    if (prob >= 70) {
      return {
        color: "text-success",
        bgColor: "bg-success-soft",
        barColor: "bg-success",
        label: isEs ? "ALTA PROBABILIDAD" : "HIGH PROBABILITY",
        message: isEs
          ? "Buenas noticias! Pacientes con tu plan tipicamente obtienen cobertura. Obten la respuesta definitiva:"
          : "Great news! Patients with your plan typically get coverage. Get the definitive answer:",
        barWidth: `${prob}%`,
      };
    }
    if (prob >= 40) {
      return {
        color: "text-warning",
        bgColor: "bg-yellow-50",
        barColor: "bg-warning",
        label: isEs ? "POSIBLE" : "POSSIBLE",
        message: isEs
          ? "La cobertura es posible pero puede requerir autorizacion previa. Dejanos verificar por ti:"
          : "Coverage is possible but may require prior authorization. Let us check for you:",
        barWidth: `${prob}%`,
      };
    }
    return {
      color: "text-error",
      bgColor: "bg-red-50",
      barColor: "bg-error",
      label: isEs ? "PROBABILIDAD BAJA" : "LOW PROBABILITY",
      message: isEs
        ? "La cobertura de seguro puede ser limitada. Explora nuestras opciones de autofinanciamiento asequibles:"
        : "Insurance coverage may be limited. Explore our affordable self-pay options:",
      barWidth: `${prob}%`,
    };
  }

  return (
    <>
      <section className="py-16 bg-brand-pink-soft">
        <Container narrow>
          <div className="text-center">
            <Badge variant="pink">{isEs ? "GRATIS" : "FREE"}</Badge>
            <h1 className="font-heading text-heading text-3xl md:text-4xl font-bold mt-4 mb-4">
              {isEs
                ? "Tu Seguro Cubre Medicamentos GLP-1?"
                : "Does Your Insurance Cover GLP-1 Medications?"}
            </h1>
            <p className="text-body-muted text-lg max-w-xl mx-auto">
              {isEs
                ? "Descubrelo al instante. Sin costo. Sin compromiso."
                : "Find out instantly. No cost. No commitment."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container narrow>
          {!result ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  {isEs ? "Aseguradora" : "Insurance Carrier"} *
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
                  required
                >
                  <option value="">{isEs ? "Selecciona..." : "Select..."}</option>
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  {isEs ? "Tipo de Plan" : "Plan Type"} *
                </label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
                  required
                >
                  <option value="">{isEs ? "Selecciona..." : "Select..."}</option>
                  {PLAN_TYPES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  {isEs ? "Estado" : "State"} *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
                  required
                >
                  <option value="">{isEs ? "Selecciona..." : "Select..."}</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEs ? "tu@email.com" : "you@email.com"}
                  className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base disabled:opacity-50"
              >
                {loading
                  ? (isEs ? "Verificando..." : "Checking...")
                  : (isEs ? "Verificar Mi Cobertura — Gratis" : "Check My Coverage — Free")}
              </button>

              <p className="text-body-muted text-xs text-center">
                {isEs
                  ? "No compartimos tu informacion. Sin spam."
                  : "We don't share your info. No spam."}
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto text-center">
              {(() => {
                const display = getProbabilityDisplay(result.probability);
                return (
                  <>
                    <div className={`rounded-card p-8 ${display.bgColor} mb-6`}>
                      <p className={`font-heading font-bold text-sm mb-3 ${display.color}`}>
                        {display.label}
                      </p>

                      {result.probability >= 0 && (
                        <>
                          <p className="font-heading text-heading text-5xl font-bold mb-2">
                            {result.probability}%
                          </p>
                          <div className="w-full bg-border rounded-full h-3 mb-4">
                            <div
                              className={`h-3 rounded-full ${display.barColor} transition-all duration-700`}
                              style={{ width: display.barWidth }}
                            />
                          </div>
                        </>
                      )}

                      <p className="text-body text-sm">
                        {display.message}
                      </p>

                      {result.notes && (
                        <p className="text-body-muted text-xs mt-2 italic">{result.notes}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Button href={`/${locale}/products/insurance-eligibility-check`} size="lg">
                        {isEs ? "Verificacion Oficial — $25" : "Official Eligibility Check — $25"}
                      </Button>

                      {result.probability < 70 && (
                        <div className="pt-2">
                          <p className="text-body-muted text-sm mb-2">
                            {isEs ? "O explora opciones de autofinanciamiento:" : "Or explore self-pay options:"}
                          </p>
                          <Button href={`/${locale}/programs`} variant="outline" size="md">
                            {isEs ? "Ver Programas de Autofinanciamiento" : "See Self-Pay Programs"}
                          </Button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setResult(null)}
                      className="text-body-muted text-sm hover:text-brand-red mt-6 transition-colors"
                    >
                      {isEs ? "← Verificar otra vez" : "← Check again"}
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
