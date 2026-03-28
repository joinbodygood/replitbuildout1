import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

export function BottomCTA() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-20 bg-brand-red">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="font-heading text-white text-3xl md:text-4xl font-bold mb-4">
          {isEs
            ? "¿Lista para sentirte tú misma otra vez?"
            : "Ready to feel like yourself again?"}
        </h2>
        <p className="text-white/80 text-lg mb-10 leading-relaxed">
          {isEs
            ? "Únete a miles de mujeres que eligieron atención médica real."
            : "Join thousands of women who chose real medical care."}
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Button
            href={`/${locale}/programs`}
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-brand-red w-full max-w-sm"
          >
            {isEs ? "Ver Nuestros Programas →" : "Explore Our Programs →"}
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
            <Button
              href={`/${locale}/quiz`}
              variant="outline"
              size="md"
              className="border-white/50 text-white hover:bg-white/10 flex-1"
            >
              {isEs ? "Tomar el Quiz" : "Take the Quiz"}
            </Button>
            <Button
              href={`/${locale}/insurance-check`}
              variant="outline"
              size="md"
              className="border-white/50 text-white hover:bg-white/10 flex-1"
            >
              {isEs ? "Verificar Seguro" : "Check Insurance"}
            </Button>
          </div>
        </div>

        <p className="text-white/50 text-sm mt-8">
          {isEs
            ? "Consulta gratis · Sin compromiso · Resultados en semanas"
            : "Free consultation · No commitment · Results in weeks"}
        </p>
      </div>
    </section>
  );
}
