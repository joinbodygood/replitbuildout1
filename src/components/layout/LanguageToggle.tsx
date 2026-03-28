"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale() {
    const newLocale = locale === "en" ? "es" : "en";
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.replace(segments.join("/"));
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 text-sm font-medium text-body-muted hover:text-brand-red transition-colors"
      aria-label={`Switch to ${locale === "en" ? "Spanish" : "English"}`}
    >
      <span className="text-base">🌐</span>
      <span>{locale === "en" ? "ES" : "EN"}</span>
    </button>
  );
}
