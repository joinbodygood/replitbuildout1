"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Gift, Users, Star, Check, ArrowRight } from "lucide-react";

export default function ReferralLandingPage() {
  const params = useParams<{ code: string; locale: string }>();
  const router = useRouter();
  const { code, locale } = params;
  const isEs = locale === "es";
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!code || tracked) return;
    // Set cookie for 30 days
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `referral_code=${code}; expires=${expires}; path=/; SameSite=Lax`;
    // Track click
    fetch("/api/refer/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    }).catch(() => {});
    setTracked(true);
  }, [code, tracked]);

  return (
    <>
      <section className="py-20 bg-brand-pink-soft">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-brand-red/20 text-brand-red text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
              <Gift size={14} />
              {isEs ? "Invitación especial" : "You've been invited"}
            </div>
            <h1 className="font-heading text-heading text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {isEs ? (
                <>A friend thinks you'll love{" "}<span className="text-brand-red">Body Good.</span></>
              ) : (
                <>A friend thinks you'll love{" "}<span className="text-brand-red">Body Good.</span></>
              )}
            </h1>
            <p className="text-body-muted text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              {isEs
                ? "Tu amigo/a te está invitando a comenzar tu camino hacia la pérdida de peso con el programa líder en telesalud."
                : "Your friend is inviting you to start your weight-loss journey with a physician-led telehealth program."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push(`/${locale}/quiz`)}
                className="inline-flex items-center gap-2 bg-brand-red text-white font-heading font-bold px-8 py-4 rounded-pill hover:bg-brand-red-hover transition-all text-base shadow-btn"
              >
                {isEs ? "Comenzar Mi Evaluación Gratuita" : "Start My Free Evaluation"}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push(`/${locale}/how-it-works`)}
                className="inline-flex items-center gap-2 text-body-muted font-medium px-6 py-4 rounded-pill border border-border hover:border-brand-red hover:text-brand-red transition-all"
              >
                {isEs ? "Conocer el programa" : "Learn how it works"}
              </button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-heading text-2xl font-bold text-center mb-12">
              {isEs ? "¿Cómo funciona?" : "How it works"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Gift,
                  title: { en: "Take the free quiz", es: "Haz el quiz gratuito" },
                  desc: { en: "Answer a few questions about your health goals. Takes under 3 minutes.", es: "Responde algunas preguntas sobre tus objetivos de salud. Menos de 3 minutos." },
                  color: "#ed1b1b",
                },
                {
                  icon: Users,
                  title: { en: "Meet your provider", es: "Conoce a tu proveedor" },
                  desc: { en: "A licensed physician reviews your case and creates a personalized plan.", es: "Un médico certificado revisa tu caso y crea un plan personalizado." },
                  color: "#8b5cf6",
                },
                {
                  icon: Star,
                  title: { en: "Get results", es: "Obtén resultados" },
                  desc: { en: "Medication delivered to your door. Ongoing clinical support every step.", es: "Medicamento entregado en tu puerta. Apoyo clínico en cada paso." },
                  color: "#f59e0b",
                },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${step.color}18` }}
                    >
                      <Icon size={24} style={{ color: step.color }} />
                    </div>
                    <h3 className="font-heading text-heading font-bold text-lg mb-2">
                      {isEs ? step.title.es : step.title.en}
                    </h3>
                    <p className="text-body-muted text-sm leading-relaxed">
                      {isEs ? step.desc.es : step.desc.en}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 bg-brand-pink-soft rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Check size={20} className="text-brand-red" />
                <p className="font-heading font-bold text-heading text-lg">
                  {isEs ? "Tu código de referido está activo" : "Your referral code is active"}
                </p>
              </div>
              <p className="text-body-muted text-sm mb-6 max-w-md mx-auto">
                {isEs
                  ? "Este enlace fue compartido por un miembro de Body Good Studio. Al iniciar tu programa, ambos se benefician."
                  : "This link was shared by a Body Good Studio member. When you start your program, you both benefit."}
              </p>
              <button
                onClick={() => router.push(`/${locale}/quiz`)}
                className="inline-flex items-center gap-2 bg-brand-red text-white font-heading font-bold px-8 py-3.5 rounded-pill hover:bg-brand-red-hover transition-all"
              >
                {isEs ? "Comenzar Ahora →" : "Get Started Now →"}
              </button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
