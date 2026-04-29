"use client";
import { ReactNode } from "react";

interface Props {
  step: number;
  total: number;
  title: string;
  hint?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export default function QuestionStep({ step, total, title, hint, children, onBack, onNext, nextDisabled, nextLabel = "Continue →" }: Props) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Step {step} of {total}</div>
        <div className="flex-1 h-[2px] bg-neutral-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#ED1B1B] transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </div>
      <h1 className="text-3xl font-normal text-neutral-900 mb-1">{title}</h1>
      {hint && <p className="text-sm text-neutral-600 mb-5">{hint}</p>}
      <div className="mb-5">{children}</div>
      <div className="flex justify-between items-center">
        {onBack ? (
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-900">← Back</button>
        ) : <div />}
        <button onClick={onNext} disabled={nextDisabled}
          className="bg-[#ED1B1B] hover:bg-[#D01818] disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-full transition">
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
