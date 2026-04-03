"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

/* ── Product image paths (saved to public/images/pricing/) ── */
const IMG: Record<string, string> = {
  wegovy_pen: "/images/pricing/wegovy_pen.webp",
  novo_pill:  "/images/pricing/novo_pill.jpeg",
  ozempic:    "/images/pricing/ozempic.jpeg",
  mounjaro:   "/images/pricing/mounjaro.webp",
  zepbound:   "/images/pricing/zepbound.webp",
  bg_tirz:    "/images/pricing/bg_tirz.webp",
};

/* ── Data ── */
const brandCards = [
  {
    id: "wp", name: "Wegovy Pen", gen: "Semaglutide \u2022 Weekly Injection", img: "wegovy_pen",
    doses: "0.25 mg \u2013 2.4 mg",
    cash: "$199 \u2013 $349/mo",
    cashNote: "New patients start at $199/mo for the first 2 months on the lowest doses. After that, all doses are $349/mo through NovoCare. Subscription plans available from $249\u2013$329/mo.",
  },
  {
    id: "wt", name: "Wegovy Pill", gen: "Semaglutide \u2022 Daily Tablet", img: "novo_pill", imgSm: true,
    doses: "1.5 mg \u2013 25 mg",
    cash: "$149 \u2013 $299/mo",
    cashNote: "Starting doses (1.5 mg and 4 mg) are $149/mo \u2014 the cheapest brand-name GLP-1 available. Higher maintenance doses (9 mg, 25 mg) are $299/mo.",
  },
  {
    id: "oz", name: "Ozempic", gen: "Semaglutide \u2022 Weekly Injection", img: "ozempic",
    doses: "0.25 mg \u2013 2 mg",
    cash: "$199 \u2013 $499/mo",
    cashNote: "New patients start at $199/mo for the first 2 months. Standard doses (0.5\u20131 mg) are $349/mo. The highest dose (2 mg) is $499/mo.",
  },
  {
    id: "mj", name: "Mounjaro", gen: "Tirzepatide \u2022 Weekly Injection", img: "mounjaro",
    doses: "2.5 mg \u2013 15 mg",
    cash: "$1,080/mo",
    cashNote: "Mounjaro does not have a manufacturer self-pay discount. If your insurance doesn\u2019t cover it, Zepbound (same exact ingredient) has much better cash pricing starting at $299/mo.",
  },
  {
    id: "zb", name: "Zepbound", gen: "Tirzepatide \u2022 Weekly Injection", img: "zepbound",
    doses: "2.5 mg \u2013 15 mg",
    cash: "$299 \u2013 $449/mo",
    cashNote: "Starting dose (2.5 mg) is $299/mo. Titration dose (5 mg) is $399/mo. Maintenance doses (7.5\u201315 mg) are $449/mo. You must refill within 45 days to keep the lower price.",
  },
];

const compoundInj = [
  {
    id: "cs", name: "Compounded Semaglutide", sub: "Same active ingredient as Wegovy and Ozempic",
    mol: "Semaglutide", del: "Weekly Injection", doses: "All doses available", img: "bg_tirz",
    tiers: [
      { l: "Month to month (no commitment)", p: "$179" },
      { l: "3-month plan", p: "$149/mo", s: "Save $90" },
      { l: "6-month plan", p: "$139/mo", s: "Save $240", best: true },
    ],
    vs: { n: "Wegovy Pen at $349/mo", pct: "60%" },
  },
  {
    id: "cts", name: "Compounded Tirzepatide", sub: "Same active ingredient as Zepbound and Mounjaro",
    mol: "Tirzepatide", del: "Weekly Injection", doses: "2.5 mg \u2013 10 mg", img: "bg_tirz",
    sticker: "STARTER", stickerSub: "Lower doses to ease you in",
    tiers: [
      { l: "Month to month (no commitment)", p: "$315" },
      { l: "3-month plan", p: "$279/mo", s: "Save $108" },
      { l: "6-month plan", p: "$259/mo", s: "Save $360", best: true },
    ],
    vs: { n: "Zepbound starter at $299\u2013$399/mo", pct: "up to 35%" },
  },
  {
    id: "ctm", name: "Compounded Tirzepatide", sub: "Same active ingredient as Zepbound and Mounjaro",
    mol: "Tirzepatide", del: "Weekly Injection", doses: "12.5 mg and up", img: "bg_tirz",
    sticker: "MAINTENANCE", stickerSub: "Higher doses for max results",
    tiers: [
      { l: "Month to month (no commitment)", p: "$349" },
      { l: "3-month plan", p: "$329/mo", s: "Save $60" },
      { l: "6-month plan", p: "$319/mo", s: "Save $180", best: true },
    ],
    vs: { n: "Zepbound maintenance at $449/mo", pct: "29%" },
  },
];

