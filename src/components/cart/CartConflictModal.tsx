"use client";

import { AlertTriangle, X } from "lucide-react";

interface Props {
  existingProgram: string;
  onKeep: () => void;
  onReplace: () => void;
}

export function CartConflictModal({ existingProgram, onKeep, onReplace }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onKeep}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
        {/* Close */}
        <button
          onClick={onKeep}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Keep current cart"
        >
          <X size={18} />
        </button>

        {/* Icon + Heading */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={22} className="text-amber-500" />
          </div>
          <div>
            <h2 className="font-bold text-[#0C0D0F] text-[17px] leading-snug mb-1">
              You already have a plan in your cart
            </h2>
            <p className="text-[#55575A] text-sm leading-relaxed">
              You currently have a{" "}
              <strong className="text-[#0C0D0F]">{existingProgram}</strong> plan
              in your cart. Complete that checkout first, or replace it with
              this new selection.
            </p>
          </div>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-[13px] text-blue-800 leading-relaxed">
          Once you become a patient, you can add Mental Health, Feminine Health,
          and other programs directly from your{" "}
          <strong>patient portal</strong> — no additional intake required.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onKeep}
            className="flex-1 px-5 py-3 rounded-full border-2 border-[#E5E5E5] text-[#0C0D0F] font-semibold text-sm hover:border-[#0C0D0F] transition-colors"
          >
            Keep current cart
          </button>
          <button
            onClick={onReplace}
            className="flex-1 px-5 py-3 rounded-full bg-[#ed1b1b] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Replace with new selection
          </button>
        </div>
      </div>
    </div>
  );
}
