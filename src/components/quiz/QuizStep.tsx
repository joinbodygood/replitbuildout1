"use client";

import { useState } from "react";

export type QuizOption = {
  label: string;
  sub?: string;
  value: string;
  isDisqualify?: boolean;
  isClear?: boolean;
};

type QuizStepProps = {
  question: string;
  subtitle?: string;
  options: QuizOption[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  clearValue?: string;
};

export function QuizStep({
  question,
  subtitle,
  options,
  onSelect,
  multiSelect = false,
  clearValue = "none",
}: QuizStepProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function handleSingle(value: string) {
    onSelect(value);
  }

  function handleMulti(value: string) {
    if (value === clearValue) {
      setSelected(new Set([clearValue]));
      return;
    }
    const next = new Set(selected);
    next.delete(clearValue);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setSelected(next);
  }

  function handleMultiSubmit() {
    if (selected.size === 0) return;
    const values = Array.from(selected);
    onSelect(values.join(","));
  }

  return (
    <div>
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2 text-center">
        {question}
      </h2>
      {subtitle && (
        <p className="text-body-muted text-center mb-6 text-sm">{subtitle}</p>
      )}

      <div className="flex flex-col gap-3 max-w-lg mx-auto mt-8">
        {options.map((option) => {
          const isSelected = selected.has(option.value);
          const isClearSelected = selected.has(clearValue);

          const baseClass = `w-full text-left px-5 py-4 rounded-card border-2 transition-all duration-150 ${
            option.isClear
              ? `border-dashed ${isSelected ? "border-green-500 bg-green-50" : "border-green-400 bg-green-50/40 hover:border-green-500"}`
              : option.isDisqualify
              ? `${isSelected ? "border-brand-red bg-brand-pink-soft" : "border-border bg-surface hover:border-brand-red/40"}`
              : `${isSelected ? "border-brand-red bg-brand-pink-soft" : "border-border bg-surface hover:border-brand-red hover:shadow-card"}`
          }`;

          if (multiSelect) {
            return (
              <button
                key={option.value}
                onClick={() => handleMulti(option.value)}
                className={baseClass}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    isSelected ? "border-brand-red bg-brand-red" : "border-border"
                  }`}>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`font-medium text-sm leading-snug ${isSelected ? "text-brand-red" : "text-heading"}`}>
                      {option.label}
                    </span>
                    {option.sub && (
                      <p className="text-body-muted text-xs mt-0.5">{option.sub}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          }

          return (
            <button
              key={option.value}
              onClick={() => handleSingle(option.value)}
              className={baseClass}
            >
              <div className="font-semibold text-sm text-heading">{option.label}</div>
              {option.sub && (
                <p className="text-body-muted text-xs mt-1 font-normal">{option.sub}</p>
              )}
            </button>
          );
        })}
      </div>

      {multiSelect && (
        <div className="max-w-lg mx-auto mt-6">
          <button
            onClick={handleMultiSubmit}
            disabled={selected.size === 0}
            className="w-full bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
