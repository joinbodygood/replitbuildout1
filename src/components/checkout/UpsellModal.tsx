"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, Package, CheckCircle } from "lucide-react";

type BundleProduct = {
  id: string;
  slug: string;
  programTag: string | null;
  name: string;
  descriptionShort: string;
  price: number;
  compareAtPrice: number | null;
  variantId: string;
  variantLabel: string | null;
  bundleItems: string[];
};

type Props = {
  locale: string;
  isEs: boolean;
  onClose: () => void;
  onProceed: () => void;
};

const PROGRAM_TAG_MAP: Record<string, string[]> = {
  "weight-loss":    ["WM-", "INS-"],
  "feminine-health":["FH-"],
  "hair-loss":      ["HL-"],
  "mental-health":  ["MW-"],
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function UpsellModal({ locale, isEs, onClose, onProceed }: Props) {
  const { items, addItem } = useCart();
  const [bundles, setBundles] = useState<BundleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchBundles() {
      try {
        const res = await fetch(`/api/bundles?locale=${locale}`);
        const data = await res.json();
        if (data.bundles) {
          const cartVariantIds = new Set(items.map((i) => i.variantId));
          const cartProductIds = items.map((i) => i.productId);

          const detectedProgramTags = new Set<string>();
          for (const [tag, prefixes] of Object.entries(PROGRAM_TAG_MAP)) {
            if (prefixes.some((prefix) => cartProductIds.some((id) => id.startsWith(prefix)))) {
              detectedProgramTags.add(tag);
            }
          }

          const filtered = (data.bundles as BundleProduct[]).filter((bundle) => {
            if (!bundle.programTag || !detectedProgramTags.has(bundle.programTag)) return false;
            if (cartVariantIds.has(bundle.variantId)) return false;
            return true;
          });

          setBundles(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch bundles", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBundles();
  }, [items, locale]);

  useEffect(() => {
    if (!loading && bundles.length === 0) {
      onProceed();
    }
  }, [loading, bundles.length, onProceed]);

  if (loading || bundles.length === 0) return null;

  function handleAddBundle(bundle: BundleProduct) {
    addItem({
      productId: bundle.id,
      variantId: bundle.variantId,
      name: bundle.name,
      variantLabel: bundle.variantLabel ?? "Bundle",
      price: bundle.price,
      slug: bundle.slug,
      productType: "supplement",
      purchaseType: "one-time",
      originalPrice: bundle.price,
    });
    setAddedIds((prev) => new Set(prev).add(bundle.variantId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-card shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-heading text-heading text-xl font-bold">
              {isEs ? "¡Antes de continuar!" : "Before you checkout!"}
            </h2>
            <p className="text-body-muted text-sm mt-1">
              {isEs
                ? "Complementa tu programa con estos paquetes de suplementos seleccionados para ti."
                : "Complement your program with these supplement bundles curated for you."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-body-muted hover:text-heading transition-colors ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bundle cards */}
        <div className="p-6 space-y-4">
          {bundles.map((bundle) => {
            const isAdded = addedIds.has(bundle.variantId);
            const savings = bundle.compareAtPrice ? bundle.compareAtPrice - bundle.price : 0;
            const savingsPct = bundle.compareAtPrice
              ? Math.round(((bundle.compareAtPrice - bundle.price) / bundle.compareAtPrice) * 100)
              : 0;

            return (
              <div
                key={bundle.variantId}
                className="border border-border rounded-card p-4 space-y-3"
              >
                {/* Bundle header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-lime-50 rounded-card flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-lime-600" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="bg-lime-100 text-lime-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {isEs ? "Paquete" : "Bundle"}
                      </span>
                      {savingsPct > 0 && (
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {isEs ? `Ahorra ${savingsPct}%` : `Save ${savingsPct}%`}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-heading font-semibold text-base">
                      {bundle.name}
                    </h3>
                    <p className="text-body-muted text-sm mt-0.5">{bundle.descriptionShort}</p>
                  </div>
                </div>

                {/* Bundle items list */}
                {bundle.bundleItems.length > 0 && (
                  <ul className="space-y-1 pl-1">
                    {bundle.bundleItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-body-muted">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Pricing */}
                <div className="flex items-center gap-2">
                  <span className="font-heading text-heading font-bold text-lg">
                    {fmt(bundle.price)}
                  </span>
                  {bundle.compareAtPrice && (
                    <span className="text-body-muted text-sm line-through">
                      {fmt(bundle.compareAtPrice)}
                    </span>
                  )}
                  {savings > 0 && (
                    <span className="text-green-700 text-xs font-medium">
                      {isEs ? `Ahorras ${fmt(savings)}` : `You save ${fmt(savings)}`}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={isAdded}
                  className={`w-full font-heading font-semibold py-3 rounded-pill transition-all duration-200 ${
                    isAdded
                      ? "bg-green-50 border-2 border-green-500 text-green-700 cursor-default"
                      : "bg-brand-red text-white hover:bg-brand-red-hover"
                  }`}
                >
                  {isAdded
                    ? (isEs ? "✓ Agregado al pedido" : "✓ Added to order")
                    : (isEs ? "Agregar al Pedido" : "Add to Order")}
                </button>
              </div>
            );
          })}

          {/* No thanks / proceed */}
          <div className="pt-2 text-center">
            <button
              onClick={onProceed}
              className="text-body-muted text-sm hover:text-heading transition-colors underline"
            >
              {isEs
                ? "No gracias, continuar al pago"
                : "No thanks, continue to checkout"}
            </button>
          </div>

          {/* If user added bundles, show proceed button */}
          {addedIds.size > 0 && (
            <button
              onClick={onProceed}
              className="w-full bg-brand-red text-white font-heading font-semibold py-3.5 rounded-pill hover:bg-brand-red-hover transition-all duration-200"
            >
              {isEs ? "Continuar al Pago →" : "Continue to Checkout →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
