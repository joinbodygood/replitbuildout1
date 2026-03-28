"use client";

import { useState } from "react";

type InsuranceQuestionsProps = {
  locale: string;
  onSubmit: (carrier: string, planType: string, state: string, probability: number) => void;
};

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

export function InsuranceQuestions({ locale, onSubmit }: InsuranceQuestionsProps) {
  const isEs = locale === "es";
  const [carrier, setCarrier] = useState("");
  const [planType, setPlanType] = useState("");
  const [state, setState] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!carrier || !planType || !state) return;

    // Check probability from API
    let probability = 50; // default
    try {
      const res = await fetch(
        `/api/insurance-probability?carrier=${encodeURIComponent(carrier)}&planType=${encodeURIComponent(planType)}&state=${encodeURIComponent(state)}`
      );
      if (res.ok) {
        const data = await res.json();
        probability = data.probability;
      }
    } catch {}

    onSubmit(carrier, planType, state, probability);
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-3">
        {isEs ? "Detalles de tu seguro" : "Your insurance details"}
      </h2>
      <p className="text-body-muted mb-8">
        {isEs
          ? "Verificaremos la probabilidad de cobertura para ti."
          : "We'll check your coverage probability for you."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            {isEs ? "Aseguradora" : "Insurance Carrier"}
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
            {isEs ? "Tipo de plan" : "Plan Type"}
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
            {isEs ? "Estado" : "State"}
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

        <button
          type="submit"
          className="w-full mt-4 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Verificar Mi Cobertura \u2192" : "Check My Coverage \u2192"}
        </button>
      </form>
    </div>
  );
}
