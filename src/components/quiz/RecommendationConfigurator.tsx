"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  Check,
  Truck,
  Building2,
  ExternalLink,
  ShieldCheck,
  X,
  ChevronDown,
  Tag,
  Info,
  CheckCircle,
} from "lucide-react";
import type { BGSProduct } from "@/lib/bgs-products";

interface Props {
  product: BGSProduct;
  locale: string;
}

interface PriceDisplay {
  price: number | "—";  // per-month display price
  total?: number;       // total plan cost (price × months)
  sub?: string;
  note?: string;
  extra?: string;
  breakdown?: { mg: string; tier: string; price: number }[];
}

export function RecommendationConfigurator({ product, locale }: Props) {
  const { addItem, replaceMedPlan, items } = useCart();
  const router = useRouter();

  const hasDoses = !!product.doses;
  const isService = product.type === "service";
  const isPharmOnly = product.type === "pharmacy_only";

  const [fulfillment, setFulfillment] = useState<"ship" | "pharmacy" | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [monthDoses, setMonthDoses] = useState<(string | null)[]>([]);
  const [bounce, setBounce] = useState(false);
  const [pharmacyModalOpen, setPharmacyModalOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacyZip, setPharmacyZip] = useState("");
  const [pharmacyPhone, setPharmacyPhone] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select fulfillment based on product type
  useEffect(() => {
    if (product.type === "compounded") {
      setFulfillment("ship");
    } else if (isPharmOnly || isService) {
      setFulfillment("pharmacy");
    } else {
      setFulfillment(null);
    }
    setDuration(null);
    setMonthDoses([]);
  }, [product.sku, product.type, isPharmOnly, isService]);

  // Auto-select duration when applicable
  useEffect(() => {
    if (!fulfillment) return;
    if (fulfillment === "pharmacy" || isService) {
      setDuration(1);
      return;
    }
    if (fulfillment === "ship" && !hasDoses) {
      const keys = Object.keys(product.prices ?? {}).map(Number);
      if (keys.length === 1) setDuration(keys[0]);
      else setDuration(null);
    }
  }, [fulfillment, product.sku, hasDoses, product.prices, isService]);

  // Reset monthDoses when duration changes
  useEffect(() => {
    if (hasDoses && duration) {
      setMonthDoses(Array(duration).fill(null));
    } else {
      setMonthDoses([]);
    }
  }, [duration, hasDoses]);

  // Trigger price bounce animation
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 250);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillment, duration, JSON.stringify(monthDoses)]);

  // ── PRICE CALCULATION ──
  const calcPrice = useCallback((): PriceDisplay => {
    if (isService) {
      const svc = product.servicePrice ?? 0;
      return { price: svc, total: svc, sub: product.serviceLabel };
    }
    if (!fulfillment) return { price: "—", note: "Select a delivery option" };

    if (fulfillment === "pharmacy") {
      const fee = product.pharmacyFee ?? 25;
      return {
        price: fee,
        total: fee,
        sub: product.isAcute ? "One-time consult" : "Doctor review + e-Rx",
        note: product.ongoingFee
          ? `+ $${product.ongoingFee}/mo ongoing management`
          : undefined,
        extra: "+ meds at pharmacy (insurance may cover)",
      };
    }

    // Ship path — no doses
    if (!hasDoses) {
      if (!duration) return { price: "—", note: "Choose shipping frequency" };
      const prices = product.prices ?? {};
      const planTotal = prices[duration] ?? (prices[1] ?? 0) * duration;
      const monthly = duration > 1 ? Math.round(planTotal / duration) : planTotal;
      return {
        price: monthly,
        total: planTotal,
        sub: duration > 1 ? "per month" : undefined,
        note:
          duration > 1
            ? `Total: $${planTotal}`
            : "Meds + doctor review + free shipping",
      };
    }

    // Ship path — has doses
    if (!duration) return { price: "—", note: "Choose shipping frequency" };

    const unfilled = monthDoses.filter((d) => !d).length;
    if (unfilled > 0) {
      return {
        price: "—",
        note: `Select dose for ${unfilled === duration ? "each" : "remaining"} month${unfilled > 1 ? "s" : ""}`,
      };
    }

    const tp = product.tierPricing ?? {};
    let planTotal = 0;
    const breakdown = monthDoses.map((mg) => {
      const dose = product.doses!.find((d) => d.mg === mg)!;
      const tierKey = dose.tier;
      const price = tp[tierKey]?.[duration] ?? tp[tierKey]?.[1] ?? 0;
      planTotal += price;
      return { mg: mg!, tier: tierKey, price };
    });

    const monthly = Math.round(planTotal / duration);
    const allSameTier = new Set(breakdown.map((b) => b.tier)).size === 1;
    const tierLabel = allSameTier
      ? breakdown[0].tier === "starter"
        ? "Starter pricing"
        : breakdown[0].tier === "maintenance"
        ? "Maintenance pricing"
        : ""
      : "Mixed tier pricing";

    return {
      price: duration === 1 ? planTotal : monthly,
      total: planTotal,
      sub: duration > 1 ? "per month" : undefined,
      note: duration > 1 ? `Total: $${planTotal} · ${tierLabel}` : tierLabel,
      breakdown,
    };
  }, [
    isService,
    fulfillment,
    duration,
    hasDoses,
    monthDoses,
    product,
  ]);

  const pd = calcPrice();

  // Duration options
  const durOpts = hasDoses
    ? [1, 3, 6]
    : Object.keys(product.prices ?? {})
        .map(Number)
        .sort((a, b) => a - b);

  const hasDurChoice = fulfillment === "ship" && durOpts.length > 1;
  const dosesComplete =
    !hasDoses ||
    (monthDoses.length > 0 && monthDoses.every(Boolean));
  const canSubmit =
    !!fulfillment &&
    !!duration &&
    (fulfillment === "pharmacy" || dosesComplete);

  // Step numbers
  const stepFreq = 2;
  const stepDose = hasDurChoice ? 3 : 2;

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }

  function handleGetStarted() {
    if (!canSubmit) return;

    // Use plan total — not per-month price
    const planTotal = pd.total ?? (pd.price !== "—" ? (pd.price as number) : 0);
    const totalPriceInCents = Math.round(planTotal * 100);
    const monthlyPriceInCents =
      pd.price !== "—" ? Math.round((pd.price as number) * 100) : 0;
    const months = duration ?? 1;

    // Build variant label with clear breakdown
    const doseStr = monthDoses.filter(Boolean).join(" → ");
    const variantLabel =
      months > 1
        ? doseStr
          ? `${months}-Month Plan · ${doseStr} · $${pd.price as number}/mo × ${months} = $${planTotal}`
          : `${months}-Month Plan · $${pd.price as number}/mo × ${months} = $${planTotal}`
        : doseStr
        ? `1-Month · ${doseStr}`
        : "1-Month Supply";

    // Store rich metadata
    const richData = {
      sku: product.sku,
      fulfillment_type:
        fulfillment === "ship"
          ? "ship_to_me"
          : isService
          ? "service"
          : "pharmacy_pickup",
      product_name: product.name,
      duration_months: months,
      monthly_doses: monthDoses.filter(Boolean).length
        ? monthDoses.map((d) => d ?? "")
        : null,
      monthly_prices: pd.breakdown ? pd.breakdown.map((b) => b.price) : null,
      total_price: planTotal,
      includes_medication: fulfillment === "ship",
      requires_pharmacy_selection: fulfillment === "pharmacy",
      goodrx_drug_slug: product.slug ?? null,
    };
    localStorage.setItem("bg_recommendation_data", JSON.stringify(richData));

    // Pharmacy path — open modal first
    if (fulfillment === "pharmacy") {
      setPharmacyModalOpen(true);
      return;
    }

    // Ship path — replace any existing medication plan (only one allowed at a time)
    const cartItem = {
      productId: product.sku,
      variantId: `${product.sku}-${fulfillment}-${months}mo`,
      name: product.name,
      variantLabel,
      price: totalPriceInCents,
      slug: product.slug ?? product.sku.toLowerCase(),
      isMedPlan: true,
      monthlyPrice: monthlyPriceInCents,
      durationMonths: months,
    };

    const hadExisting = items.some((i) => i.isMedPlan);
    replaceMedPlan(cartItem);
    if (hadExisting) {
      showToast("Your plan has been updated");
      setTimeout(() => router.push(`/${locale}/cart/upsell`), 1200);
    } else {
      router.push(`/${locale}/cart/upsell`);
    }
  }

  function handlePharmacyConfirm() {
    if (!pharmacyName.trim() || !pharmacyZip.trim()) return;
    localStorage.setItem(
      "bg_pharmacy_selection",
      JSON.stringify({ name: pharmacyName, zip: pharmacyZip, phone: pharmacyPhone })
    );
    const priceInCents =
      pd.price !== "—" ? Math.round((pd.price as number) * 100) : 0;
    addItem({
      productId: product.sku,
      variantId: `${product.sku}-pharmacy`,
      name: `${product.name} — Pharmacy Pickup`,
      variantLabel: "Doctor Consultation + E-Prescription",
      price: priceInCents,
      slug: product.slug ?? product.sku.toLowerCase(),
    });
    setPharmacyModalOpen(false);
    router.push(`/${locale}/checkout`);
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#0C0D0F] text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg animate-fade-in">
          <CheckCircle size={16} className="text-[#4ADE80] flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* TOP BAR */}
      <div className="bg-[#0C0D0F] text-white text-center py-2.5 px-4 text-[12px] font-medium tracking-wide">
        Board-Certified Doctors &bull; Licensed in 20 States &bull; Free Shipping
      </div>

      {/* HERO */}
      <div className="text-center pt-7 pb-1 px-5 max-w-[580px] mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#1B8A4A] text-[11px] font-semibold px-3.5 py-1 rounded-full mb-3">
          <Check size={12} strokeWidth={2.5} />
          Based on Your Quiz Results
        </div>
        <h1
          className="text-[#0C0D0F] text-[21px] font-bold leading-snug mb-1"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {product.name}
        </h1>
        <p className="text-[#55575A] text-[13px] mb-1.5">{product.description}</p>
        <div className="inline-flex items-center gap-1.5 text-[#1B8A4A] text-[11px] font-semibold">
          <ShieldCheck size={13} />
          Best for: {product.bestFor}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="max-w-[820px] mx-auto mt-5 px-4 pb-10 flex gap-4 items-start flex-wrap">
        {/* LEFT: CONFIGURATOR */}
        <div className="flex-1 min-w-[300px]">
          <div className="border border-[#E5E5E5] rounded-[14px] overflow-hidden">
            {/* ── STEP 1: FULFILLMENT ── */}
            {!isService && (
              <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2 mb-3">
                  <StepDot num={1} done={!!fulfillment} active={!fulfillment} />
                  <span
                    className="text-[#0C0D0F] font-semibold text-[13px]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    How do you want to get your meds?
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(product.type === "compounded" || product.type === "both") && (
                    <button
                      onClick={() => {
                        setFulfillment("ship");
                        setDuration(null);
                        setMonthDoses([]);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-[13px] transition-all duration-150 ${
                        fulfillment === "ship"
                          ? "border-brand-red bg-brand-pink text-brand-red"
                          : "border-[#E5E5E5] bg-white text-[#0C0D0F]"
                      }`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      <Truck size={14} strokeWidth={2} />
                      Ship to me — meds included
                      {product.type === "both" && (
                        <span className="bg-[#1B8A4A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          BEST VALUE
                        </span>
                      )}
                    </button>
                  )}
                  {(isPharmOnly || product.type === "both") && (
                    <button
                      onClick={() => {
                        setFulfillment("pharmacy");
                        setDuration(1);
                        setMonthDoses([]);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold text-[13px] transition-all duration-150 ${
                        fulfillment === "pharmacy"
                          ? "border-brand-red bg-brand-pink text-brand-red"
                          : "border-[#E5E5E5] bg-white text-[#0C0D0F]"
                      }`}
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      <Building2 size={14} strokeWidth={2} />
                      Pick up at pharmacy — ${product.pharmacyFee ?? 25}
                    </button>
                  )}
                </div>

                {fulfillment === "ship" && (
                  <div className="flex items-center gap-4 mt-3 px-3 py-2 bg-brand-pink rounded-[10px] text-[11px] font-medium flex-wrap">
                    <span className="flex items-center gap-1.5 text-brand-red">
                      <Truck size={12} /> Free shipping
                    </span>
                    <span className="flex items-center gap-1.5 text-brand-red">
                      <Check size={12} strokeWidth={2.5} /> Medication included
                    </span>
                  </div>
                )}
                {fulfillment === "pharmacy" && (
                  <div className="flex items-center gap-4 mt-3 px-3 py-2 bg-[#EBF2FF] rounded-[10px] text-[11px] font-medium flex-wrap">
                    <span className="flex items-center gap-1.5 text-[#1A6EED]">
                      <Building2 size={12} />
                      {product.isAcute ? "Ready in hours" : "Same-day pickup"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#1A6EED]">
                      <ShieldCheck size={12} /> Insurance accepted
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: SHIPPING FREQUENCY ── */}
            {fulfillment === "ship" && hasDurChoice && (
              <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2 mb-3">
                  <StepDot num={stepFreq} done={!!duration} active={!duration && !!fulfillment} />
                  <span
                    className="text-[#0C0D0F] font-semibold text-[13px]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Shipping frequency
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {durOpts.map((d) => {
                    const isMax = d === Math.max(...durOpts);
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setDuration(d);
                          if (hasDoses) setMonthDoses(Array(d).fill(null));
                        }}
                        className={`relative px-4 py-2.5 rounded-full border-2 font-semibold text-[13px] transition-all duration-150 ${
                          duration === d
                            ? "border-brand-red bg-brand-pink text-brand-red"
                            : "border-[#E5E5E5] bg-white text-[#0C0D0F]"
                        }`}
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {d === 1 ? "Every month" : `Every ${d} months`}
                        {isMax && (
                          <span className="absolute -top-2 -right-1 bg-[#1B8A4A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            SAVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 3: DOSE SELECTION ── */}
            {hasDoses && fulfillment === "ship" && duration && (
              <div className="px-5 pt-5 pb-2 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2 mb-2">
                  <StepDot
                    num={stepDose}
                    done={dosesComplete}
                    active={!dosesComplete && !!duration}
                  />
                  <span
                    className="text-[#0C0D0F] font-semibold text-[13px]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {duration === 1
                      ? "What is your dose?"
                      : "Select your dose for each month"}
                  </span>
                </div>

                {/* Tier legend */}
                {product.tierPricing &&
                  Object.keys(product.tierPricing).length > 1 && (
                    <div className="flex gap-4 mb-3 px-2.5 py-1.5 bg-[#FAFAFA] rounded-lg text-[10px] flex-wrap">
                      {Object.entries(product.tierPricing).map(
                        ([tier, prices]) => (
                          <span
                            key={tier}
                            className="font-semibold"
                            style={{
                              fontFamily: "Poppins, sans-serif",
                              color:
                                tier === "maintenance" ? "#1A6EED" : "#1B8A4A",
                            }}
                          >
                            {tier === "starter"
                              ? "Starter"
                              : tier === "maintenance"
                              ? "Maintenance"
                              : "All doses"}
                            : ${(prices as Record<number, number>)[duration!] ?? (prices as Record<number, number>)[1]}/mo
                          </span>
                        )
                      )}
                    </div>
                  )}

                {/* Month dose rows */}
                {monthDoses.map((sel, i) => (
                  <MonthDoseRow
                    key={i}
                    monthNum={i + 1}
                    doses={product.doses!}
                    selected={sel}
                    onChange={(mg) => {
                      const next = [...monthDoses];
                      next[i] = mg;
                      setMonthDoses(next);
                    }}
                    tierPricing={product.tierPricing}
                    duration={duration}
                  />
                ))}
              </div>
            )}

            {/* ── WHAT'S INCLUDED ── */}
            {canSubmit && (
              <div className="px-5 py-4">
                <p
                  className="text-[#55575A] text-[10px] font-semibold uppercase tracking-wide mb-2"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  What&apos;s included
                </p>
                {(fulfillment === "ship"
                  ? [
                      "Board-certified doctor review",
                      "Medication included in price",
                      "Free discreet shipping to your door",
                      hasDoses
                        ? "Doctor reviews and approves your exact dose"
                        : "Supplies included",
                    ]
                  : isService
                  ? ["Board-certified doctor review", product.serviceLabel ?? ""]
                  : [
                      "Board-certified doctor review",
                      "E-prescription sent to your pharmacy",
                      product.isAcute ? "Pick up as soon as today" : "Same-day pickup available",
                    ]
                ).map((txt, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 mb-1.5 text-[12px] text-[#55575A]"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#E8F5EE] text-[#1B8A4A] flex items-center justify-center flex-shrink-0">
                      <Check size={9} strokeWidth={3} />
                    </div>
                    {txt}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── GOODRX BANNER ── */}
          {fulfillment === "pharmacy" && product.slug && (
            <div className="mt-3 bg-[#FFFBEB] border-2 border-[#FDE68A] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#FEF3C7] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag size={18} className="text-[#F59E0B]" />
                </div>
                <div>
                  <p
                    className="text-[#0C0D0F] font-semibold text-[12px] mb-0.5"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Check what you&apos;ll pay at the pharmacy
                  </p>
                  <p className="text-[#55575A] text-[11px] leading-relaxed mb-2">
                    The ${product.pharmacyFee ?? 25} covers your doctor visit.
                    Meds are separate — insurance may cover them.
                  </p>
                  <a
                    href={`https://www.goodrx.com/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white border-[1.5px] border-[#FDE68A] hover:bg-[#FEF3C7] text-[#92400E] font-semibold text-[11px] px-3 py-1.5 rounded-full transition-all duration-150"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    <ExternalLink size={10} />
                    Check Prices on GoodRx &rarr;
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: PRICE + CTA */}
        <div className="flex-none w-[200px] sticky top-5">
          <div
            style={{
              transform: bounce ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.2s",
            }}
          >
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[14px] p-5 text-center">
              {pd.price === "—" ? (
                <span
                  className="text-[44px] font-bold text-[#D1D1D1]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  —
                </span>
              ) : (
                <div className="flex items-baseline justify-center gap-0.5">
                  <span
                    className="text-[16px] font-semibold text-[#0C0D0F]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    $
                  </span>
                  <span
                    className="text-[48px] font-bold text-[#0C0D0F] leading-none"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {pd.price}
                  </span>
                </div>
              )}
              {pd.sub && (
                <p className="text-[14px] text-[#55575A] font-medium mt-0.5">
                  {pd.sub}
                </p>
              )}
              {pd.note && (
                <div className="mt-1.5 text-[11px] text-[#55575A] bg-white border border-[#E5E5E5] rounded-lg px-2 py-1.5">
                  {pd.note}
                </div>
              )}
              {pd.extra && (
                <div className="mt-2 text-[10px] text-[#1A6EED] font-semibold bg-[#EBF2FF] px-2 py-1.5 rounded-lg">
                  {pd.extra}
                </div>
              )}

              {/* Per-month breakdown */}
              {pd.breakdown && pd.breakdown.length > 1 && (
                <div className="mt-2.5 border-t border-[#E5E5E5] pt-2">
                  <p className="text-[10px] font-semibold text-[#55575A] mb-1">
                    Monthly breakdown
                  </p>
                  {pd.breakdown.map((b, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-[11px] text-[#55575A] py-0.5"
                    >
                      <span>
                        Mo {i + 1}: {b.mg}
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            b.tier === "maintenance" ? "#1A6EED" : "#1B8A4A",
                        }}
                      >
                        ${b.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleGetStarted}
            className={`w-full mt-2.5 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-[14px] text-white transition-all duration-200 ${
              canSubmit
                ? "bg-brand-red hover:bg-brand-red-hover"
                : "bg-[#D1D1D1] cursor-not-allowed"
            }`}
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Get Started <span className="text-[16px]">&rarr;</span>
          </button>

          {!canSubmit && (
            <p className="text-center text-[10px] text-[#55575A] mt-1.5">
              {typeof pd.note === "string" ? pd.note : "Complete all selections above"}
            </p>
          )}

          <div className="mt-4">
            {["HIPAA Compliant", "Board-Certified MDs", "Cancel Anytime"].map(
              (t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 mb-1.5 text-[10px] text-[#55575A]"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-brand-pink flex items-center justify-center flex-shrink-0">
                    <Check size={8} strokeWidth={3} className="text-brand-red" />
                  </div>
                  {t}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="max-w-[820px] mx-auto px-5 pb-8 text-[10px] text-[#AAAAAA] leading-relaxed">
        &dagger;All plans subject to healthcare provider approval. Your selected
        dose(s) are reviewed and approved by your medical provider before any
        medication is dispensed. Prices reflect the tier for each dose selected.
      </div>

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
              className="absolute top-4 right-4 text-[#55575A] hover:text-[#0C0D0F] transition-colors"
            >
              <X size={20} />
            </button>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 bg-[#EBF2FF] text-[#1A6EED] text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
                <Building2 size={13} />
                Pharmacy Pickup
              </div>
              <h3
                className="text-[#0C0D0F] text-xl font-bold mb-1"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Where should we send your prescription?
              </h3>
              <p className="text-[#55575A] text-[14px] leading-relaxed">
                Enter your preferred pharmacy so we can route your
                e-prescription there after doctor approval.
              </p>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label
                  className="block text-[13px] font-semibold text-[#0C0D0F] mb-1.5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
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
                <label
                  className="block text-[13px] font-semibold text-[#0C0D0F] mb-1.5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
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
                <label
                  className="block text-[13px] font-semibold text-[#0C0D0F] mb-1.5"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
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
              send the prescription electronically to this pharmacy. You&apos;ll
              be notified when it&apos;s ready.
            </p>

            <button
              onClick={handlePharmacyConfirm}
              disabled={!pharmacyName.trim() || !pharmacyZip.trim()}
              className="w-full bg-[#0C0D0F] disabled:bg-[#D1D1D1] disabled:cursor-not-allowed text-white font-semibold text-[15px] py-4 rounded-full transition-all duration-200 hover:bg-[#2A2B2E]"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Confirm &amp; Proceed to Checkout — ${product.pharmacyFee ?? 25}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── STEP DOT ──
function StepDot({
  num,
  done,
  active,
}: {
  num: number;
  done: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        done
          ? "bg-[#1B8A4A] text-white"
          : active
          ? "bg-brand-red text-white"
          : "bg-[#EEEEEE] text-[#BBBBBB]"
      }`}
      style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 11 }}
    >
      {done ? <Check size={12} strokeWidth={3} /> : num}
    </div>
  );
}

// ── DOSE PILL ──
function DosePill({
  dose,
  active,
  onClick,
  tierPrice,
}: {
  dose: { mg: string; tier: string; label: string; tag?: string };
  active: boolean;
  onClick: () => void;
  tierPrice?: number;
}) {
  const isMaint = dose.tier === "maintenance";
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-[10px] border-2 transition-all duration-150 min-w-[64px] ${
        active
          ? "border-brand-red bg-brand-pink"
          : "border-[#E5E5E5] bg-white"
      }`}
    >
      <span
        className={`text-[14px] font-bold ${
          active ? "text-brand-red" : "text-[#0C0D0F]"
        }`}
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {dose.label}
      </span>
      {dose.tag && (
        <span
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
            isMaint
              ? "bg-[#EBF2FF] text-[#1A6EED]"
              : "bg-[#E8F5EE] text-[#1B8A4A]"
          }`}
        >
          {dose.tag}
        </span>
      )}
      {!dose.tag && dose.tier !== "flat" && (
        <span className="text-[9px] text-[#55575A]">
          {dose.tier === "starter" ? "Starter" : "Maint."}
        </span>
      )}
    </button>
  );
}

// ── MONTH DOSE ROW ──
function MonthDoseRow({
  monthNum,
  doses,
  selected,
  onChange,
  tierPricing,
  duration,
}: {
  monthNum: number;
  doses: { mg: string; tier: string; label: string; tag?: string }[];
  selected: string | null;
  onChange: (mg: string) => void;
  tierPricing?: TierPricing;
  duration: number | null;
}) {
  const selectedDose = doses.find((d) => d.mg === selected);
  const tierPrice =
    selectedDose && tierPricing && duration
      ? tierPricing[selectedDose.tier]?.[duration] ??
        tierPricing[selectedDose.tier]?.[1]
      : null;

  return (
    <div className="py-3 border-b border-[#E5E5E5] last:border-b-0">
      <div className="flex justify-between items-center mb-2">
        <span
          className="text-[#0C0D0F] font-semibold text-[12px]"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Month {monthNum}
        </span>
        {tierPrice && (
          <span
            className="text-[12px] font-bold"
            style={{
              fontFamily: "Poppins, sans-serif",
              color:
                selectedDose?.tier === "maintenance" ? "#1A6EED" : "#1B8A4A",
            }}
          >
            ${tierPrice}
          </span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {doses.map((d) => (
          <DosePill
            key={d.mg}
            dose={d}
            active={selected === d.mg}
            onClick={() => onChange(d.mg)}
            tierPrice={
              tierPricing && duration
                ? tierPricing[d.tier]?.[duration] ??
                  tierPricing[d.tier]?.[1]
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

// Type alias for use in MonthDoseRow
type TierPricing = {
  [tierName: string]: {
    [duration: number]: number;
  };
};

// ── CHEVRON for FAQ (exported for potential reuse) ──
export function FaqChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={16}
      strokeWidth={2.5}
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    />
  );
}

// ── INCLUDE ITEM ──
export function IncludeItem({
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
