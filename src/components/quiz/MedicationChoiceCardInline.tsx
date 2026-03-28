"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import type { MedVariant } from "@/components/quiz/MedicationChoiceCard";

interface Props {
  productId: string;
  productName: string;
  variants: MedVariant[];
  slug: string;
  locale?: string;
}

export function MedicationChoiceCardInline({ productId, productName, variants, slug, locale = "en" }: Props) {
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.badge)?.id ?? variants[0]?.id
  );
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];
  const isEs = locale === "es";

  if (!selected) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedId(v.id)}
            className={`flex-1 min-w-[90px] rounded-card px-3 py-2.5 text-center transition-all border text-sm font-heading font-semibold ${
              selectedId === v.id
                ? "border-brand-red bg-brand-pink-soft text-brand-red"
                : "border-border bg-surface text-body-muted hover:border-brand-red hover:text-brand-red"
            }`}
          >
            <div className="font-bold">{v.priceDisplay}</div>
            <div className="text-xs font-normal opacity-80 mt-0.5">{v.label}</div>
            {v.badge && <div className="text-xs font-semibold text-brand-red mt-0.5">{v.badge}</div>}
          </button>
        ))}
      </div>
      <AddToCartButton
        productId={productId}
        variantId={selected.id}
        name={productName}
        variantLabel={selected.label}
        price={selected.price}
        slug={slug}
        redirectToUpsell
        label={
          isEs
            ? `Agregar al Carrito — ${selected.priceDisplay}`
            : `Add to Cart — ${selected.priceDisplay}`
        }
      />
    </div>
  );
}
