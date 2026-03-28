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
              {isEs ? "Bienestar para mujeres 35+" : "Wellness for Women 35+"}
            </p>
            <h1 className="font-heading text-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {isEs ? (
                <>Un peso saludable<br />le hace <span className="text-brand-red">Body Good</span></>
              ) : (
                <>A healthy weight<br />Does a <span className="text-brand-red">Body Good</span></>
              )}
            </h1>
            <p className="text-body-muted text-lg md:text-xl mb-8 max-w-lg">
              {isEs
                ? "Programas de bienestar personalizados diseñados para mujeres 35+. Medicamentos GLP-1 recetados por médicos certificados. Desde $139/mes."
                : "Personalized wellness programs designed for women 35+. GLP-1 medications prescribed by board-certified doctors. Starting at $139/mo."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button href={`/${locale}/quiz`} size="lg">
                {isEs ? "Tomar el Quiz de 2 Minutos" : "Take the 2-Minute Quiz"}
              </Button>
              <Button href={`/${locale}/programs`} variant="outline" size="lg">
                {isEs ? "Ver Programas" : "Explore Programs"}
              </Button>
            </div>
            <p className="text-body-muted text-sm mt-4">
              {isEs
                ? "✓ Consulta gratis · ✓ Sin compromiso · ✓ Envío gratis"
                : "✓ Free consultation · ✓ No commitment · ✓ Free shipping"}
            </p>
          </div>

          {/* Visual panel */}
          <div className="hidden md:flex flex-col gap-4">
            <div className="bg-white rounded-card shadow-card p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white font-heading font-bold text-lg">
                  LM
                </div>
                <div>
                  <p className="font-heading text-heading font-bold text-sm">Dr. Linda Moleon, MD</p>
                  <p className="text-body-muted text-xs">Founder · Obesity Medicine Specialist</p>
                </div>
              </div>
              <p className="text-body text-sm leading-relaxed italic">
                {isEs
                  ? '"Después de los 35, el cuerpo necesita un enfoque diferente. Los medicamentos GLP-1 son la herramienta más efectiva que tenemos."'
                  : '"After 35, the body needs a different approach. GLP-1 medications are the most effective tool we have for sustainable weight loss."'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { num: "5,000+", label: isEs ? "Pacientes" : "Patients" },
                { num: "4.9★", label: isEs ? "Calificación" : "Rating" },
                { num: "15-25%", label: isEs ? "Pérdida de peso" : "Avg. weight loss" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-card p-4 text-center shadow-card border border-border">
                  <p className="font-heading text-heading text-lg font-bold">{s.num}</p>
                  <p className="text-body-muted text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
