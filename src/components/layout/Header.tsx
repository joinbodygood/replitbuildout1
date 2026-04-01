"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { useCart } from "@/context/CartContext";
import {
  X, Menu, ChevronDown, ChevronRight,
  Scale, Syringe, Sparkles, Heart, Brain,
  FileText, User, Shield, Pill, Tag, FlaskConical,
  ShoppingCart, DollarSign, HelpCircle, Gift,
} from "lucide-react";

// ─── Desktop dropdown definitions ────────────────────────────────────────────
const WEIGHT_LOSS_ITEMS = [
  {
    id: "wl-insurance",
    label: { en: "Insurance Coverage Check", es: "Verificar Cobertura de Seguro" },
    desc:  { en: "Check your GLP-1 coverage odds — free", es: "Verifica si tu seguro cubre GLP-1" },
    href:  { en: "/en/insurance-check", es: "/es/insurance-check" },
    icon: Shield,
  },
  {
    id: "wl-compounded",
    label: { en: "Compounded GLP-1", es: "GLP-1 Compuesto" },
    desc:  { en: "Semaglutide & tirzepatide — from $139/mo", es: "Semaglutide y tirzepatide desde $139/mes" },
    href:  { en: "/en/quiz", es: "/es/quiz" },
    icon: FlaskConical,
  },
  {
    id: "wl-oral",
    label: { en: "Oral Medication", es: "Medicamento Oral" },
    desc:  { en: "Oral semaglutide — no injections", es: "Semaglutide oral — sin inyecciones" },
    href:  { en: "/en/quiz?path=oral", es: "/es/quiz?path=oral" },
    icon: Pill,
  },
  {
    id: "wl-brand",
    label: { en: "Brand (Cash Pay)", es: "Marca (Pago Directo)" },
    desc:  { en: "Wegovy, Zepbound & Ozempic with Rx", es: "Wegovy, Zepbound y Ozempic con receta" },
    href:  { en: "/en/quiz?path=brand", es: "/es/quiz?path=brand" },
    icon: Tag,
  },
];

const MORE_ITEMS = [
  {
    label: { en: "Wellness Injections", es: "Inyecciones de Bienestar" },
    desc:  { en: "NAD+, Sermorelin, Glutathione & more", es: "NAD+, Sermorelina, Glutatión y más" },
    href:  { en: "/en/wellness-injections", es: "/es/wellness-injections" },
    icon: Syringe,
    iconColor: "#8b5cf6",
  },
  {
    label: { en: "Feminine Health", es: "Salud Femenina" },
    desc:  { en: "Infections, vaginal dryness & wellness", es: "Infecciones, sequedad vaginal y bienestar" },
    href:  { en: "/en/quiz/feminine-health", es: "/es/quiz/feminine-health" },
    icon: Heart,
    iconColor: "#ec4899",
  },
  {
    label: { en: "Hair & Skin", es: "Cabello y Piel" },
    desc:  { en: "Anti-aging & brightening formulas", es: "Fórmulas anti-envejecimiento y piel" },
    href:  { en: "/en/quiz/hair", es: "/es/quiz/hair" },
    icon: Sparkles,
    iconColor: "#10b981",
  },
  {
    label: { en: "Pricing", es: "Precios" },
    desc:  { en: "Transparent, all-inclusive pricing", es: "Precios transparentes y todo incluido" },
    href:  { en: "/en/pricing", es: "/es/pricing" },
    icon: DollarSign,
    iconColor: "#16a34a",
  },
  {
    label: { en: "Blog", es: "Blog" },
    desc:  { en: "GLP-1 guides & patient stories", es: "Guías de GLP-1 e historias de pacientes" },
    href:  { en: "/en/blog", es: "/es/blog" },
    icon: FileText,
    iconColor: "#64748b",
  },
  {
    label: { en: "FAQ", es: "Preguntas frecuentes" },
    desc:  { en: "Common questions answered", es: "Respuestas a preguntas frecuentes" },
    href:  { en: "/en/faq", es: "/es/faq" },
    icon: HelpCircle,
    iconColor: "#0ea5e9",
  },
  {
    label: { en: "Refer & Earn $25", es: "Recomendar y Ganar $25" },
    desc:  { en: "Share BGS with a friend and earn $25 credit", es: "Comparte BGS con una amiga y gana $25 de crédito" },
    href:  { en: "/en/refer", es: "/es/refer" },
    icon: Gift,
    iconColor: "#10b981",
  },
];

