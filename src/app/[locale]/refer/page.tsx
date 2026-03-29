"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Container } from "@/components/ui/Container";
import { Gift, Copy, Check, Users, Star, Shield, ArrowRight } from "lucide-react";

export default function ReferPage() {
  const locale = useLocale();
  const isEs = locale === "es";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://bodygoodstudio.com";
  const referralUrl = referralCode ? `${origin}/${locale}/refer?ref=${referralCode}` : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || !name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim() }),
      });
      const data = await res.json();
      if (data.code) {
        setReferralCode(data.code);
      } else {
        setError(isEs ? "Error al generar el código. Intenta de nuevo." : "Failed to generate your code. Please try again.");
      }
    } catch {
      setError(isEs ? "Error inesperado. Intenta de nuevo." : "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyCode() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2200);
  }

  function copyLink() {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  }

  const steps = [
    {
      icon: Gift,
      color: "#ed1b1b",
      num: "01",
      title: { en: "Get Your Code", es: "Obtén Tu Código" },
      desc: {
        en: "Enter your name and email below to receive your unique referral code instantly — no account required.",
        es: "Ingresa tu nombre y correo para recibir tu código único al instante — sin necesidad de cuenta.",
      },
    },
    {
      icon: Users,
      color: "#8b5cf6",
      num: "02",
      title: { en: "Share With a Friend", es: "Compártelo Con un Amigo" },
      desc: {
        en: "Send your code or link to anyone who could benefit from physician-led weight loss care.",
        es: "Envía tu código o enlace a cualquier persona que podría beneficiarse de atención médica para bajar de peso.",
      },
    },
    {
      icon: Star,
      color: "#f59e0b",
      num: "03",
      title: { en: "Friend Places Order", es: "Tu Amigo Hace Su Pedido" },
      desc: {
        en: "Your friend enters your referral code during checkout when starting any Body Good Studio program.",
        es: "Tu amigo ingresa tu código al pagar cuando comienza cualquier programa de Body Good Studio.",
      },
    },
    {
      icon: ArrowRight,
      color: "#10b981",
      num: "04",
      title: { en: "You Earn $25 Credit", es: "Ganas $25 de Crédito" },
      desc: {
        en: "We'll email you a $25 BGS credit code automatically once their order is confirmed. No limit.",
        es: "Te enviaremos un código de crédito de $25 por correo automáticamente cuando se confirme su pedido. Sin límite.",
      },
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-brand-pink-soft">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-brand-red/20 text-brand-red text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
              <Gift size={14} />
              {isEs ? "Programa de Referidos — $25 por amigo" : "Referral Program — $25 per friend"}
            </div>
            <h1 className="font-heading text-heading text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {isEs ? (
                <>
                  Invita a una amiga.{" "}
                  <span className="text-brand-red">Gana $25.</span>
                </>
              ) : (
                <>
                  Refer a Friend.{" "}
                  <span className="text-brand-red">Earn $25.</span>
                </>
              )}
            </h1>
            <p className="text-body-muted text-lg mb-4 max-w-xl mx-auto leading-relaxed">
              {isEs
                ? "Comparte Body Good Studio con tus amigas y gana $25 de crédito BGS cada vez que alguien complete su primer pedido con tu código."
                : "Share Body Good Studio with your friends and earn $25 BGS credit every time someone completes their first order with your code."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-body-muted mt-6">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-brand-red" />
                {isEs ? "Sin límite de referidos" : "No limit on referrals"}
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-brand-red" />
                {isEs ? "Crédito enviado por email" : "Credit sent by email"}
              </span>
              <span className="flex items-center gap-1.5">
                <Gift size={14} className="text-brand-red" />
                {isEs ? "Válido en todos los programas" : "Valid on all programs"}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Main */}
      <section className="py-16">
        <Container>
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Form / Code display */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden sticky top-24">
              {!referralCode ? (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#fde7e7] rounded-xl flex items-center justify-center shrink-0">
                      <Gift size={20} className="text-brand-red" />
                    </div>
                    <div>
                      <h2 className="font-heading text-heading text-xl font-bold leading-tight">
                        {isEs ? "Obtén Tu Código Ahora" : "Get Your Code Now"}
                      </h2>
                      <p className="text-body-muted text-sm">
                        {isEs ? "Gratis · Solo 10 segundos" : "Free · Takes 10 seconds"}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-1.5">
                        {isEs ? "Tu Nombre" : "Your Name"} *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isEs ? "María López" : "Jane Smith"}
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors text-heading"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-heading mb-1.5">
                        {isEs ? "Tu Correo Electrónico" : "Your Email Address"} *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-card border border-border focus:border-brand-red focus:outline-none transition-colors text-heading"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-error text-sm">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-red text-white font-heading font-bold py-3.5 rounded-pill hover:bg-brand-red-hover transition-all disabled:opacity-60 text-base"
                    >
                      {loading
                        ? (isEs ? "Generando código..." : "Generating your code...")
                        : (isEs ? "Obtener Mi Código de Referido →" : "Get My Referral Code →")}
                    </button>
                  </form>

                  <p className="text-center text-xs text-body-muted mt-4">
                    {isEs
                      ? "Al registrarte, aceptas recibir comunicaciones de Body Good Studio."
                      : "By signing up, you agree to receive communications from Body Good Studio."}
                  </p>
                </div>
              ) : (
                <div className="p-8">
                  {/* Success state */}
                  <div className="text-center mb-7">
                    <div className="w-14 h-14 bg-[#d1fae5] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check size={26} className="text-emerald-600" />
                    </div>
                    <h2 className="font-heading text-heading text-xl font-bold mb-1">
                      {isEs ? "¡Tu código está listo!" : "Your code is ready!"}
                    </h2>
                    <p className="text-body-muted text-sm">
                      {isEs
                        ? "Compártelo con tus amigas para ganar $25"
                        : "Share it with your friends to earn $25"}
                    </p>
                  </div>

                  {/* Referral code box */}
                  <div className="bg-surface-dim rounded-xl p-5 mb-4">
                    <p className="text-[11px] font-semibold text-body-muted uppercase tracking-widest mb-2">
                      {isEs ? "Tu Código de Referido" : "Your Referral Code"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-3xl font-bold text-heading tracking-widest">
                        {referralCode}
                      </span>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:text-brand-red-hover transition-colors"
                      >
                        {copiedCode
                          ? <><Check size={14} />{isEs ? "¡Copiado!" : "Copied!"}</>
                          : <><Copy size={14} />{isEs ? "Copiar" : "Copy"}</>}
                      </button>
                    </div>
                  </div>

                  {/* Share link */}
                  <div className="border border-border rounded-xl p-4 mb-5">
                    <p className="text-[11px] font-semibold text-body-muted uppercase tracking-widest mb-2">
                      {isEs ? "O comparte este enlace directo" : "Or share this direct link"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-body-muted truncate flex-1 font-mono">
                        {referralUrl}
                      </span>
                      <button
                        onClick={copyLink}
                        className="shrink-0 flex items-center gap-1 text-sm font-semibold text-brand-red hover:text-brand-red-hover transition-colors"
                      >
                        {copiedLink
                          ? <><Check size={13} />{isEs ? "Copiado" : "Copied"}</>
                          : <><Copy size={13} />{isEs ? "Copiar" : "Copy"}</>}
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#fde7e7] rounded-xl p-4">
                    <p className="text-sm text-[#7f1d1d] leading-relaxed">
                      {isEs
                        ? "Cuando tu amigo complete su pedido usando tu código, recibirás un correo con tu crédito de $25 BGS — listo para usar en cualquier programa."
                        : "When your friend completes their order using your code, you'll receive an email with your $25 BGS credit — ready to apply to any program."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: How it works */}
            <div>
              <h2 className="font-heading text-heading text-2xl font-bold mb-8">
                {isEs ? "Cómo Funciona" : "How It Works"}
              </h2>
              <div className="space-y-7">
                {steps.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="shrink-0 flex flex-col items-center">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${step.color}18` }}
                        >
                          <StepIcon size={18} style={{ color: step.color }} />
                        </div>
                        {i < steps.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2 mb-0" style={{ minHeight: "24px" }} />
                        )}
                      </div>
                      <div className="pb-6">
                        <span className="text-[10px] font-bold text-body-muted tracking-widest uppercase">
                          {step.num}
                        </span>
                        <h3 className="font-heading text-heading font-bold text-base mt-0.5 mb-1">
                          {isEs ? step.title.es : step.title.en}
                        </h3>
                        <p className="text-body-muted text-sm leading-relaxed">
                          {isEs ? step.desc.es : step.desc.en}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fine print */}
              <div className="mt-6 p-5 bg-surface-dim rounded-xl space-y-2">
                <p className="text-xs font-semibold text-heading mb-2">
                  {isEs ? "Términos del Programa" : "Program Terms"}
                </p>
                {[
                  { en: "Credit applies to new patients only — one redemption per person.", es: "El crédito aplica solo a nuevos pacientes — un canje por persona." },
                  { en: "$25 credit is valid for 90 days from the date it's issued.", es: "El crédito de $25 es válido por 90 días desde la fecha en que se emite." },
                  { en: "Body Good Studio reserves the right to modify or end this program at any time.", es: "Body Good Studio se reserva el derecho de modificar o finalizar este programa en cualquier momento." },
                ].map((item, i) => (
                  <p key={i} className="text-xs text-body-muted">
                    · {isEs ? item.es : item.en}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA banner */}
      <section className="py-14 bg-brand-pink-soft">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-heading text-2xl font-bold mb-3">
              {isEs ? "¿Tienes el código de un amigo?" : "Have a Friend's Referral Code?"}
            </h2>
            <p className="text-body-muted mb-6">
              {isEs
                ? "Ingresa su código al pagar durante el proceso de compra en cualquier programa."
                : "Enter their code during checkout when you start any program with us."}
            </p>
            <a
              href={`/${locale}/quiz`}
              className="inline-flex items-center gap-2 bg-brand-red text-white font-heading font-bold px-8 py-3.5 rounded-pill hover:bg-brand-red-hover transition-all"
            >
              {isEs ? "Comenzar Mi Programa →" : "Start My Program →"}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