const compoundOral = [
  {
    id: "gac", name: "Appetite + Craving Control", isOral: true,
    sub: "Helps reduce hunger and cravings throughout the day",
    mol: "Oral Semaglutide", del: "Daily Tablet", doses: "Lower doses", img: "novo_pill", imgSm: true,
    tiers: [
      { l: "Month to month (no commitment)", p: "$149" },
      { l: "3-month plan", p: "$119/mo", s: "Save $90" },
      { l: "6-month plan", p: "$109/mo", s: "Save $240", best: true },
    ],
    vs: { n: "Wegovy Pill at $149\u2013$299/mo", pct: "up to 63%" },
  },
  {
    id: "gmr", name: "Metabolic Reset", isOral: true,
    sub: "Higher dose for full metabolic support and weight loss",
    mol: "Oral Semaglutide", del: "Daily Tablet", doses: "Higher doses", img: "novo_pill", imgSm: true,
    tiers: [
      { l: "Month to month (no commitment)", p: "$149" },
      { l: "3-month plan", p: "$129/mo", s: "Save $60" },
      { l: "6-month plan", p: "$119/mo", s: "Save $180", best: true },
    ],
    vs: { n: "Wegovy Pill 25mg at $299/mo", pct: "60%" },
  },
];

/* ── Carousel ── */
function Carousel({ children, label, sub }: { children: React.ReactNode; label: string; sub?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const check = () => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanL(scrollLeft > 10);
    setCanR(scrollLeft < scrollWidth - clientWidth - 10);
  };
  useEffect(() => { check(); }, []);

  const scroll = (dir: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 310, behavior: "smooth" });
    setTimeout(check, 400);
  };

  const Arr = ({ dir, on }: { dir: number; on: boolean }) => (
    <button onClick={() => scroll(dir)} disabled={!on} style={{
      width: 36, height: 36, borderRadius: "50%",
      border: on ? "1.5px solid #0C0D0F" : "1.5px solid #ddd",
      background: on ? "#fff" : "#fafafa",
      color: on ? "#0C0D0F" : "#ccc",
      cursor: on ? "pointer" : "default",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontFamily: "system-ui",
      boxShadow: on ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
    }}>{dir === -1 ? "\u2190" : "\u2192"}</button>
  );

  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, padding: "0 2px" }}>
        <div>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 19, color: "#0C0D0F", margin: 0, lineHeight: 1.2 }}>{label}</h2>
          {sub && <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12, color: "#888", margin: "3px 0 0", lineHeight: 1.4 }}>{sub}</p>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Arr dir={-1} on={canL} />
          <Arr dir={1} on={canR} />
        </div>
      </div>
      <div ref={ref} onScroll={check} style={{
        display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory",
        paddingBottom: 6, WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
      }}>{children}</div>
    </div>
  );
}

