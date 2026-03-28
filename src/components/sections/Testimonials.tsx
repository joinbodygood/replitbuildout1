import { useLocale } from "next-intl";

const reviews = [
  {
    initials: "JM",
    name: "Jenn M.",
    location: "Atlanta, GA",
    loss: "-28 lbs",
    quote:
      "After starting the Body Good program, I lost 28 lbs in 4 months. For the first time, I'm not obsessing over food.",
  },
  {
    initials: "LP",
    name: "Laura P.",
    location: "Miami, FL",
    loss: "-30 lbs",
    quote:
      "Perimenopause hit me hard. Now I'm down 30 lbs, sleeping better, and wearing jeans I hadn't touched in five years.",
  },
  {
    initials: "MS",
    name: "Monique S.",
    location: "Los Angeles, CA",
    loss: "-35 lbs",
    quote:
      "My doctor said I'd never lose weight after menopause. Body Good proved that wrong. 35 lbs gone in 6 months.",
  },
  {
    initials: "RG",
    name: "Rosa G.",
    location: "Houston, TX",
    loss: "-22 lbs",
    quote:
      "I tried everything for 10 years. Finally something that actually works. The bilingual support made all the difference.",
  },
];

export function Testimonials() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-16 bg-surface-dim">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "Resultados reales" : "Real results"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-3">
          {isEs ? "Resultados reales de mujeres reales" : "Real results from real women"}
        </h2>

        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="flex text-yellow-400 text-xl">{"★★★★★"}</div>
          <span className="font-heading font-bold text-heading">4.9/5</span>
          <span className="text-body-muted text-sm">
            {isEs ? "de 2,847 reseñas" : "from 2,847 reviews"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-surface rounded-card p-6 shadow-card flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-red text-white flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {r.initials}
                </div>
                <div>
                  <p className="font-heading text-heading font-semibold text-sm">{r.name}</p>
                  <p className="text-body-muted text-xs">{r.location}</p>
                </div>
              </div>

              <div className="bg-brand-pink-soft rounded-card px-3 py-1.5 inline-flex self-start mb-3">
                <span className="font-heading font-bold text-brand-red text-sm">{r.loss}</span>
              </div>

              <div className="flex text-yellow-400 text-sm mb-3">{"★★★★★"}</div>

              <p className="text-body text-sm leading-relaxed flex-grow">"{r.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
