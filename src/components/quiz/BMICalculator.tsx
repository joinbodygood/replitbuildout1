"use client";

import { useState } from "react";

type BMICalculatorProps = {
  locale: string;
  onComplete: (bmi: number, feet: number, inches: number, weight: number) => void;
};

export function BMICalculator({ locale, onComplete }: BMICalculatorProps) {
  const isEs = locale === "es";
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(6);
  const [weight, setWeight] = useState<number>(180);
  const [showResult, setShowResult] = useState(false);

  const heightInInches = feet * 12 + inches;
  const bmi = (weight / (heightInInches * heightInInches)) * 703;
  const bmiRounded = Math.round(bmi * 10) / 10;

  function getBMICategory(bmi: number): { label: string; color: string } {
    if (bmi < 18.5) return { label: isEs ? "Bajo peso" : "Underweight", color: "text-warning" };
    if (bmi < 25) return { label: isEs ? "Normal" : "Normal", color: "text-success" };
    if (bmi < 30) return { label: isEs ? "Sobrepeso" : "Overweight", color: "text-warning" };
    return { label: isEs ? "Obeso" : "Obese", color: "text-error" };
  }

  const category = getBMICategory(bmiRounded);

  function handleCalculate() {
    setShowResult(true);
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-8">
        {isEs ? "Calculemos tu BMI" : "Let's calculate your BMI"}
      </h2>

      <div className="space-y-6 text-left">
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            {isEs ? "Altura" : "Height"}
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <select
                value={feet}
                onChange={(e) => { setFeet(Number(e.target.value)); setShowResult(false); }}
                className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
              >
                {[4, 5, 6, 7].map((f) => (
                  <option key={f} value={f}>{f} ft</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={inches}
                onChange={(e) => { setInches(Number(e.target.value)); setShowResult(false); }}
                className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{i} in</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            {isEs ? "Peso (lbs)" : "Weight (lbs)"}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => { setWeight(Number(e.target.value)); setShowResult(false); }}
            min={80}
            max={600}
            className="w-full px-4 py-3 rounded-card border border-border bg-surface text-heading focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>
      </div>

      {!showResult ? (
        <button
          onClick={handleCalculate}
          className="mt-8 bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
        >
          {isEs ? "Calcular" : "Calculate"}
        </button>
      ) : (
        <div className="mt-8">
          <div className="bg-surface-dim rounded-card p-6 mb-6">
            <p className="text-body-muted text-sm mb-1">{isEs ? "Tu BMI" : "Your BMI"}</p>
            <p className="font-heading text-4xl font-bold text-heading">{bmiRounded}</p>
            <p className={`font-semibold text-sm ${category.color}`}>{category.label}</p>
          </div>
          <button
            onClick={() => onComplete(bmiRounded, feet, inches, weight)}
            className="bg-brand-red text-white font-heading font-semibold px-10 py-4 rounded-pill shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover transition-all duration-base"
          >
            {isEs ? "Continuar \u2192" : "Continue \u2192"}
          </button>
        </div>
      )}
    </div>
  );
}
