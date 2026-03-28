"use client";

import { Check, Truck, Building2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface PathOption {
  price: string;
  priceNote?: string;
  badge?: string;
  benefits: string[];
  cta: string;
  href: string;
  pharmacyNote?: string;
}

interface DualPathCardProps {
  productName: string;
  productSubtitle?: string;
  recommendation: string;
  pathA?: PathOption | null;
  pathB?: PathOption | null;
  crossSell?: {
    title: string;
    desc: string;
    price: string;
    href: string;
  };
  locale?: string;
}

export function DualPathCard({
  productName,
  productSubtitle,
  recommendation,
  pathA,
  pathB,
  crossSell,
}: DualPathCardProps) {
  const bothAvailable = pathA && pathB;
  const onlyA = pathA && !pathB;
  const onlyB = !pathA && pathB;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <p className="text-body-muted text-sm uppercase tracking-wider font-semibold mb-2">
          Based on your answers, we recommend:
        </p>
        <h2 className="font-heading text-heading text-2xl md:text-3xl font-bold mb-2">
          {productName}
        </h2>
        {productSubtitle && (
          <p className="text-body-muted text-sm mb-4">{productSubtitle}</p>
        )}
        <p className="text-body text-base max-w-xl mx-auto">{recommendation}</p>
      </div>

      {bothAvailable && (
        <p className="text-center font-heading text-heading font-semibold mb-4 text-lg">
          Choose how you&apos;d like to get started:
        </p>
      )}

      <div
        className={`grid gap-4 ${
          bothAvailable ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md mx-auto"
        }`}
      >
        {pathA && (
          <div className="rounded-2xl border-2 border-brand-red bg-white shadow-card-hover flex flex-col">
            <div className="bg-brand-red text-white rounded-t-xl px-6 py-4 flex items-center gap-3">
              <Truck size={20} />
              <div>
                <p className="font-heading font-bold text-sm uppercase tracking-wide">
                  {pathA.badge ?? "Ship to My Door"}
                </p>
                <p className="text-xs opacity-80">
                  Compounded formula, free shipping
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col flex-grow">
              <div className="mb-4">
                <p className="font-heading text-heading text-3xl font-bold">
                  {pathA.price}
                </p>
                {pathA.priceNote && (
                  <p className="text-body-muted text-sm">{pathA.priceNote}</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                {pathA.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-body">
                    <Check
                      size={16}
                      className="text-brand-red flex-shrink-0 mt-0.5"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <Button href={pathA.href} size="lg" variant="primary" className="w-full">
                {pathA.cta}
              </Button>
            </div>
          </div>
        )}

        {pathB && (
          <div className="rounded-2xl border-2 border-gray-200 bg-brand-pink-soft flex flex-col">
            <div className="bg-gray-800 text-white rounded-t-xl px-6 py-4 flex items-center gap-3">
              <Building2 size={20} />
              <div>
                <p className="font-heading font-bold text-sm uppercase tracking-wide">
                  {pathB.badge ?? "Send to My Pharmacy"}
                </p>
                <p className="text-xs opacity-80">
                  Use your insurance, pick up locally
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col flex-grow">
              <div className="mb-4">
                <p className="font-heading text-heading text-3xl font-bold">
                  {pathB.price}
                </p>
                {pathB.priceNote && (
                  <p className="text-body-muted text-sm">{pathB.priceNote}</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-grow">
                {pathB.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-body">
                    <Check
                      size={16}
                      className="text-gray-600 flex-shrink-0 mt-0.5"
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {pathB.pharmacyNote && (
                <div className="flex items-start gap-2 text-xs text-body-muted bg-white rounded-lg p-3 mb-4">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{pathB.pharmacyNote}</span>
                </div>
              )}

              <Button href={pathB.href} size="lg" variant="outline" className="w-full">
                {pathB.cta}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        {onlyA && (
          <p className="text-xs text-body-muted">
            This formula is only available as a compounded medication — it cannot be filled at a regular pharmacy.
          </p>
        )}
        {onlyB && (
          <p className="text-xs text-body-muted">
            This treatment is prescription-only. We&apos;ll send the Rx directly to your pharmacy of choice.
          </p>
        )}
        {bothAvailable && (
          <p className="text-xs text-body-muted max-w-md mx-auto">
            Both options include a licensed provider review, personalized treatment plan, and ongoing care.
          </p>
        )}
      </div>

      {crossSell && (
        <div className="mt-8 rounded-2xl border border-border bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-grow">
            <p className="font-heading text-heading font-semibold text-sm">
              {crossSell.title}
            </p>
            <p className="text-body-muted text-sm">{crossSell.desc}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-heading font-bold text-heading">
              {crossSell.price}
            </span>
            <Button href={crossSell.href} size="sm" variant="outline">
              Add to Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
