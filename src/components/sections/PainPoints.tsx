import { useLocale } from "next-intl";

export function PainPoints() {
  const locale = useLocale();
  const isEs = locale === "es";

  const pains = isEs
    ? [
        { fail: "Keto funcionó para tu amiga.", not: "Para ti no." },
        { fail: "El ayuno intermitente te dejó", not: "con hambre y miserable." },
        { fail: "Los boot camps te dejaron adolorida.", not: "La báscula no se movió." },
      ]
    : [
        { fail: "Keto worked for your friend.", not: "Not for you." },
        { fail: "Intermittent fasting made you", not: "miserable and hangry." },
        { fail: "Boot camps left you sore.", not: "The scale didn't budge." },
      ];

  return (
    <section className="py-16 bg-brand-pink-soft">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-4">
          {isEs ? "Lo entendemos. Lo has intentado todo." : "We get it. You've tried everything."}
        </h2>
        <p className="text-body-muted text-center mb-10 text-lg">
          {isEs
            ? "Después de los 35, tu cuerpo juega con reglas diferentes."
            : "After 35, your body plays by different rules."}
        </p>

        <div className="space-y-4 max-w-xl mx-auto mb-10">
          {pains.map((p, i) => (
            <div key={i} className="flex items-start gap-4 bg-white/70 rounded-card px-5 py-4 border border-border">
              <span className="text-error font-bold text-xl mt-0.5 shrink-0">✗</span>
              <p className="text-body text-base">
                {p.fail}{" "}
                <strong className="text-heading">{p.not}</strong>
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-card p-6 text-center shadow-card max-w-xl mx-auto">
          <p className="font-heading text-heading text-xl font-bold mb-2">
            {isEs
              ? "Creamos Body Good Studio para mujeres como tú."
              : "We created Body Good Studio for women like you."}
          </p>
          <p className="text-body-muted">
            {isEs
              ? "Medicina real. Apoyo real. Resultados reales."
              : "Real medicine. Real support. Real results."}
          </p>
        </div>
      </div>
    </section>
  );
}
