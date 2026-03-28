import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Star } from "lucide-react";

export function Hero() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="relative overflow-hidden bg-brand-pink-soft py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest mb-4">
              {isEs ? "Bienestar médico para mujeres 35+" : "Physician-Led Wellness for Women 35+"}
            </p>
            <h1 className="font-heading text-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {isEs ? (
                <>Mereces una médica que<br />realmente <span className="text-brand-red">te escuche.</span></>
              ) : (
                <>You deserve a doctor<br />who actually <span className="text-brand-red">listens.</span></>
              )}
            </h1>
            <p className="text-body-muted text-lg mb-8 max-w-lg leading-relaxed">
              {isEs
                ? "Atención médica real de médicos certificados que entienden tu cuerpo. Medicamentos GLP-1 recetados, entregados discretamente. Desde $139/mes."
                : "Real medical care from board-certified doctors who understand your body. GLP-1 medications prescribed and delivered discreetly. Starting at $139/mo."}
            </p>

            <div className="flex flex-col gap-3 mb-8">
              <Button href={`/${locale}/programs`} size="lg">
                {isEs ? "Ver Nuestros Programas →" : "Explore Our Programs →"}
              </Button>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href={`/${locale}/quiz`} variant="outline" size="md">
                  {isEs ? "Tomar el Quiz de 2 Minutos" : "Take the 2-Minute Quiz"}
                </Button>
                <Button href={`/${locale}/insurance-check`} variant="secondary" size="md">
                  {isEs ? "Verificar Cobertura de Seguro — Gratis" : "Check Insurance Coverage — Free"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {(isEs
                ? ["Consulta gratis", "Sin compromiso", "Envío discreto gratis"]
                : ["Free consultation", "No commitment", "Free discreet shipping"]
              ).map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-sm text-body-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Visual panel */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="bg-white rounded-card shadow-card p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white font-heading font-bold text-lg shrink-0">
                  LM
                </div>
                <div>
                  <p className="font-heading text-heading font-bold text-sm">Dr. Linda Moleon, MD</p>
                  <p className="text-body-muted text-xs">Founder · Double Board-Certified</p>
                  <p className="text-body-muted text-xs">Anesthesiologist & Obesity Medicine</p>
                </div>
              </div>
              <p className="text-body text-sm leading-relaxed italic">
                {isEs
                  ? '"Después de los 35, tu cuerpo necesita un enfoque diferente. Mereces atención médica que trabaje contigo, no en tu contra."'
                  : '"After 35, your body needs a different approach. You deserve medical care that works with you, not against you."'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { num: "5,000+", label: isEs ? "Pacientes" : "Patients" },
                { num: "4.9", label: isEs ? "Calificación" : "Rating" },
                { num: "15–25%", label: isEs ? "Pérdida de peso" : "Avg. weight loss" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-card p-4 text-center shadow-card border border-border">
                  <p className="font-heading text-heading text-lg font-bold flex items-center justify-center gap-0.5">
                    {s.num}
                    {s.label.includes("Rating") || s.label.includes("Calificación") ? (
                      <Star size={14} className="fill-yellow-400 text-yellow-400 ml-0.5" />
                    ) : null}
                  </p>
                  <p className="text-body-muted text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-card p-4 border border-border flex items-center gap-3">
              <ShieldCheck size={22} className="text-brand-red shrink-0" />
              <p className="text-body-muted text-xs">
                {isEs
                  ? "256-bit SSL · Cumplimiento HIPAA · Sin almacenamiento de PHI en esta plataforma"
                  : "256-bit SSL · HIPAA Compliant · No PHI stored on this platform"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
