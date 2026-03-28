"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import {
  X, Menu, ChevronDown, ChevronRight,
  Scale, Syringe, Sparkles, Heart, Brain,
  FileText, User, Shield, Pill, Tag, FlaskConical,
  ShoppingCart,
} from "lucide-react";

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "weight-loss",
    label: { en: "Weight Loss", es: "Pérdida de Peso" },
    icon: Scale,
    iconColor: "#ed1b1b",
    hasChildren: true,
    children: [
      {
        label: { en: "Insurance Coverage Check", es: "Verificar Cobertura de Seguro" },
        desc:  { en: "Check your odds for GLP-1 coverage — free", es: "Verifica si tu seguro cubre GLP-1" },
        href:  { en: "/en/insurance-check", es: "/es/insurance-check" },
        icon: Shield,
      },
      {
        label: { en: "Compounded GLP-1", es: "GLP-1 Compuesto" },
        desc:  { en: "Semaglutide & tirzepatide — starting at $139/mo", es: "Semaglutide y tirzepatide desde $139/mes" },
        href:  { en: "/en/quiz", es: "/es/quiz" },
        icon: FlaskConical,
      },
      {
        label: { en: "Oral Medication", es: "Medicamento Oral" },
        desc:  { en: "Oral semaglutide — no injections required", es: "Semaglutide oral — sin inyecciones" },
        href:  { en: "/en/quiz", es: "/es/quiz" },
        icon: Pill,
      },
      {
        label: { en: "Brand (Cash Pay)", es: "Marca (Pago Directo)" },
        desc:  { en: "Wegovy, Zepbound & Ozempic with prescription", es: "Wegovy, Zepbound y Ozempic con receta" },
        href:  { en: "/en/quiz", es: "/es/quiz" },
        icon: Tag,
      },
    ],
  },
  {
    id: "wellness",
    label: { en: "Wellness Injections", es: "Inyecciones de Bienestar" },
    icon: Syringe,
    iconColor: "#8b5cf6",
    hasChildren: false,
    href: { en: "/en/wellness-injections", es: "/es/wellness-injections" },
    desc: { en: "NAD+, Sermorelin, Glutathione & more — shipped to you", es: "NAD+, Sermorelina, Glutatión y más" },
  },
  {
    id: "hair",
    label: { en: "Hair Loss", es: "Pérdida de Cabello" },
    icon: Sparkles,
    iconColor: "#f59e0b",
    hasChildren: false,
    href: { en: "/en/quiz/hair", es: "/es/quiz/hair" },
    desc: { en: "Hair restoration formulas — physician-prescribed", es: "Fórmulas para restauración capilar" },
  },
  {
    id: "feminine",
    label: { en: "Feminine Health", es: "Salud Femenina" },
    icon: Heart,
    iconColor: "#ec4899",
    hasChildren: false,
    href: { en: "/en/quiz/feminine-health", es: "/es/quiz/feminine-health" },
    desc: { en: "Infections, vaginal dryness & intimate wellness", es: "Infecciones, sequedad vaginal y bienestar íntimo" },
  },
  {
    id: "skin",
    label: { en: "Hair & Skin", es: "Cabello y Piel" },
    icon: Sparkles,
    iconColor: "#10b981",
    hasChildren: false,
    href: { en: "/en/quiz/hair", es: "/es/quiz/hair" },
    desc: { en: "Anti-aging, brightening & skin health formulas", es: "Fórmulas anti-envejecimiento y de cuidado de piel" },
  },
  {
    id: "mental",
    label: { en: "Mental Wellness", es: "Bienestar Mental" },
    icon: Brain,
    iconColor: "#6366f1",
    hasChildren: false,
    href: { en: "/en/quiz/mental-wellness", es: "/es/quiz/mental-wellness" },
    desc: { en: "Anxiety, sleep, mood & motivation — non-addictive", es: "Ansiedad, sueño y motivación — sin medicamentos adictivos" },
  },
  {
    id: "blog",
    label: { en: "Blog", es: "Blog" },
    icon: FileText,
    iconColor: "#64748b",
    hasChildren: false,
    href: { en: "/en/blog", es: "/es/blog" },
    desc: { en: "GLP-1 guides, patient stories & clinical insights", es: "Guías de GLP-1, historias de pacientes e insights clínicos" },
  },
  {
    id: "portal",
    label: { en: "Patient Portal", es: "Portal del Paciente" },
    icon: User,
    iconColor: "#0ea5e9",
    hasChildren: false,
    href: { en: "https://bodygoodstudio.zohoone.com", es: "https://bodygoodstudio.zohoone.com" },
    desc: { en: "Access your records, messages & lab results", es: "Accede a tus registros, mensajes y resultados de laboratorio" },
    external: true,
  },
];

