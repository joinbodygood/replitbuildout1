"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount } = useCart();

  const navLinks = [
    { label: t("programs"), href: `/${locale}/programs` },
    { label: t("howItWorks"), href: `/${locale}/how-it-works` },
    { label: t("pricing"), href: `/${locale}/pricing` },
    { label: t("about"), href: `/${locale}/about` },
    { label: t("faq"), href: `/${locale}/faq` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href={`/${locale}`} className="font-heading font-bold text-xl text-heading">
          Body Good<span className="text-brand-red">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-body hover:text-brand-red transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href={`/${locale}/cart`} className="relative text-body hover:text-brand-red transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          <LanguageToggle />
          <Button href={`/${locale}/quiz`} size="sm">
            {t("getStarted")}
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-heading transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-heading transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-heading transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-6 py-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-body hover:text-brand-red"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/cart`}
              className="relative inline-flex items-center gap-2 text-base font-medium text-body hover:text-brand-red"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {t("cart") ?? "Cart"}
              {itemCount > 0 && (
                <span className="bg-brand-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <LanguageToggle />
              <Button href={`/${locale}/quiz`} size="sm">
                {t("getStarted")}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
