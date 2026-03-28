import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

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
                <>Un peso saludable<br />le hace{" "}<span className="text-brand-red">Body Good</span></>
              ) : (
                <>A healthy weight<br />Does a{" "}<span className="text-brand-red">Body Good</span></>
              )}
            </h1>
            <p className="text-body-muted text-lg mb-8 max-w-lg">
              {isEs
                ? "GLP-1 recetados por médicos certificados. Precios transparentes. Desde $139/mes. Sin cuotas ocultas."
                : "GLP-1 medications prescribed by board-certified doctors. Transparent pricing starting at $139/mo. No hidden fees."}
            </p>

            {/* Three paths teaser */}
            <div className="flex flex-col gap-3 mb-6">
              <Button href={`/${locale}/quiz`} size="lg">
                {isEs ? "No estoy segura — Tomar el Quiz →" : "Not Sure — Take the 2-Minute Quiz →"}
              </Button>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href={`/${locale}/programs`} variant="outline" size="md">
                  {isEs ? "Ya sé lo que quiero" : "I Know What I Want"}
                </Button>
                <Button href={`/${locale}/insurance-check`} variant="secondary" size="md">
                  {isEs ? "¿Cubre mi seguro?" : "Will Insurance Cover Me?"}
                </Button>
              </div>
            </div>

            <p className="text-body-muted text-sm">
              {isEs
                ? "✓ Consulta gratis · ✓ Sin compromiso · ✓ Envío discreto gratis"
                : "✓ Free consultation · ✓ No commitment · ✓ Free discreet shipping"}
            </p>
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
                  ? '"Después de los 35, tu cuerpo necesita un enfoque diferente. Los medicamentos GLP-1 son la herramienta más efectiva que tenemos para la pérdida de peso sostenida."'
                  : '"After 35, your body needs a different approach. GLP-1 medications are the most effective tool we have for sustainable, lasting weight loss."'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { num: "5,000+", label: isEs ? "Pacientes" : "Patients" },
                { num: "4.9★", label: isEs ? "Calificación" : "Rating" },
                { num: "15–25%", label: isEs ? "Pérdida de peso" : "Avg. weight loss" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-card p-4 text-center shadow-card border border-border">
                  <p className="font-heading text-heading text-lg font-bold">{s.num}</p>
                  <p className="text-body-muted text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-card p-4 border border-border flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <p className="text-body-muted text-xs">
                {isEs
                  ? "256-bit SSL · Cumplimiento HIPAA · Sin almacenamiento de PHI"
                  : "256-bit SSL · HIPAA Compliant · No PHI stored on this platform"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
