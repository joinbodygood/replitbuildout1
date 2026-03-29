"use client";

import { useRouter } from "next/navigation";
import { Check, Zap, TrendingDown } from "lucide-react";

interface Props {
  locale: string;
}

export function MedicationPickerPage({ locale }: Props) {
  const router = useRouter();

  function pick(sku: string) {
    router.push(`/${locale}/quiz/recommendation?sku=${sku}`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* TOP BAR */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Licensed in 20 States &bull; Free Shipping
      </div>

      {/* HERO */}
      <div className="text-center pt-8 pb-6 px-5 max-w-[640px] mx-auto">
        <div
          className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#1B8A4A] text-[11px] font-semibold px-3.5 py-1 rounded-full mb-3"
        >
          <Check size={12} strokeWidth={2.5} />
          Based on Your Quiz Results
        </div>
        <h1
          className="text-[#0C0D0F] text-[22px] md:text-[26px] font-bold leading-snug mb-2"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Which GLP-1 medication is right for you?
        </h1>
        <p className="text-[#55575A] text-[14px] leading-relaxed">
          Both are compounded injectables — same active ingredient as Mounjaro and Ozempic — at a
          fraction of the cost. Choose the one that fits your goals.
        </p>
      </div>

      {/* CARDS */}
      <div className="max-w-[820px] mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TIRZEPATIDE */}
        <MedCard
          badge="Best Results"
          badgeColor="#1B8A4A"
          name="Tirzepatide"
          subtitle="Same ingredient as Mounjaro & Zepbound"
          icon={<Zap size={20} className="text-[#1B8A4A]" />}
          iconBg="#E8F5EE"
          highlights={[
            "Dual-action GLP-1 + GIP receptor agonist",
            "Up to 22.5% weight loss in clinical trials",
            "Most effective GLP-1 available",
            "9 doses — from 2.5mg starter to 14.75mg max",
          ]}
          priceFrom={259}
          priceSub="/mo (6-month plan)"
          ctaLabel="Choose Tirzepatide →"
          ctaStyle="bg-[#0C0D0F] hover:bg-[#2A2B2E]"
          onClick={() => pick("WM-TIR-INJ")}
        />

        {/* SEMAGLUTIDE */}
        <MedCard
          badge="Most Popular"
          badgeColor="#ED1B1B"
          name="Semaglutide"
          subtitle="Same ingredient as Ozempic & Wegovy"
          icon={<TrendingDown size={20} className="text-[#ED1B1B]" />}
          iconBg="#FDE7E7"
          highlights={[
            "GLP-1 receptor agonist — proven 5+ years",
            "~15% avg. weight loss in clinical trials",
            "Lower starting price — most budget-friendly",
            "5 doses — from 0.25mg starter to 2.4mg max",
          ]}
          priceFrom={139}
          priceSub="/mo (6-month plan)"
          ctaLabel="Choose Semaglutide →"
          ctaStyle="bg-[#ED1B1B] hover:bg-[#D01818]"
          onClick={() => pick("WM-SEM-INJ")}
        />
      </div>

      {/* COMPARE TABLE */}
      <div className="max-w-[640px] mx-auto px-4 pb-10">
        <div className="border border-[#E5E5E5] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
            <p
              className="text-[#0C0D0F] font-semibold text-[13px] text-center"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quick comparison
            </p>
          </div>
          <div className="divide-y divide-[#E5E5E5]">
            {[
              { label: "Active ingredient", tir: "Tirzepatide", sem: "Semaglutide" },
              { label: "Avg. weight loss", tir: "Up to 22.5%", sem: "~15%" },
              { label: "Mechanism", tir: "GLP-1 + GIP dual", sem: "GLP-1 only" },
              { label: "Starting price", tir: "From $259/mo", sem: "From $139/mo" },
              { label: "# of dose options", tir: "9 doses", sem: "5 doses" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-3 text-[12px]">
                <div className="px-4 py-3 text-[#55575A] font-medium">{row.label}</div>
                <div className="px-4 py-3 text-[#0C0D0F] font-semibold text-center border-x border-[#E5E5E5]">
                  {row.tir}
                </div>
                <div className="px-4 py-3 text-[#0C0D0F] font-semibold text-center">{row.sem}</div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#E5E5E5]">
            <div className="grid grid-cols-3 text-[11px] text-center text-[#55575A]">
              <div />
              <div className="font-semibold text-[#1B8A4A]">Tirzepatide</div>
              <div className="font-semibold text-[#ED1B1B]">Semaglutide</div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#AAAAAA] mt-5 leading-relaxed">
          Not sure which to choose? Your provider will review your health history and can adjust
          your medication or dose at any time. There&apos;s no wrong answer.
        </p>
      </div>
    </div>
  );
}

function MedCard({
  badge,
  badgeColor,
  name,
  subtitle,
  icon,
  iconBg,
  highlights,
  priceFrom,
  priceSub,
  ctaLabel,
  ctaStyle,
  onClick,
}: {
  badge: string;
  badgeColor: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  highlights: string[];
  priceFrom: number;
  priceSub: string;
  ctaLabel: string;
  ctaStyle: string;
  onClick: () => void;
}) {
  return (
    <div className="border-2 border-[#E5E5E5] hover:border-[#0C0D0F] rounded-2xl p-5 flex flex-col transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
          style={{ background: badgeColor, fontFamily: "Poppins, sans-serif" }}
        >
          {badge}
        </span>
      </div>

      <h2
        className="text-[#0C0D0F] text-[20px] font-bold mb-0.5"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {name}
      </h2>
      <p className="text-[#55575A] text-[12px] mb-4">{subtitle}</p>

      <ul className="space-y-2 mb-5 flex-1">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-[13px] text-[#55575A]">
            <div className="w-4 h-4 rounded-full bg-[#E8F5EE] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={9} strokeWidth={3} className="text-[#1B8A4A]" />
            </div>
            {h}
          </li>
        ))}
      </ul>

      <div className="mb-4 px-4 py-3 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] text-center">
        <span
          className="text-[24px] font-bold text-[#0C0D0F]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          From ${priceFrom}
        </span>
        <span className="text-[12px] text-[#55575A] ml-1">{priceSub}</span>
      </div>

      <button
        onClick={onClick}
        className={`w-full py-3.5 rounded-full text-white font-semibold text-[14px] transition-all duration-200 ${ctaStyle}`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
