import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";

export function BottomCTA() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-20 bg-brand-red">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-heading text-white text-3xl md:text-4xl font-bold mb-4">
          {isEs
            ? "¿Lista para sentirte tú misma otra vez?"
            : "Ready to feel like yourself again?"}
        </h2>
        <p className="text-white/80 text-lg mb-8">
          {isEs
            ? "Únete a miles de mujeres que encontraron una mejor manera."
            : "Join thousands of women who've found a better way."}
        </p>
        <Button
          href={`/${locale}/quiz`}
          variant="outline"
          size="lg"
          className="border-white text-white hover:bg-white hover:text-brand-red"
        >
          {isEs ? "Comenzar Ahora →" : "Get Started Now →"}
        </Button>
        <p className="text-white/60 text-sm mt-4">
          {isEs
            ? "Consulta gratis · Sin compromiso · Resultados en semanas"
            : "Free consultation · No commitment · Results in weeks"}
        </p>
      </div>
    </section>
  );
}
