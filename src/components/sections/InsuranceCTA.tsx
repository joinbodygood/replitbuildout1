import { useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { BadgeCheck } from "lucide-react";

export function InsuranceCTA() {
  const locale = useLocale();
  const isEs = locale === "es";

  const carriers = ["Blue Cross", "Aetna", "UnitedHealth", "Cigna", "Humana", "Medicaid"];

  return (
    <section className="py-20 bg-brand-pink-soft">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="w-14 h-14 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
          <BadgeCheck size={26} className="text-white" />
        </div>

        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold mb-4">
          {isEs
            ? "¿Tu seguro cubre los medicamentos GLP-1?"
            : "Wondering if your insurance covers GLP-1 medication?"}
        </h2>
        <p className="text-body-muted text-lg mb-8 leading-relaxed">
          {isEs
            ? "Muchas aseguradoras cubren semaglutida y tirzepatida. Verifica tu elegibilidad en 30 segundos — completamente gratis, sin afectar tu crédito ni tu póliza."
            : "Many plans cover semaglutide and tirzepatide. Check your eligibility in 30 seconds — completely free, with no impact on your credit or policy."}
        </p>

        <Button href={`/${locale}/insurance-check`} size="lg" className="mb-8">
          {isEs ? "Verificar Cobertura Gratis →" : "Check My Coverage — Free →"}
        </Button>

        <div className="flex flex-wrap justify-center gap-3">
          {carriers.map((carrier) => (
            <span
              key={carrier}
              className="text-xs font-semibold text-body-muted bg-white border border-border px-3 py-1.5 rounded-full"
            >
              {carrier}
            </span>
          ))}
          <span className="text-xs font-semibold text-body-muted bg-white border border-border px-3 py-1.5 rounded-full">
            {isEs ? "+ más" : "+ more"}
          </span>
        </div>
      </div>
    </section>
  );
}