/* ── Brand Card ── */
type BrandCardData = typeof brandCards[0] & { imgSm?: boolean };
function BrandCard({ d, locale }: { d: BrandCardData; locale: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      minWidth: 275, maxWidth: 275, scrollSnapAlign: "start",
      background: "#fff", borderRadius: 14, overflow: "hidden",
      border: "2px solid #0C0D0F",
      boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        background: "#f8f8f8", padding: "18px 14px 10px",
        display: "flex", justifyContent: "center", alignItems: "center", minHeight: 120,
        borderBottom: "1px solid #f0f0f0",
      }}>
        <img src={IMG[d.img]} alt={d.name} style={{
          maxHeight: d.imgSm ? 62 : 100, maxWidth: "85%", objectFit: "contain",
          filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.08))",
        }} />
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0C0D0F", margin: 0 }}>{d.name}</h3>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, color: "#999", margin: "2px 0 8px" }}>{d.gen}</p>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11.5, color: "#555", margin: "0 0 10px", lineHeight: 1.3 }}>
          <span style={{ fontWeight: 700, color: "#0C0D0F" }}>Doses: </span>{d.doses}
        </p>
      </div>

      <div style={{ margin: "0 16px", background: "#fde7e7", borderRadius: 10, padding: "10px 14px" }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 700, color: "#ed1b1b", letterSpacing: "0.08em", marginBottom: 3 }}>
          WITH INSURANCE
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#0C0D0F" }}>$75/mo membership</span>
          <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12, color: "#555" }}>+</span>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#ed1b1b" }}>$25 for meds</span>
        </div>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 10.5, color: "#888", margin: "3px 0 0", lineHeight: 1.3 }}>
          We handle your insurance. You just pick up your meds at the pharmacy.
        </p>
      </div>

      <div style={{ padding: "12px 16px 0", flex: 1 }}>
        <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 700, color: "#bbb", letterSpacing: "0.08em", marginBottom: 4 }}>
          WITHOUT INSURANCE (CASH PAY)
        </div>
        <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 24, color: "#0C0D0F" }}>{d.cash}</span>
        <p onClick={() => setOpen(!open)} style={{
          fontFamily: "'Manrope',sans-serif", fontSize: 11, color: "#777",
          margin: "5px 0 0", lineHeight: 1.5, cursor: "pointer",
        }}>
          {open ? d.cashNote : d.cashNote.slice(0, 80) + "..."}
          <span style={{ color: "#ed1b1b", fontWeight: 600, marginLeft: 4 }}>{open ? "less" : "more"}</span>
        </p>
      </div>

      <div style={{ padding: "14px 16px 14px" }}>
        <Link href={`/${locale}/programs`} style={{
          display: "block", width: "100%", padding: "10px 0", borderRadius: 50,
          background: "#0C0D0F", color: "#fff", border: "none",
          fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12,
          cursor: "pointer", textAlign: "center", textDecoration: "none",
        }}>Learn More &rarr;</Link>
      </div>
    </div>
  );
}

