"use client";

import { useState } from "react";

type AccordionItem = {
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, index) => (
        <div key={index}>
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between py-5 text-left font-heading font-semibold text-heading hover:text-brand-red transition-colors"
          >
            <span>{item.question}</span>
            <span className={`ml-4 text-xl transition-transform duration-base ${openIndex === index ? "rotate-45" : ""}`}>
              +
            </span>
          </button>
          {openIndex === index && (
            <div className="pb-5 text-body leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
