"use client";

type Option = {
  label: string;
  value: string;
};

type QuizStepProps = {
  question: string;
  subtitle?: string;
  options: Option[];
  onSelect: (value: string) => void;
};

export function QuizStep({ question, subtitle, options, onSelect }: QuizStepProps) {
  return (
    <div className="text-center">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-3">
        {question}
      </h2>
      {subtitle && (
        <p className="text-body-muted text-base mb-8">{subtitle}</p>
      )}
      <div className="flex flex-col gap-3 max-w-md mx-auto mt-8">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full text-left px-6 py-4 rounded-card border border-border bg-surface hover:border-brand-red hover:shadow-card transition-all duration-base font-medium text-heading"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
