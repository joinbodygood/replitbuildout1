"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export interface MedVariant {
  id: string;
  sku: string;
  label: string;
  priceDisplay: string;
  price: number;
  badge?: string;
}

export interface MedicationChoiceCardProps {
  productId: string;
  productName: string;
  tagline: string;
  badge?: string;
  badgeStyle?: "red" | "dark";
  bullets: string[];
  tradeoffs: string[];
  variants: MedVariant[];
  slug: string;
  locale?: string;
}

export function MedicationChoiceCard({
  productId,
  productName,
  tagline,
  badge,
  badgeStyle = "red",
  bullets,
  tradeoffs,
  variants,
  slug,
  locale = "en",
}: MedicationChoiceCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.find((v) => v.badge)?.id ?? variants[0]?.id
  );

  const selected = variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const isEs = locale === "es";

  return (
    <div className="rounded-2xl border-2 border-border bg-white shadow-card flex flex-col overflow-hidden hover:border-brand-red hover:shadow-card-hover transition-all duration-200">
      {badge && (
        <div
          className={`px-5 py-2.5 flex items-center justify-between ${
            badgeStyle === "red" ? "bg-brand-red" : "bg-gray-900"
          }`}
        >
          <span className="text-white font-heading font-bold text-sm uppercase tracking-wide">
            {badge}
          </span>
        </div>
      )}

      <div className="px-6 pt-5 pb-2">
        <h3 className="font-heading text-heading text-xl font-bold mb-1">{productName}</h3>
        <p className="text-body-muted text-sm">{tagline}</p>
      </div>

      <div className="px-6 py-4 flex-grow space-y-4">
        <div className="space-y-1.5">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check size={15} className="text-brand-red flex-shrink-0 mt-0.5" />
              <span className="text-body">{b}</span>
            </div>
          ))}
        </div>

        {tradeoffs.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            {tradeoffs.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <X size={15} className="text-body-muted flex-shrink-0 mt-0.5" />
                <span className="text-body-muted">{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 space-y-3">
        <p className="text-xs font-semibold text-body-muted uppercase tracking-wider">
          {isEs ? "Elige tu plan:" : "Choose your plan:"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`flex-1 min-w-[90px] rounded-card px-3 py-2.5 text-center transition-all border text-sm font-heading font-semibold ${
                selectedVariantId === v.id
                  ? "border-brand-red bg-brand-pink-soft text-brand-red"
                  : "border-border bg-surface text-body-muted hover:border-brand-red hover:text-brand-red"
              }`}
            >
              <div className="font-bold">{v.priceDisplay}</div>
              <div className="text-xs font-normal opacity-80 mt-0.5">{v.label}</div>
              {v.badge && (
                <div className="text-xs font-semibold text-brand-red mt-0.5">
                  {v.badge}
                </div>
              )}
            </button>
          ))}
        </div>

        {selected && (
          <div className="pt-1">
            <AddToCartButton
              productId={productId}
              variantId={selected.id}
              name={productName}
              variantLabel={selected.label}
              price={selected.price}
              slug={slug}
              redirectToUpsell
              label={isEs ? `Agregar al Carrito — ${selected.priceDisplay}` : `Add to Cart — ${selected.priceDisplay}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
