import { useLocale } from "next-intl";
import { Clock, ShieldCheck, Stethoscope, DollarSign, MessageCircle, Users } from "lucide-react";

export function ValueProps() {
  const locale = useLocale();
  const isEs = locale === "es";

  const props = isEs
    ? [
        {
          Icon: Clock,
          title: "Conveniencia",
          desc: "Sin sala de espera. Sin viajes a la clínica. Tu atención médica completa desde tu teléfono.",
        },
        {
          Icon: ShieldCheck,
          title: "Privacidad",
          desc: "Empaque discreto. Sin almacenamiento de PHI en nuestra plataforma. Tu salud es tuya.",
        },
        {
          Icon: Stethoscope,
          title: "Médicos reales",
          desc: "No algoritmos — médicos certificados con licencia en EE. UU. que revisan tu caso individualmente.",
        },
        {
          Icon: DollarSign,
          title: "Transparencia",
          desc: "Ves el precio antes de comenzar. Sin tarifas ocultas. Sin sorpresas en la factura.",
        },
        {
          Icon: MessageCircle,
          title: "Apoyo continuo",
          desc: "Tu equipo de atención está disponible por mensajes cuando lo necesites.",
        },
        {
          Icon: Users,
          title: "Alguien que te entiende",
          desc: "Somos una práctica liderada por mujeres. Entendemos los desafíos únicos que enfrentas.",
        },
      ]
    : [
        {
          Icon: Clock,
          title: "Convenience",
          desc: "No waiting room. No clinic visits. Your complete care, from your phone.",
        },
        {
          Icon: ShieldCheck,
          title: "Privacy",
          desc: "Discreet packaging. No PHI stored on our platform. Your health is yours.",
        },
        {
          Icon: Stethoscope,
          title: "Real Doctors",
          desc: "Not algorithms — board-certified, US-licensed physicians who review your case individually.",
        },
        {
          Icon: DollarSign,
          title: "Transparency",
          desc: "You see the price before you start. No hidden fees. No billing surprises.",
        },
        {
          Icon: MessageCircle,
          title: "Ongoing Support",
          desc: "Your care team is available by message whenever you need them.",
        },
        {
          Icon: Users,
          title: "Someone Who Understands",
          desc: "We are a women-led practice. We understand the unique challenges you face.",
        },
      ];

  return (
    <section className="py-20 bg-surface-dim">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-brand-red font-heading font-semibold text-sm uppercase tracking-widest text-center mb-3">
          {isEs ? "¿Por qué Body Good?" : "Why Body Good?"}
        </p>
        <h2 className="font-heading text-heading text-3xl md:text-4xl font-bold text-center mb-14">
          {isEs ? "Construido diferente. A propósito." : "Built differently. On purpose."}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((p) => (
            <div key={p.title} className="bg-surface rounded-card p-6 border border-border">
              <div className="w-11 h-11 bg-brand-pink-soft rounded-xl flex items-center justify-center mb-4">
                <p.Icon size={20} className="text-brand-red" />
              </div>
              <h3 className="font-heading text-heading font-bold text-base mb-2">{p.title}</h3>
              <p className="text-body-muted text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
