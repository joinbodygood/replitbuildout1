"use client";

type InterstitialCardProps = {
  variant: "education" | "trust" | "stats";
  locale: string;
  onContinue: () => void;
};

export function InterstitialCard({ variant, locale, onContinue }: InterstitialCardProps) {
  const isEs = locale === "es";

  if (variant === "education") {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-brand-red font-heading font-semibold text-xs uppercase tracking-widest text-center mb-3">
          {isEs ? "Tarjeta Educativa 1 de 3" : "Education Card 1 of 3"}
        </p>
        <h2 className="font-heading text-heading text-2xl font-bold text-center mb-8">
          {isEs
            ? "Dos medicamentos. Un objetivo. Aquí está la diferencia."
            : "Two medications. One goal. Here's the difference."}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-card border border-border p-6 bg-surface text-left">
            <h3 className="font-heading text-heading text-lg font-bold mb-1">Semaglutide</h3>
            <p className="text-body-muted text-xs mb-4">
              {isEs ? "El ingrediente activo de Ozempic y Wegovy" : "The active ingredient in Ozempic & Wegovy"}
            </p>
            <p className="text-body text-sm leading-relaxed mb-4">
              {isEs
                ? "Funciona imitando una hormona llamada GLP-1 que controla las señales de hambre en tu cerebro. Disponible como inyección o pastilla diaria."
                : "Works by mimicking a hormone called GLP-1 that controls hunger signals in your brain. Available as an injection or a daily pill."}
            </p>
            <div className="text-3xl font-heading font-bold text-blue-600 mb-0.5">~15%</div>
            <p className="text-body-muted text-xs uppercase tracking-wide font-semibold">
              {isEs ? "pérdida de peso promedio en ensayos clínicos" : "Average body weight lost in clinical trials"}
            </p>
          </div>

          <div className="rounded-card border-2 border-brand-red p-6 bg-brand-pink-soft text-left">
            <h3 className="font-heading text-heading text-lg font-bold mb-1">Tirzepatide</h3>
            <p className="text-body-muted text-xs mb-4">
              {isEs ? "El ingrediente activo de Mounjaro y Zepbound" : "The active ingredient in Mounjaro & Zepbound"}
            </p>
            <p className="text-body text-sm leading-relaxed mb-4">
              {isEs
                ? "Actúa sobre dos hormonas — GLP-1 y GIP — por eso los ensayos clínicos mostraron resultados aún mayores."
                : "Works on two hormones — GLP-1 and GIP — which is why clinical trials showed even greater results."}
            </p>
            <div className="text-3xl font-heading font-bold text-brand-red mb-0.5">~20%</div>
            <p className="text-body-muted text-xs uppercase tracking-wide font-semibold">
              {isEs ? "pérdida de peso promedio en ensayos clínicos" : "Average body weight lost in clinical trials"}
            </p>
          </div>
        </div>

        <p className="text-body-muted text-sm text-center mb-8">
          {isEs
            ? "Ambos están aprobados por la FDA. Ambos son seguros cuando son recetados por un médico. El correcto para ti depende de tu cuerpo, tus objetivos y tu historial. Eso es exactamente lo que este quiz nos ayuda a determinar."
            : "Both are FDA-approved. Both are safe when prescribed by a physician. The right one for you depends on your body, your goals, and your history. That's exactly what this quiz helps us figure out."}
        </p>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
          >
            {isEs ? "Siguiente Pregunta →" : "Next Question →"}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "trust") {
    return (
      <div className="max-w-xl mx-auto">
        <p className="text-brand-red font-heading font-semibold text-xs uppercase tracking-widest text-center mb-3">
          {isEs ? "Tarjeta de Confianza 2 de 3" : "Trust Card 2 of 3"}
        </p>
        <h2 className="font-heading text-heading text-2xl font-bold text-center mb-8">
          {isEs
            ? "Palabras reales de las mujeres detrás de tu cuidado."
            : "Real talk from the women behind your care."}
        </h2>

        <div className="bg-brand-pink-soft rounded-card border border-border/50 p-7 mb-6 relative">
          <div className="text-6xl font-heading font-bold text-brand-red/10 absolute top-3 left-5 leading-none select-none">"</div>
          <blockquote className="text-body text-sm leading-relaxed italic space-y-4 relative z-10">
            <p>
              {isEs
                ? "Lo entendemos. De verdad."
                : "We get it. We really do."}
            </p>
            <p>
              {isEs
                ? "Las dietas que funcionan tres semanas y luego no. La culpa después de comer algo \"malo.\" Las mañanas en que evitas el espejo. Las citas médicas donde nadie realmente te escucha."
                : "The diets that work for three weeks and then don't. The guilt after eating something \"wrong.\" The mornings where you avoid the mirror. The doctor's appointments where no one actually listens."}
            </p>
            <p>
              {isEs
                ? "Hemos estado ahí — no solo como proveedoras, sino como mujeres que hemos luchado con nuestro propio peso, hormonas y autoimagen. La Dr. Linda aumentó 80 libras durante su embarazo gemelar. Ketty ha acompañado a pacientes y familiares a quienes les dijeron que \"simplemente comieran menos\" cuando la respuesta real era médica."
                : "We've been there — not just as providers, but as women who've fought our own battles with weight, hormones, and self-image. Dr. Linda gained 80 pounds during her twin pregnancy. Ketty has walked alongside patients and family members who were told to \"just eat less and move more\" when the real answer was medical."}
            </p>
            <p>
              {isEs
                ? "Por eso construimos Body Good. No para ser otra empresa de pérdida de peso — sino para ser la clínica que deseábamos que existiera cuando NOSOTRAS necesitábamos ayuda."
                : "That's why we built Body Good. Not to be another weight loss company — but to be the practice we wished existed when WE needed help."}
            </p>
            <p>
              {isEs
                ? "Cuando te conviertes en nuestra paciente, no eres un número. Eres alguien a quien vemos, escuchamos y por quien vamos a luchar."
                : "When you become our patient, you're not a number. You're someone we see, we hear, and we're going to fight for."}
            </p>
            <p className="font-medium not-italic text-heading">
              {isEs
                ? "No estás sola en esto. Y ya no tienes que resolverlo por ti misma."
                : "You're not alone in this. And you don't have to figure it out by yourself anymore."}
            </p>
          </blockquote>
          <footer className="mt-5">
            <p className="font-heading font-bold text-brand-red text-sm">
              — Dr. Linda Moleon, MD & Ketty Moleon, ARNP
            </p>
            <p className="text-body-muted text-xs mt-0.5">
              {isEs
                ? "Doblemente certificada en Medicina de la Obesidad & Anestesiología | Enfermera Practicante Certificada"
                : "Double Board-Certified in Obesity Medicine & Anesthesiology | Board-Certified Nurse Practitioner"}
            </p>
          </footer>
        </div>

        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
          >
            {isEs ? "Casi lista — solo un poco más →" : "Almost done — just a few more →"}
          </button>
        </div>
      </div>
    );
  }

  // stats variant — Card 3
  return (
    <div className="max-w-xl mx-auto">
      <p className="text-brand-red font-heading font-semibold text-xs uppercase tracking-widest text-center mb-3">
        {isEs ? "Tarjeta Estadística 3 de 3" : "Statistics Card 3 of 3"}
      </p>
      <h2 className="font-heading text-heading text-2xl font-bold text-center mb-8">
        {isEs
          ? "No estás sola. Y esto no es fuerza de voluntad."
          : "You're not alone. And this isn't willpower."}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-card border border-red-100 bg-red-50/50 p-5">
          <p className="text-brand-red font-heading font-bold text-xs uppercase tracking-widest mb-4">
            {isEs ? "El Problema" : "The Problem"}
          </p>
          <ul className="space-y-3">
            {(isEs ? [
              "Más del 40% de los adultos americanos viven con obesidad — más de 100 millones de personas.",
              "En 2024, todos los estados de EE. UU. tuvieron una prevalencia de obesidad superior al 25%.",
              "Los costos de salud relacionados con la obesidad superan los $173 mil millones al año.",
              "Esto no es un problema de disciplina. Es un problema de biología — y finalmente tiene una solución médica.",
            ] : [
              "More than 40% of American adults are living with obesity — that's over 100 million people.",
              "In 2024, every single U.S. state had an obesity prevalence above 25%.",
              "Obesity-related healthcare costs exceed $173 billion every year.",
              "This isn't a discipline problem. It's a biology problem — and it finally has a medical solution.",
            ]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0 mt-1.5" />
                <span dangerouslySetInnerHTML={{ __html: item.replace(/\$173 billion|\$173 mil millones|40%|25%|100 million|100 millones|2024/g, (m) => `<strong>${m}</strong>`) }} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-green-100 bg-green-50/50 p-5">
          <p className="text-green-700 font-heading font-bold text-xs uppercase tracking-widest mb-4">
            {isEs ? "La Solución" : "The Solution"}
          </p>
          <ul className="space-y-3">
            {(isEs ? [
              "1 de cada 8 adultos americanos está tomando actualmente un medicamento GLP-1.",
              "Más de 30 millones de americanos usaron medicamentos GLP-1 solo en 2025.",
              "Las recetas de GLP-1 representan más del 7% de todas las recetas en EE. UU.",
              "Esto no es experimental. No es una tendencia. Es medicina moderna — y está cambiando vidas cada día.",
            ] : [
              "1 in 8 American adults are currently taking a GLP-1 medication.",
              "Over 30 million Americans used GLP-1 medications for weight loss in 2025 alone.",
              "GLP-1 prescriptions now account for more than 7% of all prescriptions written in the U.S.",
              "This isn't experimental. This isn't a trend. This is modern medicine — and it's changing lives every day.",
            ]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-body">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onContinue}
          className="bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover transition-all duration-base"
        >
          {isEs ? "Ver Mis Resultados →" : "See My Results →"}
        </button>
      </div>
    </div>
  );
}
