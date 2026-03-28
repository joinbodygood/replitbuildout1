import { useLocale } from "next-intl";

const providers = [
  {
    initials: "LM",
    name: "Dr. Linda Moleon",
    title: "Founder & CEO",
    credentials: "Double Board Certified — Anesthesiologist & Obesity Medicine Specialist",
    color: "bg-brand-red",
  },
  {
    initials: "KM",
    name: "Ketty Moleon, ARNP",
    title: "Co-Founder",
    credentials: "Family Medicine",
    color: "bg-rose-400",
  },
  {
    initials: "BR",
    name: "Dr. Bruce Reaves",
    title: "Medical Doctor",
    credentials: "Board Certified Family Medicine",
    color: "bg-pink-500",
  },
  {
    initials: "GC",
    name: "Dr. Gary Clay",
    title: "Medical Doctor",
    credentials: "Board Certified Family Medicine",
    color: "bg-red-400",
  },
  {
    initials: "SB",
    name: "Dr. Srinivasan Boppana",
    title: "Medical Doctor",
    credentials: "Board Certified Family Medicine",
    color: "bg-rose-500",
  },
];

export function Providers() {
  const locale = useLocale();
  const isEs = locale === "es";

  return (
    <section className="py-16 bg-brand-pink-soft">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-4">
          {isEs ? "Conoce a Nuestros Proveedores" : "Meet Our Providers"}
        </h2>
        <p className="text-body-muted text-center mb-12 text-lg">
          {isEs
            ? "Tu salud en las mejores manos. Médicos certificados listos para ayudarte."
            : "Your health in the best hands. Board-certified doctors ready to help you."}
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {providers.map((p) => (
            <div key={p.name} className="text-center w-40">
              <div
                className={`w-20 h-20 rounded-full ${p.color} text-white flex items-center justify-center mx-auto mb-3 font-heading font-bold text-xl shadow-card`}
              >
                {p.initials}
              </div>
              <p className="font-heading text-heading font-bold text-sm">{p.name}</p>
              <p className="text-brand-red text-xs font-medium mt-0.5">{p.title}</p>
              <p className="text-body-muted text-xs mt-1 leading-tight">{p.credentials}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
