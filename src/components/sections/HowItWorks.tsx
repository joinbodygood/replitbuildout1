import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

export function HowItWorks() {
  const locale = useLocale();
  const isEs = locale === "es";

  const steps = isEs
    ? [
        {
          num: "1",
          icon: "📋",
          title: "Toma el quiz",
          desc: "Responde algunas preguntas sobre tu salud y objetivos en menos de 2 minutos.",
        },
        {
          num: "2",
          icon: "👩‍⚕️",
          title: "Recibe tu plan",
          desc: "Un proveedor certificado revisa tu caso y crea tu tratamiento personalizado.",
        },
        {
          num: "3",
          icon: "📦",
          title: "Empieza a sentirte mejor",
          desc: "Tu medicamento llega directo a tu puerta. Envío gratis y discreto.",
        },
      ]
    : [
        {
          num: "1",
          icon: "📋",
          title: "Take the quiz",
          desc: "Answer a few questions about your health goals in under 2 minutes.",
        },
        {
          num: "2",
          icon: "👩‍⚕️",
          title: "Get your plan",
          desc: "A licensed provider reviews your case and creates your personalized treatment.",
        },
        {
          num: "3",
          icon: "📦",
          title: "Start feeling better",
          desc: "Your medication ships directly to your door. Free, discreet shipping.",
        },
      ];

  return (
    <section className="py-16 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "El proceso" : "How it works"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-3">
          {isEs ? "Comienza en menos de 5 minutos" : "Get started in less than 5 minutes"}
        </h2>
        <p className="text-body-muted text-center mb-12">
          {isEs
            ? "Sin visitas al médico. Sin sala de espera."
            : "No office visits. No waiting room."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 bg-brand-pink-soft rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {step.icon}
              </div>
              <div className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center mx-auto -mt-6 mb-4 font-heading font-bold text-sm relative z-10 shadow">
                {step.num}
              </div>
              <h3 className="font-heading text-heading text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-body-muted text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-10 py-6 border-y border-border">
          {["LICENSED US-BASED PHARMACY", "COMPOUNDED IN THE USA", "FDA-REGISTERED FACILITY"].map((badge) => (
            <span key={badge} className="text-xs font-bold text-body-muted tracking-widest uppercase">
              {badge}
            </span>
          ))}
        </div>

        <div className="text-center">
          <Button href={`/${locale}/quiz`} size="lg">
            {isEs ? "Tomar el Quiz →" : "Take the Quiz →"}
          </Button>
        </div>
      </div>
    </section>
  );
}
