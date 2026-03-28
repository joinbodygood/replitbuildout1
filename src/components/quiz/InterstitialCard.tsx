"use client";

type InterstitialCardProps = {
  variant: "stats" | "dr-linda" | "education";
  locale: string;
  onContinue: () => void;
};

export function InterstitialCard({ variant, locale, onContinue }: InterstitialCardProps) {
  const isEs = locale === "es";

  if (variant === "stats") {
    return (
      <div className="text-center max-w-lg mx-auto">
        <div className="bg-brand-pink-soft rounded-card p-8 md:p-12">
          <p className="font-heading text-heading text-3xl md:text-4xl font-bold mb-6">
            {isEs ? "No est\u00e1s sola." : "You're not alone."}
          </p>
          <div className="space-y-4 text-body text-lg">
            <p>
              <span className="font-bold text-heading">74%</span>{" "}
              {isEs
                ? "de los adultos americanos luchan con su peso."
                : "of American adults struggle with their weight."}
            </p>
            <p className="text-body-muted">{isEs ? "Pero aqu\u00ed est\u00e1 la buena noticia:" : "But here's the good news:"}</p>
            <p>
              {isEs
                ? "Pacientes con medicamentos GLP-1 pierden"
                : "Patients on GLP-1 medications lose"}{" "}
              <span className="font-bold text-brand-red">15-20%</span>{" "}
              {isEs ? "de su peso corporal en promedio." : "of their body weight on average."}
            </p>
            <p className="text-body-muted text-base mt-4">
              {isEs
                ? "M\u00e1s de 40 millones de recetas escritas. Esto funciona."
                : "Over 40 million prescriptions written. This works."}
            </p>
          </div>
          <p className="text-body-muted text-xs mt-6">
            {isEs ? "Fuentes: CDC, estudios cl\u00ednicos FDA" : "Sources: CDC, FDA clinical trials"}
          </p>
        </div>
        <button
          onClick={onContinue}
          className="mt-8 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Continuar \u2192" : "Continue \u2192"}
        </button>
      </div>
    );
  }

  if (variant === "dr-linda") {
    return (
      <div className="text-center max-w-lg mx-auto">
        <div className="bg-brand-pink-soft rounded-card p-8 md:p-12">
          <div className="w-20 h-20 bg-brand-pink rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="font-heading text-brand-red text-2xl font-bold">DL</span>
          </div>
          <p className="text-body text-lg leading-relaxed italic mb-6">
            {isEs
              ? '"S\u00e9 lo que es sentir que has intentado todo. Como doctora \u2014 y como alguien que entiende la lucha personalmente \u2014 cre\u00e9 Body Good porque creo que todos merecen acceso a tratamientos que realmente funcionan. Est\u00e1s en buenas manos."'
              : '"I know what it\'s like to feel like you\'ve tried everything. As a doctor \u2014 and as someone who understands the struggle personally \u2014 I built Body Good because I believe everyone deserves access to treatments that actually work. You\'re in good hands."'}
          </p>
          <p className="font-heading text-heading font-bold">
            — Dr. Linda Moleon, MD
          </p>
          <p className="text-body-muted text-sm">
            {isEs ? "Fundadora, Body Good Studio" : "Founder, Body Good Studio"}
          </p>
        </div>
        <button
          onClick={onContinue}
          className="mt-8 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Continuar \u2192" : "Continue \u2192"}
        </button>
      </div>
    );
  }

  // Education: Semaglutide vs Tirzepatide
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h2 className="font-heading text-heading text-2xl font-bold mb-8">
        {isEs ? "Entendiendo Tus Opciones" : "Understanding Your Options"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-card border border-border p-6 text-left">
          <h3 className="font-heading text-heading text-lg font-bold mb-3">
            {isEs ? "SEMAGLUTIDA" : "SEMAGLUTIDE"}
          </h3>
          <p className="text-body-muted text-xs mb-3">
            {isEs ? "(clase Ozempic/Wegovy)" : "(Ozempic/Wegovy class)"}
          </p>
          <ul className="space-y-2 text-sm text-body">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Act\u00faa sobre receptores GLP-1" : "Targets GLP-1 receptors"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "~15% p\u00e9rdida de peso promedio" : "~15% average weight loss"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Disponible en pastilla o inyecci\u00f3n" : "Available as pill or injection"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Opciones compuestas m\u00e1s asequibles" : "More affordable compounded options"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Mayor historial cl\u00ednico" : "Longest track record"}
            </li>
          </ul>
        </div>
        <div className="rounded-card border border-border p-6 text-left">
          <h3 className="font-heading text-heading text-lg font-bold mb-3">
            {isEs ? "TIRZEPATIDA" : "TIRZEPATIDE"}
          </h3>
          <p className="text-body-muted text-xs mb-3">
            {isEs ? "(clase Mounjaro/Zepbound)" : "(Mounjaro/Zepbound class)"}
          </p>
          <ul className="space-y-2 text-sm text-body">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Act\u00faa sobre receptores GLP-1 Y GIP" : "Targets GLP-1 AND GIP receptors"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "~20-25% p\u00e9rdida de peso promedio" : "~20-25% average weight loss"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Solo inyecci\u00f3n" : "Injection only"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "M\u00e1s potente para BMI alto" : "More potent for higher BMI"}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">{"\u2713"}</span>
              {isEs ? "Resultados cl\u00ednicos m\u00e1s fuertes" : "Strongest clinical results"}
            </li>
          </ul>
        </div>
      </div>
      <p className="text-body-muted text-sm mt-6">
        {isEs
          ? "Ambos son seguros, efectivos, y recetados por nuestro equipo m\u00e9dico basado en TU perfil."
          : "Both are safe, effective, and prescribed by our medical team based on YOUR profile."}
      </p>
      <button
        onClick={onContinue}
        className="mt-8 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
      >
        {isEs ? "Continuar \u2192" : "Continue \u2192"}
      </button>
    </div>
  );
}
