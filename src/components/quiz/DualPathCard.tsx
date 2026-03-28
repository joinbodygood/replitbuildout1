"use client";

import { Check, X, Truck, Building2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/product/AddToCartButton";

export interface PathCartData {
  productId: string;
  variantId: string;
  priceInCents: number;
  variantLabel: string;
  slug: string;
}

export interface PathOption {
  price: string;
  priceNote?: string;
  badge?: string;
  benefits: string[];
  tradeoffs?: string[];
  cta: string;
  href: string;
  pharmacyNote?: string;
  cartData?: PathCartData;
}

interface DualPathCardProps {
  productName: string;
  productSubtitle?: string;
  recommendation?: string;
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
  locale = "en",
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
        {recommendation && (
          <p className="text-body text-base max-w-xl mx-auto">{recommendation}</p>
        )}
      </div>

      {bothAvailable && (
        <p className="text-center font-heading text-heading font-semibold mb-5 text-lg">
          Choose how you&apos;d like to get started:
        </p>
      )}

      <div
        className={`grid gap-5 ${
          bothAvailable ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-md mx-auto"
        }`}
      >
        {pathA && (
          <PathCard
            option={pathA}
            style="red"
            productName={productName}
            locale={locale}
          />
        )}
        {pathB && (
          <PathCard
            option={pathB}
            style="dark"
            productName={productName}
            locale={locale}
          />
        )}
      </div>

      <div className="mt-5 text-center">
        {onlyA && (
          <p className="text-xs text-body-muted">
            This formula is only available compounded — it cannot be filled at a regular pharmacy.
          </p>
        )}
        {onlyB && (
          <p className="text-xs text-body-muted">
            This treatment is prescription-only. We&apos;ll send the Rx directly to your pharmacy.
          </p>
        )}
        {bothAvailable && (
          <p className="text-xs text-body-muted max-w-md mx-auto">
            Both options include a licensed provider review and personalized treatment plan.
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

function PathCard({
  option,
  style,
  productName,
  locale,
}: {
  option: PathOption;
  style: "red" | "dark";
  productName: string;
  locale: string;
}) {
  const isRed = style === "red";
  const isEs = locale === "es";

  return (
    <div
      className={`rounded-2xl border-2 flex flex-col overflow-hidden ${
        isRed
          ? "border-brand-red bg-white shadow-card-hover"
          : "border-gray-200 bg-brand-pink-soft"
      }`}
    >
      <div
        className={`px-6 py-4 flex items-center gap-3 ${
          isRed ? "bg-brand-red text-white" : "bg-gray-800 text-white"
        }`}
      >
        {isRed ? <Truck size={20} /> : <Building2 size={20} />}
        <div>
          <p className="font-heading font-bold text-sm uppercase tracking-wide">
            {option.badge ?? (isRed ? "Ship to My Door" : "Send to My Pharmacy")}
          </p>
          <p className="text-xs opacity-80">
            {isRed ? "Compounded formula, free shipping" : "Use your insurance, pick up locally"}
          </p>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col flex-grow">
        <div className="mb-4">
          <p className="font-heading text-heading text-3xl font-bold">{option.price}</p>
          {option.priceNote && (
            <p className="text-body-muted text-sm">{option.priceNote}</p>
          )}
        </div>

        <div className="space-y-1.5 mb-4 flex-grow">
          {option.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check
                size={15}
                className={`flex-shrink-0 mt-0.5 ${isRed ? "text-brand-red" : "text-gray-600"}`}
              />
              <span className="text-body">{b}</span>
            </div>
          ))}
        </div>

        {option.tradeoffs && option.tradeoffs.length > 0 && (
          <div className="space-y-1.5 mb-4 border-t border-border pt-3">
            {option.tradeoffs.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <X size={15} className="text-body-muted flex-shrink-0 mt-0.5" />
                <span className="text-body-muted">{t}</span>
              </div>
            ))}
          </div>
        )}

        {option.pharmacyNote && (
          <div className="flex items-start gap-2 text-xs text-body-muted bg-white rounded-lg p-3 mb-4">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{option.pharmacyNote}</span>
          </div>
        )}

        {option.cartData ? (
          <AddToCartButton
            productId={option.cartData.productId}
            variantId={option.cartData.variantId}
            name={productName}
            variantLabel={option.cartData.variantLabel}
            price={option.cartData.priceInCents}
            slug={option.cartData.slug}
            redirectToUpsell
            label={isEs ? option.cta.replace("→", "").trim() : option.cta}
          />
        ) : (
          <Button
            href={option.href}
            size="lg"
            variant={isRed ? "primary" : "outline"}
            className="w-full"
          >
            {option.cta}
          </Button>
        )}
      </div>
    </div>
  );
}
