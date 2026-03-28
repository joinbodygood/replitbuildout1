"use client";

import { useState, useEffect } from "react";

interface Props {
  href: string;
}

export function InsuranceStickyMobileCTA({ href }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur border-t border-border shadow-lg md:hidden">
      <a
        href={href}
        className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-base py-4 rounded-pill transition-colors"
      >
        Check My Coverage — Free →
      </a>
    </div>
  );
}