export function Header() {
  const locale = useLocale();
  const isEs = locale === "es";
  const [menuOpen, setMenuOpen] = useState(false);
  const [weightLossOpen, setWeightLossOpen] = useState(false);
  const { itemCount } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    setWeightLossOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="font-heading font-bold text-xl text-gray-900 shrink-0" onClick={closeMenu}>
            Body Good<span className="text-[#ed1b1b]">.</span>
          </Link>

          {/* Desktop centre nav — slim links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href={`/${locale}/programs`} className="text-sm font-medium text-gray-600 hover:text-[#ed1b1b] transition-colors">
              {isEs ? "Programas" : "Programs"}
            </Link>
            <Link href={`/${locale}/how-it-works`} className="text-sm font-medium text-gray-600 hover:text-[#ed1b1b] transition-colors">
              {isEs ? "Cómo funciona" : "How It Works"}
            </Link>
            <Link href={`/${locale}/pricing`} className="text-sm font-medium text-gray-600 hover:text-[#ed1b1b] transition-colors">
              {isEs ? "Precios" : "Pricing"}
            </Link>
            <Link href={`/${locale}/faq`} className="text-sm font-medium text-gray-600 hover:text-[#ed1b1b] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link href={`/${locale}/cart`} className="relative p-2 text-gray-500 hover:text-[#ed1b1b] transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#ed1b1b] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Language toggle — desktop */}
            <div className="hidden sm:block">
              <LanguageToggle />
            </div>

            {/* Get Started — desktop */}
            <div className="hidden lg:block ml-1">
              <Button href={`/${locale}/quiz`} size="sm">
                {isEs ? "Comenzar" : "Get Started"}
              </Button>
            </div>

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

      {/* ── Dropdown overlay ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Dark scrim */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeMenu}
          />

          {/* Panel — slides down from top */}
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
                const desc = "desc" in item ? (isEs ? item.desc?.es : item.desc?.en) : undefined;

                // ── Weight Loss section with sub-items ──
                if (item.hasChildren && item.children) {
                  return (
                    <div key={item.id} className="mb-1">
                      <button
                        type="button"
                        onClick={() => setWeightLossOpen((o) => !o)}
                        className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.iconColor}18` }}
                        >
                          <Icon size={18} style={{ color: item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{label}</p>
                        </div>
                        {weightLossOpen
                          ? <ChevronDown size={16} className="text-gray-400 shrink-0" />
                          : <ChevronRight size={16} className="text-gray-400 shrink-0" />
                        }
                      </button>

                      {/* Sub-items */}
                      {weightLossOpen && (
                        <div className="ml-3 pl-9 border-l-2 border-gray-100 mb-2 mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const childLabel = isEs ? child.label.es : child.label.en;
                            const childDesc  = isEs ? child.desc.es  : child.desc.en;
                            const childHref  = isEs ? child.href.es  : child.href.en;
                            return (
                              <Link
                                key={childHref}
                                href={childHref}
                                onClick={closeMenu}
                                className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#fde7e7] group transition-colors"
                              >
                                <ChildIcon size={16} className="text-gray-400 group-hover:text-[#ed1b1b] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#ed1b1b] leading-tight">
                                    {childLabel}
                                  </p>
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

                // ── Regular nav items ──
                const href = "href" in item ? (isEs ? item.href?.es : item.href?.en) : `/${locale}`;
                const isExternal = "external" in item && item.external;

                return (
                  <div key={item.id} className="mb-1">
                    {isExternal ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.iconColor}18` }}
                        >
                          <Icon size={18} style={{ color: item.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{label}</p>
                          {desc && <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>}
                        </div>
                      </a>
                    ) : (
                      <Link
                        href={href ?? "/"}
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${item.iconColor}18` }}
                        >
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
                href={`/${locale}/quiz`}
                onClick={closeMenu}
                className="w-full block text-center py-3.5 rounded-full font-bold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ed1b1b" }}
              >
                {isEs ? "Comenzar ahora" : "Get Started — Free Consultation"}
              </a>
              <div className="flex items-center justify-between">
                <LanguageToggle />
                <Link
                  href={`/${locale}/insurance-check`}
                  onClick={closeMenu}
                  className="text-xs text-gray-400 hover:text-[#ed1b1b] transition-colors"
                >
                  {isEs ? "Verificar seguro gratis" : "Check insurance for free →"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in animation keyframe */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
