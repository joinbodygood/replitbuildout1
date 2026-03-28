import { useLocale } from "next-intl";

export function FounderLetter() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "De la fundadora" : "From the founder"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-14">
          {isEs ? "Una carta de la Dra. Linda" : "A Letter from Dr. Linda"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          {/* Photo placeholder */}
          <div className="md:col-span-2 flex flex-col items-center gap-4">
            <div className="w-52 h-64 bg-brand-pink-soft rounded-card border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center text-white font-heading font-bold text-2xl mx-auto mb-3">
                  LM
                </div>
                <p className="text-body-muted text-xs">Photo coming soon</p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-heading font-bold text-heading text-sm">Dr. Linda Moleon, MD</p>
              <p className="text-body-muted text-xs mt-0.5">Founder & Chief Medical Officer</p>
              <p className="text-body-muted text-xs">Double Board-Certified</p>
              <p className="text-body-muted text-xs">Anesthesiologist & Obesity Medicine Specialist</p>
            </div>
          </div>

          {/* Letter */}
          <div className="md:col-span-3 space-y-5 text-body leading-relaxed">
            {isEs ? (
              <>
                <p>Querida paciente,</p>
                <p>
                  Soy médica porque quería marcar una diferencia. Pero fue solo después de pasar por mis propias batallas de salud — la fatiga, los cambios hormonales, la frustración de que nadie te escuche realmente — que entendí lo que las mujeres realmente necesitan de su proveedor de salud.
                </p>
                <p>
                  A lo largo de los años, he visto a miles de mujeres luchar con su peso, no porque les falte disciplina o fuerza de voluntad, sino porque la medicina convencional no las ha servido bien. Las dietas de moda no están diseñadas para cuerpos de mujeres. La mayoría de los estudios clínicos todavía se realizan principalmente en hombres. Y las presiones de criar familias, hacer carreras y cuidar a todos los demás no dejan mucho espacio para el autocuidado.
                </p>
                <p>
                  Fundé Body Good Studio porque sabía que podíamos hacerlo mejor. Con los medicamentos GLP-1 — ahora una de las herramientas más respaldadas por la ciencia en medicina de la obesidad — finalmente tenemos algo que funciona con tu biología, no en su contra.
                </p>
                <p>
                  Pero la tecnología sola no es suficiente. Lo que importa es sentirte vista. Entendida. Atendida por alguien que se preocupa por tu resultado, no solo por tu caso.
                </p>
                <p>
                  Eso es lo que construimos. Te lo prometo.
                </p>
                <p className="font-heading font-semibold text-heading">— Dra. Linda Moleon, MD</p>
              </>
            ) : (
              <>
                <p>Dear patient,</p>
                <p>
                  I became a doctor because I wanted to make a difference. But it was only after going through my own health struggles — the fatigue, the hormonal shifts, the frustration of not being truly heard — that I understood what women actually need from their healthcare provider.
                </p>
                <p>
                  Over the years, I have watched thousands of women struggle with their weight, not because they lack discipline or willpower, but because conventional medicine has not served them well. Fad diets are not designed for women's bodies. Most clinical studies are still conducted primarily on men. And the pressures of raising families, building careers, and caring for everyone else leave little room for self-care.
                </p>
                <p>
                  I founded Body Good Studio because I knew we could do better. With GLP-1 medications — now one of the most science-backed tools in obesity medicine — we finally have something that works with your biology, not against it.
                </p>
                <p>
                  But technology alone is never enough. What matters is feeling seen. Understood. Cared for by someone who is invested in your outcome, not just your case.
                </p>
                <p>
                  That is what we built here. I promise you that.
                </p>
                <p className="font-heading font-semibold text-heading">— Dr. Linda Moleon, MD</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
