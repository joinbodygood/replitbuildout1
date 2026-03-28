"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";

type Variant = {
  id: string;
  sku: string | null;
  doseLevel: string | null;
  supplyDuration: string | null;
  price: number;
  compareAtPrice: number | null;
};

type Props = {
  productId: string;
  productName: string;
  productSlug: string;
  variants: Variant[];
  locale: string;
};

export function ProductVariantSelector({ productId, productName, productSlug, variants, locale }: Props) {
  const isEs = locale === "es";
  const [selectedId, setSelectedId] = useState(
    variants.find((v) => v.supplyDuration === "6-month")?.id ??
    variants.find((v) => v.supplyDuration === "3-month")?.id ??
    variants[0]?.id ?? ""
  );

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  const variantLabel = [
    selected?.supplyDuration?.replace("-", " "),
    selected?.doseLevel,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
        <div>
          <p className="text-sm font-medium text-heading mb-3">
            {isEs ? "Selecciona tu plan:" : "Select your plan:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {variants.map((v) => {
              const isSelected = v.id === selectedId;
              const isBest = v.supplyDuration === "6-month";
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`relative rounded-card p-4 text-left transition-all border-2 ${
                    isSelected
                      ? "border-brand-red bg-brand-pink-soft"
                      : "border-border hover:border-brand-red/40"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 left-3 bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {isEs ? "MEJOR VALOR" : "BEST VALUE"}
                    </span>
                  )}
                  <p className="text-body-muted text-xs capitalize mb-1">
                    {v.supplyDuration?.replace("-", " ")}
                    {v.doseLevel && ` · ${v.doseLevel}`}
                  </p>
                  <p className="font-heading font-bold text-heading text-lg">
                    {formatPrice(v.price)}
                    {v.supplyDuration !== "one-time" && (
                      <span className="text-body-muted text-sm font-normal">/{isEs ? "mes" : "mo"}</span>
                    )}
                  </p>
                  {v.compareAtPrice && (
                    <p className="text-success text-xs mt-0.5">
                      {isEs ? "Ahorra" : "Save"} {formatPrice((v.compareAtPrice - v.price) * (v.supplyDuration === "6-month" ? 6 : v.supplyDuration === "3-month" ? 3 : 1))}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <AddToCartButton
          productId={productId}
          variantId={selected.id}
          name={productName}
          variantLabel={variantLabel}
          price={selected.price}
          slug={productSlug}
        />
      )}

      <p className="text-body-muted text-xs text-center">
        {isEs
          ? "✓ Sin compromiso de suscripción · ✓ Cancelar en cualquier momento"
          : "✓ No subscription lock-in · ✓ Cancel anytime"}
      </p>
    </div>
  );
}
