"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";

const faqs = {
  en: [
    {
      q: "How does telehealth work for prescriptions?",
      a: "You complete our intake quiz online. A licensed US-based physician reviews your health information and — if appropriate — writes a prescription. Your medication is then dispensed by an FDA-registered pharmacy and shipped directly to your door. You never need to visit an office.",
    },
    {
      q: "Is GLP-1 medication safe for long-term use?",
      a: "GLP-1 receptor agonists have been used clinically for over 15 years and are FDA-approved for chronic weight management. Your Body Good physician will monitor your progress and health markers throughout your treatment. Safety is always the first consideration.",
    },
    {
      q: "How long until I see results?",
      a: "Most patients begin noticing changes in appetite and energy within the first 2–4 weeks. Meaningful weight loss is typically visible by weeks 8–12. Results vary by individual, starting dose, and treatment plan — your physician will set realistic expectations at intake.",
    },
    {
      q: "Does Body Good accept insurance?",
      a: "Many insurance plans cover GLP-1 medications when prescribed for weight management. Our free insurance checker can verify your coverage in about 30 seconds. For patients without coverage, we offer transparent cash-pay pricing starting at $139/mo.",
    },
    {
      q: "What if I have tried GLP-1 medications before?",
      a: "Prior experience with GLP-1 medications is actually helpful information for your physician. Whether you had side effects, didn't respond as expected, or are returning after a break — your provider will factor that history into your personalized plan.",
    },
    {
      q: "How is Body Good different from other weight loss programs?",
      a: "Body Good is a physician-led practice, not a subscription service with algorithmic recommendations. Every patient is reviewed by a licensed doctor. We combine clinical-grade medication with ongoing provider support — and we speak to the specific experience of women over 35.",
    },
    {
      q: "Is my health information private and secure?",
      a: "Yes. Our platform is HIPAA-compliant and uses 256-bit SSL encryption. We do not store protected health information (PHI) on this platform — clinical records live in our secure medical portal. Your information is never sold or shared for marketing purposes.",
    },
    {
      q: "What happens after I take the quiz?",
      a: "After the quiz, you'll receive a personalized program recommendation. You can then review product details and pricing before making any commitment. If you choose to proceed, you'll complete a brief medical intake form that your physician reviews before your prescription is issued.",
    },
  ],
  es: [
    {
      q: "¿Cómo funciona la telemedicina para recetas?",
      a: "Completas nuestro cuestionario de salud en línea. Un médico con licencia en EE. UU. revisa tu información y, si es apropiado, emite una receta. Tu medicamento es dispensado por una farmacia registrada en la FDA y enviado directamente a tu puerta. No necesitas visitar una oficina.",
    },
    {
      q: "¿Es seguro el medicamento GLP-1 a largo plazo?",
      a: "Los agonistas del receptor GLP-1 se han utilizado clínicamente durante más de 15 años y están aprobados por la FDA para el control crónico del peso. Tu médico de Body Good monitoreará tu progreso y los marcadores de salud durante todo el tratamiento.",
    },
    {
      q: "¿Cuánto tiempo hasta ver resultados?",
      a: "La mayoría de los pacientes comienzan a notar cambios en el apetito y la energía en las primeras 2–4 semanas. La pérdida de peso significativa es generalmente visible para las semanas 8–12. Los resultados varían según el individuo y el plan de tratamiento.",
    },
    {
      q: "¿Acepta Body Good seguro médico?",
      a: "Muchos planes de seguro cubren medicamentos GLP-1 cuando se recetan para el control del peso. Nuestro verificador de seguro gratuito puede verificar tu cobertura en aproximadamente 30 segundos. Para pacientes sin cobertura, ofrecemos precios de pago en efectivo desde $139/mes.",
    },
    {
      q: "¿Qué pasa si ya he probado medicamentos GLP-1 antes?",
      a: "La experiencia previa con medicamentos GLP-1 es información valiosa para tu médico. Ya sea que hayas tenido efectos secundarios, no hayas respondido como se esperaba, o estés regresando después de un descanso — tu proveedor tomará ese historial en cuenta.",
    },
    {
      q: "¿En qué se diferencia Body Good de otros programas?",
      a: "Body Good es una práctica liderada por médicos, no un servicio de suscripción con recomendaciones algorítmicas. Cada paciente es revisada por un médico con licencia. Combinamos medicamentos de calidad clínica con apoyo continuo del proveedor.",
    },
    {
      q: "¿Es privada y segura mi información de salud?",
      a: "Sí. Nuestra plataforma cumple con HIPAA y utiliza cifrado SSL de 256 bits. No almacenamos información de salud protegida (PHI) en esta plataforma. Tu información nunca se vende ni se comparte con fines de marketing.",
    },
    {
      q: "¿Qué pasa después de tomar el quiz?",
      a: "Después del quiz, recibirás una recomendación de programa personalizada. Puedes revisar los detalles del producto y los precios antes de comprometerte. Si decides continuar, completarás un breve formulario de historial médico que tu médico revisará.",
    },
  ],
};

export function FAQ() {
  const locale = useLocale();
  const isEs = locale === "es";
  const items = isEs ? faqs.es : faqs.en;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "Preguntas frecuentes" : "Common questions"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-14">
          {isEs ? "Lo que más nos preguntan" : "What patients ask most"}
        </h2>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-border rounded-card overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-surface-dim transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-heading font-semibold text-heading text-sm leading-snug">
                  {item.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-brand-red shrink-0 transition-transform duration-200 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-body-muted text-sm leading-relaxed border-t border-border pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.en.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              })),
            }),
          }}
        />
      </div>
    </section>
  );
}
