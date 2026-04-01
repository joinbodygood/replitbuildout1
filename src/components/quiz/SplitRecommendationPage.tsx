"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Check,
  Truck,
  Building2,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Users,
  CreditCard,
  MessageCircle,
  Info,
  Tag,
  X,
} from "lucide-react";

export interface SplitRecoConfig {
  productName: string;
  productSubtitle: string;
  bestFor: string;
  recommendation?: string;
  shipToMePrice: number;
  shipToMePriceLabel: string;
  goodrxSlug: string | null;
  shipCartData: {
    productId: string;
    variantId: string;
    priceInCents: number;
    variantLabel: string;
    slug: string;
  };
  pharmacyCartData: {
    productId: string;
    variantId: string;
    priceInCents: number;
    variantLabel: string;
    slug: string;
  };
}

interface Props {
  config: SplitRecoConfig;
  locale: string;
}

export function SplitRecommendationPage({ config, locale }: Props) {
  const { addItem, replaceFlow } = useCart();
  const router = useRouter();
  const [pharmacyModalOpen, setPharmacyModalOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyZip, setPharmacyZip] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const goodrxUrl = config.goodrxSlug
    ? `https://www.goodrx.com/${config.goodrxSlug}`
    : null;

  function handleShipToMe() {
    replaceFlow("compounded-glp1", [{
      productId: config.shipCartData.productId,
      variantId: config.shipCartData.variantId,
      name: config.productName,
      variantLabel: config.shipCartData.variantLabel,
      price: config.shipCartData.priceInCents,
      slug: config.shipCartData.slug,
      isMedPlan: true,
    }]);
    router.push(`/${locale}/cart/upsell`);
  }

  function handlePharmacyPickup() {
    setPharmacyModalOpen(true);
  }

  function handlePharmacyConfirm() {
    if (!pharmacyName.trim() || !pharmacyZip.trim()) return;
    localStorage.setItem(
      "bg_pharmacy_selection",
      JSON.stringify({
        name: pharmacyName,
        zip: pharmacyZip,
        phone: pharmacyPhone,
      })
    );
    replaceFlow("compounded-glp1", [{
      productId: config.pharmacyCartData.productId,
      variantId: config.pharmacyCartData.variantId,
      name: `${config.productName} — Pharmacy Pickup`,
      variantLabel: config.pharmacyCartData.variantLabel,
      price: config.pharmacyCartData.priceInCents,
      slug: config.pharmacyCartData.slug,
    }], { silent: true });
    setPharmacyModalOpen(false);
    router.push(`/${locale}/checkout`);
  }

  const faqs = [
    {
      q: 'What\'s the difference between "Ship To Me" and "Pharmacy Pickup"?',
      a: (
        <>
          <strong>Ship To Me:</strong> You pay one price and we handle
          everything — the doctor reviews your info, writes your prescription,
          and the medication is shipped to your door for free. Nothing else to
          pay.
          <br />
          <br />
          <strong>Pharmacy Pickup:</strong> You pay $49 for the doctor to review
          your info and send a prescription to your local pharmacy. Then you
          pick up the meds at the pharmacy and pay for them there. The perk? You
          can use your health insurance to cover the meds, and you can get them
          as soon as the same day.
        </>
      ),
    },
    {
      q: "Can I use my health insurance?",
      a: "Yes — but only with the Pharmacy Pickup option. When you pick up your meds at a local pharmacy, you can hand them your insurance card and they'll run it. If your plan covers the medication, you could pay very little (or even $0) for the meds. The $49 doctor visit fee is always out-of-pocket.",
    },
    {
      q: "How fast will I get my medication?",
      a: (
        <>
          <strong>Ship To Me:</strong> Your medication ships after the doctor
          approves your treatment. Most orders arrive in 3–5 business days with
          free shipping.
          <br />
          <br />
          <strong>Pharmacy Pickup:</strong> Once the doctor sends the
          prescription to your pharmacy, it&apos;s usually ready within a few
          hours — sometimes the same day.
        </>
      ),
    },
    {
      q: "What if I'm not approved for treatment?",
      a: "If our doctor determines that the medication isn't right for you based on your health information, you won't be charged. We only charge after a doctor has reviewed and approved your treatment.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-body">
      {/* ── TOP BAR ── */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[13px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Licensed in 20+ States &bull; Free
        Shipping on All Orders
      </div>

      {/* ── HERO ── */}
      <section className="text-center pt-10 pb-4 px-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#1B8A4A] text-[13px] font-semibold px-4 py-1.5 rounded-full mb-4">
          <Check size={14} strokeWidth={2.5} />
          Quiz Complete
        </div>
        <h1 className="font-heading text-[#0C0D0F] text-3xl font-bold leading-snug mb-3">
          Great News — Here&apos;s Your Personalized Treatment Plan
        </h1>
        <p className="text-[#55575A] text-base leading-relaxed max-w-lg mx-auto">
          Based on your answers, our doctor recommends the options below. Choose
          how you&apos;d like to get your medication.
        </p>
      </section>

      {/* ── PROGRESS STEPS ── */}
      <div className="flex justify-center items-center gap-2 px-6 pt-6 pb-8 flex-wrap">
        <Step label="Quiz" status="done" />
        <StepLine done />
        <Step label="Review" status="done" />
        <StepLine done={false} />
        <Step label="Choose" status="active" number={3} />
        <StepLine done={false} />
        <Step label="Checkout" status="upcoming" number={4} />
      </div>

      {/* ── SECTION QUESTION ── */}
      <div className="text-center px-6 pb-6">
        <h2 className="font-heading text-[#0C0D0F] text-lg font-semibold mb-1">
          How do you want to get your medication?
        </h2>
        <p className="text-[#55575A] text-sm">
          Pick the option that works best for you
        </p>
      </div>

      {/* ── PRODUCT CARDS ── */}
      <div className="max-w-[900px] mx-auto px-6 pb-10">
        <div className="flex flex-col md:flex-row gap-5">
          {/* LEFT: Ship To Me */}
          <div className="flex-1 border-2 border-brand-red rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(237,27,27,0.10)] flex flex-col">
            <div className="bg-brand-red text-white text-center text-[12px] font-bold font-heading uppercase tracking-wider py-1.5">
              Most Popular — Best Value
            </div>
            <div className="px-6 pt-5 pb-0">
              <div className="inline-flex items-center gap-1.5 bg-brand-pink text-brand-red text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
                <Truck size={13} strokeWidth={2} />
                Ship To Me
              </div>
              <h3 className="font-heading text-[#0C0D0F] text-[22px] font-bold mb-1">
                {config.productName}
              </h3>
              <p className="text-[#55575A] text-[14px] mb-1 leading-snug">
                {config.productSubtitle}
              </p>
              <p className="text-[#1B8A4A] text-[13px] font-semibold flex items-center gap-1 mb-4">
                <Info size={13} />
                Best for: {config.bestFor}
              </p>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFA] border-y border-[#E5E5E5]">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-[#0C0D0F] text-[36px] font-bold leading-none">
                  {config.shipToMePriceLabel}
                </span>
                <span className="text-[#55575A] text-[14px]">
                  one-time payment
                </span>
              </div>
              <p className="text-[#55575A] text-[12px] mt-1">
                Medication + doctor review + free shipping — all included
              </p>
            </div>

            <div className="px-6 py-5 flex-1">
              <p className="font-heading text-[#0C0D0F] text-[13px] font-semibold uppercase tracking-wider mb-3">
                Everything Included
              </p>
              <IncludeItem icon="check">
                <strong>Board-certified doctor review</strong> of your health
                info
              </IncludeItem>
              <IncludeItem icon="check">
                <strong>Medication included</strong> — nothing else to pay
              </IncludeItem>
              <IncludeItem icon="check">
                <strong>Free shipping</strong> — arrives in 3–5 business days
              </IncludeItem>
              <IncludeItem icon="check">
                <strong>Discreet packaging</strong> — delivered right to your
                door
              </IncludeItem>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={handleShipToMe}
                className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-hover text-white font-heading font-semibold text-[15px] py-4 rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(237,27,27,0.25)]"
              >
                Add to Cart — {config.shipToMePriceLabel}
                <span className="text-[18px] transition-transform duration-200">
                  &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT: Pharmacy Pickup */}
          <div className="flex-1 border-2 border-[#E5E5E5] hover:border-brand-red rounded-xl overflow-hidden transition-all duration-200 hover:shadow-[0_8px_32px_rgba(237,27,27,0.08)] flex flex-col">
            <div className="bg-[#EBF2FF] text-[#1A6EED] text-center text-[12px] font-bold font-heading uppercase tracking-wider py-1.5">
              Use Your Insurance
            </div>
            <div className="px-6 pt-5 pb-0">
              <div className="inline-flex items-center gap-1.5 bg-[#EBF2FF] text-[#1A6EED] text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
                <Building2 size={13} strokeWidth={2} />
                Pick Up at Pharmacy
              </div>
              <h3 className="font-heading text-[#0C0D0F] text-[22px] font-bold mb-1">
                {config.productName}
              </h3>
              <p className="text-[#55575A] text-[14px] mb-1 leading-snug">
                Prescription sent to your pharmacy
              </p>
              <p className="text-[#1B8A4A] text-[13px] font-semibold flex items-center gap-1 mb-4">
                <Info size={13} />
                Best for: {config.bestFor}
              </p>
            </div>

            <div className="px-6 py-4 bg-[#FAFAFA] border-y border-[#E5E5E5]">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-[#0C0D0F] text-[36px] font-bold leading-none">
                  $49
                </span>
                <span className="text-[#55575A] text-[14px]">
                  doctor review + e-prescription
                </span>
              </div>
              <p className="text-[#55575A] text-[12px] mt-1">
                You pay for meds separately at the pharmacy. Insurance may cover
                it!
              </p>
            </div>

            <div className="px-6 py-5 flex-1">
              <p className="font-heading text-[#0C0D0F] text-[13px] font-semibold uppercase tracking-wider mb-3">
                What You Get
              </p>
              <IncludeItem icon="check">
                <strong>Board-certified doctor review</strong> of your health
                info
              </IncludeItem>
              <IncludeItem icon="check">
                <strong>E-prescription sent</strong> to your local pharmacy
              </IncludeItem>
              <IncludeItem icon="check">
                <strong>Pick up as soon as today</strong> — same-day in most
                cases
              </IncludeItem>
              <IncludeItem icon="info">
                <strong>Use your health insurance</strong> to pay for the
                medication at the pharmacy
              </IncludeItem>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={handlePharmacyPickup}
                className="w-full flex items-center justify-center gap-2 bg-[#0C0D0F] hover:bg-[#2A2B2E] text-white font-heading font-semibold text-[15px] py-4 rounded-full transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(12,13,15,0.2)]"
              >
                Add to Cart — $49
                <span className="text-[18px]">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GOODRX BANNER ── */}
      {goodrxUrl && (
        <div className="max-w-[900px] mx-auto px-6 pb-10">
          <div className="bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 bg-[#FEF3C7] rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag size={28} className="text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading text-[#0C0D0F] font-semibold text-[15px] mb-1">
                Picking up at the pharmacy? Check what you&apos;ll pay for meds.
              </h4>
              <p className="text-[#55575A] text-[13px] leading-relaxed mb-3">
                If you chose the pharmacy pickup option, the $49 covers your
                doctor visit and e-prescription. The medication is a separate
                cost at the pharmacy. Use GoodRx to check the price before you
                go — you might save big.
              </p>
              <a
                href={goodrxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white border-[1.5px] border-[#FDE68A] hover:bg-[#FEF3C7] hover:border-[#F59E0B] text-[#92400E] font-heading font-semibold text-[13px] px-4 py-2 rounded-full transition-all duration-200"
              >
                <ExternalLink size={13} />
                Check Prices on GoodRx &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPARISON TABLE ── */}
      <div className="max-w-[900px] mx-auto px-6 pb-10">
        <h3 className="font-heading text-[#0C0D0F] font-semibold text-lg text-center mb-5">
          Side-by-Side Comparison
        </h3>
        <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="font-heading font-semibold text-[13px] text-[#0C0D0F] text-left px-5 py-3.5 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                </th>
                <th className="font-heading font-semibold text-[13px] text-[#0C0D0F] text-center px-5 py-3.5 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  Ship To Me
                </th>
                <th className="font-heading font-semibold text-[13px] text-[#0C0D0F] text-center px-5 py-3.5 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  Pharmacy Pickup
                </th>
              </tr>
            </thead>
            <tbody>
              <TableRow
                label="Doctor Review"
                a={<TblCheck />}
                b={<TblCheck />}
              />
              <TableRow
                label="Medication Included in Price"
                a={<TblCheck />}
                b={
                  <span className="text-[#55575A] text-[13px]">
                    <span className="text-[#D1D1D1] font-bold mr-1">&#10005;</span>
                    Paid at pharmacy
                  </span>
                }
              />
              <TableRow
                label="Free Shipping"
                a={<TblCheck />}
                b={
                  <span className="text-[#55575A] text-[13px]">
                    — You pick it up
                  </span>
                }
              />
              <TableRow
                label="Can Use Health Insurance"
                a={<TblX />}
                b={
                  <span className="text-[13px]">
                    <span className="text-[#1B8A4A] font-bold mr-1">&#10003;</span>
                    For the meds
                  </span>
                }
              />
              <TableRow
                label="Speed"
                a={<span className="text-[#55575A] text-[13px]">3–5 business days</span>}
                b={<span className="text-[#55575A] text-[13px]">As soon as today</span>}
              />
              <TableRow
                label="You Pay Body Good"
                a={
                  <span className="font-heading font-bold text-[#0C0D0F] text-[13px]">
                    {config.shipToMePriceLabel} total
                  </span>
                }
                b={
                  <span className="font-heading font-bold text-[#0C0D0F] text-[13px]">
                    $49{" "}
                    <span className="font-normal text-[#55575A]">
                      (meds separate)
                    </span>
                  </span>
                }
                isLast
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="bg-[#FAFAFA] border-t border-[#E5E5E5] py-8 px-6">
        <div className="flex flex-wrap justify-center gap-8 max-w-[800px] mx-auto">
          <TrustItem icon={<ShieldCheck size={18} className="text-brand-red" />} label="HIPAA Compliant" />
          <TrustItem icon={<Users size={18} className="text-brand-red" />} label="Board-Certified Doctors" />
          <TrustItem icon={<CreditCard size={18} className="text-brand-red" />} label="FSA / HSA Eligible" />
          <TrustItem icon={<MessageCircle size={18} className="text-brand-red" />} label="Ongoing Support" />
        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="max-w-[680px] mx-auto px-6 py-10">
        <h2 className="font-heading text-[#0C0D0F] text-[22px] font-bold text-center mb-6">
          Common Questions
        </h2>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="border border-[#E5E5E5] rounded-xl mb-3 overflow-hidden"
          >
            <button
              className="w-full flex justify-between items-center px-5 py-4 font-heading font-semibold text-[14px] text-[#0C0D0F] text-left hover:bg-[#FAFAFA] transition-colors duration-200"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {faq.q}
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`flex-shrink-0 ml-3 transition-transform duration-200 ${
                  openFaq === i ? "rotate-180" : ""
                }`}
              />
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 text-[14px] text-[#55575A] leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ── PHARMACY MODAL ── */}
      {pharmacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPharmacyModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <button
              onClick={() => setPharmacyModalOpen(false)}
              className="absolute top-4 right-4 text-[#55575A] hover:text-[#0C0D0F]"
            >
              <X size={20} />
            </button>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 bg-[#EBF2FF] text-[#1A6EED] text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
                <Building2 size={13} />
                Pharmacy Pickup
              </div>
              <h3 className="font-heading text-[#0C0D0F] text-xl font-bold mb-1">
                Where should we send your prescription?
              </h3>
              <p className="text-[#55575A] text-[14px] leading-relaxed">
                Enter your preferred pharmacy so we can route your e-prescription
                there after the doctor approves your treatment.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-heading font-semibold text-[13px] text-[#0C0D0F] mb-1.5">
                  Pharmacy Name <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., CVS, Walgreens, Rite Aid..."
                  value={pharmacyName}
                  onChange={(e) => setPharmacyName(e.target.value)}
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#0C0D0F] placeholder:text-[#B0B0B0] focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
              <div>
                <label className="block font-heading font-semibold text-[13px] text-[#0C0D0F] mb-1.5">
                  Pharmacy ZIP Code <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 90210"
                  value={pharmacyZip}
                  onChange={(e) => setPharmacyZip(e.target.value)}
                  maxLength={10}
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#0C0D0F] placeholder:text-[#B0B0B0] focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
              <div>
                <label className="block font-heading font-semibold text-[13px] text-[#0C0D0F] mb-1.5">
                  Pharmacy Phone{" "}
                  <span className="text-[#B0B0B0] font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g., (555) 123-4567"
                  value={pharmacyPhone}
                  onChange={(e) => setPharmacyPhone(e.target.value)}
                  className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[14px] text-[#0C0D0F] placeholder:text-[#B0B0B0] focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <p className="text-[#55575A] text-[12px] mb-5 leading-relaxed">
              After the doctor reviews and approves your treatment, we&apos;ll
              send the prescription electronically to the pharmacy you entered.
              You&apos;ll be notified when it&apos;s ready to pick up.
            </p>

            <button
              onClick={handlePharmacyConfirm}
              disabled={!pharmacyName.trim() || !pharmacyZip.trim()}
              className="w-full bg-[#0C0D0F] disabled:bg-[#B0B0B0] disabled:cursor-not-allowed text-white font-heading font-semibold text-[15px] py-4 rounded-full transition-all duration-200 hover:bg-[#2A2B2E]"
            >
              Confirm & Proceed to Checkout — $49
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({
  label,
  status,
  number,
}: {
  label: string;
  status: "done" | "active" | "upcoming";
  number?: number;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[12px] font-semibold font-heading ${
        status === "done"
          ? "text-[#1B8A4A]"
          : status === "active"
          ? "text-brand-red"
          : "text-[#B0B0B0]"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold font-heading ${
          status === "done"
            ? "bg-[#1B8A4A] text-white"
            : status === "active"
            ? "bg-brand-red text-white"
            : "bg-[#F0F0F0] text-[#B0B0B0]"
        }`}
      >
        {status === "done" ? (
          <Check size={14} strokeWidth={2.5} />
        ) : (
          number
        )}
      </div>
      {label}
    </div>
  );
}

function StepLine({ done }: { done: boolean }) {
  return (
    <div
      className={`w-10 h-0.5 ${done ? "bg-[#1B8A4A]" : "bg-[#E5E5E5]"}`}
    />
  );
}

function IncludeItem({
  icon,
  children,
}: {
  icon: "check" | "info";
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 mb-2.5 text-[14px] leading-relaxed text-[#55575A]">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
          icon === "check"
            ? "bg-[#E8F5EE] text-[#1B8A4A]"
            : "bg-[#EBF2FF] text-[#1A6EED]"
        }`}
      >
        {icon === "check" ? (
          <Check size={11} strokeWidth={3} />
        ) : (
          <Info size={11} strokeWidth={2.5} />
        )}
      </div>
      <span>{children}</span>
    </div>
  );
}

function TableRow({
  label,
  a,
  b,
  isLast,
}: {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <tr>
      <td
        className={`text-[14px] text-[#55575A] px-5 py-3 ${
          isLast ? "" : "border-b border-[#E5E5E5]"
        }`}
      >
        {label}
      </td>
      <td
        className={`text-center px-5 py-3 ${
          isLast ? "" : "border-b border-[#E5E5E5]"
        }`}
      >
        {a}
      </td>
      <td
        className={`text-center px-5 py-3 ${
          isLast ? "" : "border-b border-[#E5E5E5]"
        }`}
      >
        {b}
      </td>
    </tr>
  );
}

function TblCheck() {
  return (
    <span className="text-[#1B8A4A] font-bold text-[16px]">&#10003;</span>
  );
}

function TblX() {
  return (
    <span className="text-[#D1D1D1] text-[16px]">&#10005;</span>
  );
}

function TrustItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#0C0D0F]">
      <div className="w-9 h-9 rounded-full bg-brand-pink flex items-center justify-center">
        {icon}
      </div>
      {label}
    </div>
  );
}