// ─── Burger menu items (full list for slide-in panel) ────────────────────────
const NAV_ITEMS = [
  {
    id: "weight-loss",
    label: { en: "Weight Loss", es: "Pérdida de Peso" },
    icon: Scale, iconColor: "#ed1b1b",
    hasChildren: true,
    children: WEIGHT_LOSS_ITEMS,
  },
  {
    id: "wellness",
    label: { en: "Wellness Injections", es: "Inyecciones de Bienestar" },
    icon: Syringe, iconColor: "#8b5cf6", hasChildren: false,
    href: { en: "/en/wellness-injections", es: "/es/wellness-injections" },
    desc: { en: "NAD+, Sermorelin, Glutathione & more — shipped to you", es: "NAD+, Sermorelina, Glutatión y más" },
  },
  {
    id: "hair",
    label: { en: "Hair Loss", es: "Pérdida de Cabello" },
    icon: Sparkles, iconColor: "#f59e0b", hasChildren: false,
    href: { en: "/en/quiz/hair", es: "/es/quiz/hair" },
    desc: { en: "Hair restoration formulas — physician-prescribed", es: "Fórmulas para restauración capilar" },
  },
  {
    id: "feminine",
    label: { en: "Feminine Health", es: "Salud Femenina" },
    icon: Heart, iconColor: "#ec4899", hasChildren: false,
    href: { en: "/en/quiz/feminine-health", es: "/es/quiz/feminine-health" },
    desc: { en: "Infections, vaginal dryness & intimate wellness", es: "Infecciones, sequedad vaginal y bienestar íntimo" },
  },
  {
    id: "skin",
    label: { en: "Hair & Skin", es: "Cabello y Piel" },
    icon: Sparkles, iconColor: "#10b981", hasChildren: false,
    href: { en: "/en/quiz/hair", es: "/es/quiz/hair" },
    desc: { en: "Anti-aging, brightening & skin health formulas", es: "Fórmulas anti-envejecimiento y de cuidado de piel" },
  },
  {
    id: "mental",
    label: { en: "Mental Wellness", es: "Bienestar Mental" },
    icon: Brain, iconColor: "#6366f1", hasChildren: false,
    href: { en: "/en/quiz/mental-wellness", es: "/es/quiz/mental-wellness" },
    desc: { en: "Anxiety, sleep, mood & motivation — non-addictive", es: "Ansiedad, sueño y motivación — sin medicamentos adictivos" },
  },
  {
    id: "refer",
    label: { en: "Refer & Earn $25", es: "Recomendar y Ganar $25" },
    icon: Gift, iconColor: "#10b981", hasChildren: false,
    href: { en: "/en/refer", es: "/es/refer" },
    desc: { en: "Share BGS with a friend and earn $25 BGS credit", es: "Comparte BGS con una amiga y gana $25 de crédito BGS" },
  },
  {
    id: "blog",
    label: { en: "Blog", es: "Blog" },
    icon: FileText, iconColor: "#64748b", hasChildren: false,
    href: { en: "/en/blog", es: "/es/blog" },
    desc: { en: "GLP-1 guides, patient stories & clinical insights", es: "Guías de GLP-1, historias de pacientes e insights clínicos" },
  },
  {
    id: "portal",
    label: { en: "Patient Portal", es: "Portal del Paciente" },
    icon: User, iconColor: "#0ea5e9", hasChildren: false,
    href: { en: "https://bodygoodstudio.zohoone.com", es: "https://bodygoodstudio.zohoone.com" },
    desc: { en: "Access your records, messages & lab results", es: "Accede a tus registros, mensajes y resultados de laboratorio" },
    external: true,
  },
];

