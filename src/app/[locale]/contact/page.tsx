import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Mail, Phone, MessageSquare, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="py-14 bg-white min-h-[70vh]">
      <Container narrow>
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <ShieldCheck size={12} />
            Care Team
          </div>

          <h1
            className="text-[#0C0D0F] text-3xl md:text-4xl font-bold leading-tight mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Speak directly with our care team.
          </h1>
          <p className="text-[#55575A] text-base leading-relaxed mb-10">
            For complex health situations, a direct consultation gives you the
            most personalized, safe care. Our board-certified physicians are here
            to help — no automated protocols.
          </p>

          <div className="space-y-4 mb-10">
            <a
              href="mailto:care@bodygoodstudio.com"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <Mail size={18} className="text-brand-red" />
              </div>
              <div>
                <p
                  className="text-[#0C0D0F] font-semibold text-[14px]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Email the Care Team
                </p>
                <p className="text-[#55575A] text-[13px]">
                  care@bodygoodstudio.com
                </p>
              </div>
            </a>

            <a
              href="sms:+1-800-000-0000"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <MessageSquare size={18} className="text-brand-red" />
              </div>
              <div>
                <p
                  className="text-[#0C0D0F] font-semibold text-[14px]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Text Us
                </p>
                <p className="text-[#55575A] text-[13px]">
                  Available Mon–Fri, 9am–6pm EST
                </p>
              </div>
            </a>

            <a
              href="tel:+1-800-000-0000"
              className="flex items-center gap-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-2xl px-6 py-5 hover:border-brand-red/40 hover:bg-[#FFF5F5] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-red/20 transition-colors">
                <Phone size={18} className="text-brand-red" />
              </div>
              <div>
                <p
                  className="text-[#0C0D0F] font-semibold text-[14px]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Call Us
                </p>
                <p className="text-[#55575A] text-[13px]">
                  Available Mon–Fri, 9am–6pm EST
                </p>
              </div>
            </a>
          </div>

          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-6 py-5 flex items-start gap-3">
            <Clock size={16} className="text-[#1B8A4A] flex-shrink-0 mt-0.5" />
            <div>
              <p
                className="text-[#0C0D0F] font-semibold text-[13px] mb-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Typical response time: within 1 business day
              </p>
              <p className="text-[#55575A] text-[12px] leading-relaxed">
                For urgent medical concerns, please call 911 or go to your nearest
                emergency room. For mental health crises, call or text{" "}
                <strong>988</strong> (Suicide &amp; Crisis Lifeline).
              </p>
            </div>
          </div>

          <p className="text-[#55575A] text-sm text-center mt-8">
            Looking for self-serve care?{" "}
            <Link
              href={`/${locale}/quiz/mental-wellness`}
              className="text-brand-red font-medium hover:underline"
            >
              Take the Mental Health Quiz
            </Link>
          </p>
        </div>
      </Container>
    </section>
  );
}
