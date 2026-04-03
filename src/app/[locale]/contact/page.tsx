import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Mail, Phone, MessageSquare, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEs = locale === "es";

  const copy = {
    badge:    isEs ? "Equipo de Atención" : "Care Team",
    heading:  isEs ? "Habla directamente con nuestro equipo de atención." : "Speak directly with our care team.",
    sub:      isEs
      ? "Para situaciones de salud complejas, una consulta directa le ofrece la atención más personalizada y segura. Nuestros médicos certificados están aquí para ayudar — sin protocolos automatizados."
      : "For complex health situations, a direct consultation gives you the most personalized, safe care. Our board-certified physicians are here to help — no automated protocols.",
    emailLabel: isEs ? "Enviar un correo al Equipo de Atención" : "Email the Care Team",
    textLabel:  isEs ? "Envíanos un mensaje de texto" : "Text Us",
    callLabel:  isEs ? "Llámanos" : "Call Us",
    hours:      isEs ? "Disponible lun–vie, 9am–6pm EST" : "Available Mon–Fri, 9am–6pm EST",
    responseTitle: isEs ? "Tiempo de respuesta típico: dentro de 1 día hábil" : "Typical response time: within 1 business day",
    responseBody: isEs
      ? "Para urgencias médicas, llame al 911 o vaya a la sala de emergencias más cercana. Para crisis de salud mental, llame o envíe un mensaje de texto al 988 (Línea de Crisis y Suicidio)."
      : "For urgent medical concerns, please call 911 or go to your nearest emergency room. For mental health crises, call or text 988 (Suicide & Crisis Lifeline).",
    selfServe: isEs ? "¿Busca atención sin cita?" : "Looking for self-serve care?",
    quizLink:  isEs ? "Tomar el cuestionario de salud mental" : "Take the Mental Health Quiz",
  };

  return (
    <section className="py-14 bg-white min-h-[70vh]">
      <Container narrow>
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <ShieldCheck size={12} />
            {copy.badge}
          </div>

          <h1
            className="text-[#0C0D0F] text-3xl md:text-4xl font-bold leading-tight mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {copy.heading}
          </h1>
          <p className="text-[#55575A] text-base leading-relaxed mb-10">{copy.sub}</p>

          <div className="space-y-4 mb-10">
            <a
              href="mailto:care@bodygoodstudio.com"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <Mail size={18} className="text-brand-red" />
              </div>
              <div>
                <p className="text-[#0C0D0F] font-semibold text-[14px]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {copy.emailLabel}
                </p>
                <p className="text-[#55575A] text-[13px]">care@bodygoodstudio.com</p>
              </div>
            </a>

            <a
              href="sms:+13054229921"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <MessageSquare size={18} className="text-brand-red" />
              </div>
              <div>
                <p className="text-[#0C0D0F] font-semibold text-[14px]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {copy.textLabel}
                </p>
                <p className="text-[#55575A] text-[13px]">{copy.hours}</p>
              </div>
            </a>

            <a
              href="tel:+13054229921"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <Phone size={18} className="text-brand-red" />
              </div>
              <div>
                <p className="text-[#0C0D0F] font-semibold text-[14px]" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {copy.callLabel}
                </p>
                <p className="text-[#55575A] text-[13px]">{copy.hours}</p>
              </div>
            </a>
          </div>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-6 py-5 flex items-start gap-3">
            <Clock size={16} className="text-[#1B8A4A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#0C0D0F] font-semibold text-[13px] mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                {copy.responseTitle}
              </p>
              <p className="text-[#55575A] text-[12px] leading-relaxed">{copy.responseBody}</p>
            </div>
          </div>

          <p className="text-[#55575A] text-sm text-center mt-8">
            {copy.selfServe}{" "}
            <Link href={`/${locale}/quiz/mental-wellness`} className="text-brand-red font-medium hover:underline">
              {copy.quizLink}
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
