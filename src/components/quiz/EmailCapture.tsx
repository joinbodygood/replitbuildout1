"use client";

import { useState } from "react";

type EmailCaptureProps = {
  locale: string;
  onSubmit: (email: string, phone: string | null) => void;
};

export function EmailCapture({ locale, onSubmit }: EmailCaptureProps) {
  const isEs = locale === "es";
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError(isEs ? "Por favor ingresa un email v\u00e1lido" : "Please enter a valid email");
      return;
    }
    onSubmit(email, phone || null);
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-3">
        {isEs
          ? "\u00bfA d\u00f3nde enviamos tu recomendaci\u00f3n?"
          : "Where should we send your recommendation?"}
      </h2>
      <p className="text-body-muted mb-8">
        {isEs
          ? "Para guardar tus resultados y enviarte tu plan personalizado."
          : "So we can save your results and send your personalized plan."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder={isEs ? "tu@email.com" : "you@email.com"}
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
            required
          />
          {error && <p className="text-error text-sm mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            {isEs ? "Tel\u00e9fono (opcional)" : "Phone (optional)"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Ver Mi Recomendaci\u00f3n \u2192" : "See My Recommendation \u2192"}
        </button>

        <p className="text-body-muted text-xs text-center mt-2">
          {isEs
            ? "No compartimos tu informaci\u00f3n. Sin spam."
            : "We don't share your info. No spam."}
        </p>
      </form>
    </div>
  );
}