/* ── Compound Card ── */
type CompoundCardData = (typeof compoundInj[0] | typeof compoundOral[0]) & {
  isOral?: boolean; sticker?: string; stickerSub?: string; imgSm?: boolean;
};
function CompoundCard({ d, locale }: { d: CompoundCardData; locale: string }) {
  return (
    <div style={{
      minWidth: 280, maxWidth: 280, scrollSnapAlign: "start",
      background: d.isOral
        ? "linear-gradient(155deg, #fff 0%, #fafafa 35%, #f3f3f3 100%)"
        : "linear-gradient(155deg, #fff 0%, #fef5f5 35%, #fde7e7 100%)",
      borderRadius: 14, overflow: "hidden",
      border: d.isOral ? "2px solid #999" : "2px solid #ed1b1b",
      boxShadow: d.isOral ? "0 4px 20px rgba(0,0,0,0.05)" : "0 4px 20px rgba(237,27,27,0.07)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <div style={{
        background: d.isOral ? "#999" : "#ed1b1b", color: "#fff",
        fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 9,
        letterSpacing: "0.14em", padding: "4px 0", textAlign: "center",
      }}>{d.isOral ? "GLOW Rx" : "BODY GOOD STUDIO"}</div>

      {d.sticker && (
        <div style={{
          position: "absolute", top: 32, right: -2,
          background: d.sticker === "STARTER" ? "#0C0D0F" : "#ed1b1b",
          color: "#fff", padding: "6px 14px 6px 12px",
          borderRadius: "6px 0 0 6px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          zIndex: 2,
        }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", lineHeight: 1 }}>{d.sticker}</div>
          <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 8.5, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{d.stickerSub}</div>
        </div>
      )}

      <div style={{ padding: "14px 14px 4px", display: "flex", justifyContent: "center", minHeight: 100 }}>
        <img src={IMG[d.img]} alt={d.name} style={{
          maxHeight: d.imgSm ? 58 : 88, maxWidth: "60%", objectFit: "contain",
          filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.08))",
        }} />
      </div>

      <div style={{ padding: "0 16px" }}>
        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15.5, color: "#0C0D0F", margin: 0, lineHeight: 1.2 }}>{d.name}</h3>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 10.5, color: "#888", margin: "2px 0 6px", lineHeight: 1.3 }}>{d.sub}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 9.5, fontWeight: 600,
            color: d.isOral ? "#666" : "#ed1b1b",
            background: d.isOral ? "#f0f0f0" : "rgba(237,27,27,0.08)",
            padding: "2px 8px", borderRadius: 50,
          }}>{d.doses}</span>
          <span style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 9.5, fontWeight: 500,
            color: "#999", background: "#f5f5f5", padding: "2px 8px", borderRadius: 50,
          }}>{d.del}</span>
        </div>
      </div>

      <div style={{ padding: "0 16px", flex: 1 }}>
        <div style={{
          background: "#fff", borderRadius: 10, padding: 10,
          border: d.isOral ? "1px solid #e5e5e5" : "1px solid rgba(237,27,27,0.1)",
        }}>
          {d.tiers.map((t, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: t.best ? "7px 8px" : "5px 0",
              margin: t.best ? "2px -4px" : 0,
              background: t.best ? (d.isOral ? "rgba(0,0,0,0.03)" : "rgba(237,27,27,0.05)") : "transparent",
              borderRadius: t.best ? 6 : 0,
              borderBottom: i < d.tiers.length - 1 && !t.best
                ? (d.isOral ? "1px solid #eee" : "1px solid #fde7e7")
                : "none",
            }}>
              <div>
                <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, fontWeight: t.best ? 700 : 500, color: "#0C0D0F" }}>{t.l}</span>
                {t.s && <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 700, color: "#16a34a", marginLeft: 6 }}>{t.s}</span>}
              </div>
              <span style={{
                fontFamily: "'Poppins',sans-serif", fontSize: t.best ? 16 : 13,
                fontWeight: 700, color: t.best ? (d.isOral ? "#0C0D0F" : "#ed1b1b") : "#0C0D0F",
              }}>{t.p}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 8, background: "#0C0D0F", borderRadius: 8,
          padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9.5, color: "rgba(255,255,255,0.45)" }}>vs {d.vs.n}</span>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, fontWeight: 700, color: "#ed1b1b" }}>Save {d.vs.pct}</span>
        </div>
      </div>

      <div style={{ padding: "12px 16px 14px" }}>
        <Link href={`/${locale}/quiz`} style={{
          display: "block", width: "100%", padding: "10px 0", borderRadius: 50,
          background: d.isOral ? "#0C0D0F" : "#ed1b1b", color: "#fff", border: "none",
          fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 12,
          cursor: "pointer", textAlign: "center", textDecoration: "none",
        }}>{d.isOral ? "Get Started" : "Start Your Journey"} &rarr;</Link>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function GlpPricingGuide() {
  const locale = useLocale();

  return (
    <div style={{ fontFamily: "'Manrope',sans-serif", background: "#FAFAFA", minHeight: "100vh" }}>
      <style>{`*::-webkit-scrollbar{display:none} *{scrollbar-width:none;}`}</style>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(165deg, #0C0D0F 0%, #1a1a1a 50%, #0C0D0F 100%)",
        padding: "44px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(237,27,27,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.18em", color: "#ed1b1b", marginBottom: 10, position: "relative" }}>
          BODY GOOD STUDIO
        </div>
        <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 30, color: "#fff", margin: "0 0 10px", lineHeight: 1.1, position: "relative" }}>
          GLP-1 Medication<br />Pricing Guide
        </h1>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 auto", maxWidth: 440, lineHeight: 1.6, position: "relative" }}>
          All your options in one place. No confusing fine print.<br />
          Just scroll, compare, and pick what works for you.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 26, position: "relative", flexWrap: "wrap" }}>
          {[
            { v: "$25", n: "meds at pharmacy with insurance", s: "/mo" },
            { v: "$109", n: "compound starting at", s: "/mo" },
            { v: "60%", n: "you could save up to", s: "" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 26, color: "#fff" }}>
                {s.v}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{s.s}</span>
              </div>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{s.n}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 0" }}>

        {/* How it works */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "20px 24px", marginBottom: 36,
          border: "1.5px solid #E5E5E5", boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
        }}>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 17, color: "#0C0D0F", margin: "0 0 6px" }}>
            How does pricing work?
          </h2>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 }}>
            There are <strong style={{ color: "#0C0D0F" }}>three ways</strong> to get GLP-1 medications through Body Good Studio:
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { t: "Insurance", d: "We handle your insurance paperwork. You pay a $75/mo membership + just $25 for your meds at the pharmacy.", c: "#0C0D0F", bg: "#f5f5f5" },
              { t: "Compounded", d: "Same active ingredients as the brand names, at a fraction of the cost. Shipped right to your door.", c: "#ed1b1b", bg: "#fde7e7" },
              { t: "Cash Pay", d: "Pay the manufacturer\u2019s self-pay price directly. No insurance needed. We show you the real numbers below.", c: "#555", bg: "#f9f9f9" },
            ].map((b, i) => (
              <div key={i} style={{ flex: "1 1 200px", background: b.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: b.c, marginBottom: 4 }}>{b.t}</div>
                <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11.5, color: "#666", margin: 0, lineHeight: 1.45 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand-name */}
        <Carousel
          label="Brand-Name Medications"
          sub="FDA-approved medications from Novo Nordisk and Eli Lilly. These are the original brand names you see advertised."
        >
          {brandCards.map(d => <BrandCard key={d.id} d={d} locale={locale} />)}
        </Carousel>

        {/* Compound injectable */}
        <Carousel
          label="Personalized Compounded GLP-1 Meds"
          sub="Same active ingredients as the brands above. Prescribed by our physicians, made by licensed pharmacies, shipped to your door."
        >
          {compoundInj.map(d => <CompoundCard key={d.id} d={d as CompoundCardData} locale={locale} />)}
        </Carousel>

        {/* Oral */}
        <Carousel
          label="Oral Med Program (No Needles)"
          sub="Prefer a daily pill over a weekly injection? These oral compounds give you semaglutide without any needles."
        >
          {compoundOral.map(d => <CompoundCard key={d.id} d={d as CompoundCardData} locale={locale} />)}
        </Carousel>

        {/* Insurance navigation */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 19, color: "#0C0D0F", margin: "0 0 4px" }}>
            Insurance Navigation Program
          </h2>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12.5, color: "#888", margin: "0 0 14px", lineHeight: 1.4 }}>
            Don&apos;t want to deal with your insurance company? We do it for you. Here&apos;s how it works, step by step.
          </p>
          <div style={{
            background: "#fff", borderRadius: 14, overflow: "hidden",
            border: "1.5px solid #E5E5E5", boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}>
            {[
              {
                step: "1", name: "Eligibility Check",
                price: "$25", pn: "one-time",
                desc: "We look at your specific insurance plan, your state, and your carrier to find out if GLP-1 medications are likely to be covered. You\u2019ll know before you spend another dime.",
              },
              {
                step: "2", name: "Prior Authorization",
                price: "$50", pn: "one-time",
                desc: "If your plan requires approval before covering the medication, we handle all the paperwork and submit it to your insurance company on your behalf. This is a one-time fee.",
              },
              {
                step: "3", name: "Ongoing Membership",
                price: "$75", pn: "/month",
                desc: "Once you\u2019re approved, we keep everything running smoothly \u2014 refill orders, prescription processing, prior auth renewals, appeals, and any insurance issues that pop up. You just pick up your meds.",
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "18px 22px",
                borderBottom: i < 2 ? "1px solid #f0f0f0" : "none",
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{
                  background: "#0C0D0F", color: "#fff",
                  fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13,
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>{item.step}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, color: "#0C0D0F" }}>{item.name}</span>
                    <div>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 20, color: "#ed1b1b" }}>{item.price}</span>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, color: "#999", marginLeft: 4 }}>{item.pn}</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12.5, color: "#777", margin: "5px 0 0", lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginBottom: 60, padding: "16px 20px",
          background: "#fff", borderRadius: 12, border: "1px solid #E5E5E5",
        }}>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 10, color: "#aaa", lineHeight: 1.6, margin: 0 }}>
            <strong style={{ color: "#888" }}>Please note:</strong> Brand medication prices come from the manufacturers&apos; self-pay programs as of April 2026 and can change at any time. Manufacturer savings cards do not work if you have Medicare, Medicaid, TRICARE, or VA coverage. Body Good compound pricing includes your medical evaluation and prescription. Compounded medications use the same active ingredients as the brand-name versions but are not FDA-approved finished products. Insurance coverage depends on your specific plan, carrier, and state. All prices shown are per month unless noted. Visit <span style={{ color: "#ed1b1b", fontWeight: 600 }}>joinbodygood.com</span> or talk to our team to figure out which option is right for you.
          </p>
        </div>
      </div>
    </div>
  );
}
