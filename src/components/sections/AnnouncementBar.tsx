"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "next-intl";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const locale = useLocale();
  const isEs = locale === "es";

  if (dismissed) return null;

  return (
    <div className="bg-heading text-white text-sm py-2.5 px-4 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center pr-8">
        <span className="text-white/80">
          {isEs
            ? "Aceptando nuevos pacientes —"
            : "Now accepting new patients —"}
        </span>
        <Link
          href={`/${locale}/insurance`}
          className="font-semibold text-white underline underline-offset-2 hover:text-white/80 transition-colors"
        >
          {isEs
            ? "Verifica tu cobertura de seguro gratis"
            : "Check your insurance coverage for free"}
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
