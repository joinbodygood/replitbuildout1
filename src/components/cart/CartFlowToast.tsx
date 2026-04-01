"use client";

import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

const DISMISS_MS = 3500;

export function CartFlowToast() {
  const { flowToast, clearFlowToast } = useCart();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!flowToast) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => clearFlowToast(), DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flowToast, clearFlowToast]);

  if (!flowToast) return null;

  return (
    <div
      key={flowToast.key}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 bg-[#0C0D0F] text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg animate-fade-in pointer-events-none select-none"
    >
      <CheckCircle size={16} className="text-[#4ADE80] flex-shrink-0" />
      Your {flowToast.message} selection has been updated
    </div>
  );
}