// ─── Desktop dropdown panel ───────────────────────────────────────────────────
function DesktopDropdown({
  items, isEs, onClose,
}: {
  items: typeof WEIGHT_LOSS_ITEMS | typeof MORE_ITEMS;
  isEs: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[280px] z-50"
      style={{ animation: "fadeDropDown 0.15s ease-out" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const label = isEs ? item.label.es : item.label.en;
        const desc  = isEs ? item.desc.es  : item.desc.en;
        const href  = isEs ? item.href.es  : item.href.en;
        const color = "iconColor" in item ? item.iconColor : "#ed1b1b";
        const key   = "id" in item ? item.id : href;
        return (
          <Link
            key={key}
            href={href}
            onClick={onClose}
            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#ed1b1b] leading-tight">
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export function Header() {
  const locale = useLocale();
  const isEs = locale === "es";
  const [menuOpen, setMenuOpen]         = useState(false);
  const [weightLossOpen, setWeightLossOpen] = useState(false);
  const [desktopWL, setDesktopWL]       = useState(false);
  const [desktopMore, setDesktopMore]   = useState(false);
  const { itemCount } = useCart();
  const menuRef  = useRef<HTMLDivElement>(null);
  const wlRef    = useRef<HTMLDivElement>(null);
  const moreRef  = useRef<HTMLDivElement>(null);

  // Close burger on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wlRef.current && !wlRef.current.contains(e.target as Node)) setDesktopWL(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setDesktopMore(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when burger open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    setWeightLossOpen(false);
  }

  function closeDesktop() {
    setDesktopWL(false);
    setDesktopMore(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="font-heading font-bold text-xl text-gray-900 shrink-0" onClick={closeMenu}>
            Body Good<span className="text-[#ed1b1b]">.</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1">

            {/* Weight Loss dropdown */}
            <div ref={wlRef} className="relative">
              <button
                type="button"
                onClick={() => { setDesktopWL((o) => !o); setDesktopMore(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  desktopWL ? "text-[#ed1b1b] bg-red-50" : "text-gray-600 hover:text-[#ed1b1b] hover:bg-red-50"
                }`}
              >
                {isEs ? "Pérdida de Peso" : "Weight Loss"}
                <ChevronDown size={14} className={`transition-transform duration-200 ${desktopWL ? "rotate-180" : ""}`} />
              </button>
              {desktopWL && (
                <DesktopDropdown items={WEIGHT_LOSS_ITEMS} isEs={isEs} onClose={closeDesktop} />
              )}
            </div>

            {/* Hair Loss — direct link */}
            <Link
              href={`/${locale}/quiz/hair`}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#ed1b1b] hover:bg-red-50 transition-colors"
              onClick={closeDesktop}
            >
              {isEs ? "Pérdida de Cabello" : "Hair Loss"}
            </Link>

            {/* Mental Health — direct link */}
            <Link
              href={`/${locale}/quiz/mental-wellness`}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#ed1b1b] hover:bg-red-50 transition-colors"
              onClick={closeDesktop}
            >
              {isEs ? "Salud Mental" : "Mental Health"}
            </Link>

            {/* More dropdown */}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => { setDesktopMore((o) => !o); setDesktopWL(false); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  desktopMore ? "text-[#ed1b1b] bg-red-50" : "text-gray-600 hover:text-[#ed1b1b] hover:bg-red-50"
                }`}
              >
                {isEs ? "Más" : "More"}
                <ChevronDown size={14} className={`transition-transform duration-200 ${desktopMore ? "rotate-180" : ""}`} />
              </button>
              {desktopMore && (
                <DesktopDropdown items={MORE_ITEMS} isEs={isEs} onClose={closeDesktop} />
              )}
            </div>
          </nav>

          {/* ── Right-side controls ── */}
          <div className="flex items-center gap-1.5">

            {/* Cart */}
            <Link href={`/${locale}/cart`} className="relative p-2 text-gray-500 hover:text-[#ed1b1b] transition-colors rounded-lg hover:bg-red-50">
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#ed1b1b] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Language toggle */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Login button — desktop */}
            <a
              href="https://bodygoodstudio.zohoone.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-[#ed1b1b] hover:text-[#ed1b1b] transition-colors ml-1"
            >
              <User size={15} />
              {isEs ? "Iniciar sesión" : "Login"}
            </a>

            {/* Burger button */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 rounded-lg text-gray-600 hover:text-[#ed1b1b] hover:bg-red-50 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Burger slide-in panel ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeMenu} />
          <div
            ref={menuRef}
            className="relative w-full max-w-lg ml-auto bg-white h-full overflow-y-auto shadow-2xl"
            style={{ animation: "slideInRight 0.22s ease-out" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="font-heading font-bold text-gray-900 text-base">
                {isEs ? "Menú" : "Menu"}
              </span>
              <button onClick={closeMenu} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const label = isEs ? item.label.es : item.label.en;
                const desc  = "desc" in item ? (isEs ? item.desc?.es : item.desc?.en) : undefined;

                if (item.hasChildren && item.children) {
                  return (
                    <div key={item.id} className="mb-1">
                      <button
                        type="button"
                        onClick={() => setWeightLossOpen((o) => !o)}
                        className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.iconColor}18` }}>
                          <Icon size={18} style={{ color: item.iconColor }} />
                        </div>
                        <p className="flex-1 font-semibold text-gray-900 text-sm">{label}</p>
                        {weightLossOpen
                          ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
                          : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                      </button>
                      {weightLossOpen && (
                        <div className="ml-3 pl-9 border-l-2 border-gray-100 mb-2 mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childLabel = isEs ? child.label.es : child.label.en;
                            const childDesc  = isEs ? child.desc.es  : child.desc.en;
                            const childHref  = isEs ? child.href.es  : child.href.en;
                            return (
                              <Link key={childHref} href={childHref} onClick={closeMenu}
                                className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#fde7e7] group transition-colors"
                              >
                                <ChildIcon size={15} className="text-gray-400 group-hover:text-[#ed1b1b] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#ed1b1b] leading-tight">{childLabel}</p>
                                  <p className="text-xs text-gray-400 mt-0.5 leading-snug">{childDesc}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const href = "href" in item ? (isEs ? item.href?.es : item.href?.en) : `/${locale}`;
                const isExternal = "external" in item && item.external;

                return (
                  <div key={item.id} className="mb-1">
                    {isExternal ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.iconColor}18` }}>
                          <Icon size={18} style={{ color: item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{label}</p>
                          {desc && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>}
                        </div>
                      </a>
                    ) : (
                      <Link href={href ?? "/"} onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.iconColor}18` }}>
                          <Icon size={18} style={{ color: item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{label}</p>
                          {desc && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>}
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Bottom actions */}
            <div className="px-6 pb-8 pt-4 border-t border-gray-100 mt-2 space-y-3">
              <a
                href="https://bodygoodstudio.zohoone.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-gray-700 text-sm border-2 border-gray-200 hover:border-[#ed1b1b] hover:text-[#ed1b1b] transition-colors"
              >
                <User size={16} />
                {isEs ? "Iniciar sesión — Portal del Paciente" : "Login — Patient Portal"}
              </a>
              <a
                href={`/${locale}/quiz`}
                onClick={closeMenu}
                className="w-full block text-center py-3.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ed1b1b" }}
              >
                {isEs ? "Comenzar ahora — gratis" : "Get Started — Free Consultation"}
              </a>
              <div className="flex items-center justify-between pt-1">
                <LanguageToggle />
                <Link href={`/${locale}/insurance-check`} onClick={closeMenu}
                  className="text-xs text-gray-400 hover:text-[#ed1b1b] transition-colors"
                >
                  {isEs ? "Verificar seguro gratis →" : "Check insurance for free →"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeDropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
