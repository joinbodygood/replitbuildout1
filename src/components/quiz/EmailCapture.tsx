"use client";

import { useState } from "react";

type EmailCaptureProps = {
  locale: string;
  onSubmit: (email: string, firstName: string, phone: string | null) => void;
};

export function EmailCapture({ locale, onSubmit }: EmailCaptureProps) {
  const isEs = locale === "es";
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError(isEs ? "Por favor ingresa tu nombre" : "Please enter your first name");
      return;
    }
    if (!email || !email.includes("@")) {
      setError(isEs ? "Por favor ingresa un email válido" : "Please enter a valid email");
      return;
    }
    onSubmit(email, firstName.trim(), phone || null);
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2 text-center">
        {isEs
          ? "Tu recomendación personalizada está lista."
          : "Your personalized recommendation is ready."}
      </h2>
      <p className="text-body-muted text-center mb-2">
        {isEs ? "¿A dónde la enviamos?" : "Where should we send it?"}
      </p>
      <p className="text-body-muted text-xs text-center mb-8">
        {isEs
          ? "También recibirás el plan de tratamiento recomendado por tu médico y una oferta especial para pacientes nuevas."
          : "You'll also receive your doctor-matched program recommendation and an exclusive offer for first-time patients."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-semibold text-heading mb-1.5">
            {isEs ? "Nombre" : "First Name"} *
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => { setFirstName(e.target.value); setError(""); }}
            placeholder={isEs ? "Tu nombre" : "Your first name"}
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-heading mb-1.5">
            {isEs ? "Correo Electrónico" : "Email Address"} *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder={isEs ? "tu@email.com" : "you@email.com"}
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-heading mb-1.5">
            {isEs ? "Teléfono (opcional)" : "Phone (optional)"}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full mt-4 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Ver Mis Resultados →" : "See My Results →"}
        </button>

        <p className="text-body-muted text-xs text-center">
          {isEs
            ? "Nunca vendemos tu información. Cancela suscripción cuando quieras."
            : "We never sell your information. Unsubscribe anytime."}
        </p>
      </form>
    </div>
  );
}
