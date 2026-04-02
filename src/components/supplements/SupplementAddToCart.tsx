"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ShoppingCart, Check, RefreshCw, Tag } from "lucide-react";

const DISCOUNT = 0.10; // 10% off for Subscribe & Save

type Props = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number; // full retail price in cents
  slug: string;
  isEs: boolean;
};

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function SupplementAddToCart({
  productId,
  variantId,
  name,
  variantLabel,
  price,
  slug,
  isEs,
}: Props) {
  const { addItem, items, updateItem } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const [purchaseType, setPurchaseType] = useState<"one-time" | "subscribe">("subscribe");
  const [added, setAdded] = useState(false);

  const subscribePrice = Math.round(price * (1 - DISCOUNT));
  const savings = price - subscribePrice;

  // Check if this item is already in cart
  const cartItem = items.find((i) => i.variantId === variantId);
  const isInCart = !!cartItem;

  function handlePurchaseTypeChange(type: "one-time" | "subscribe") {
    setPurchaseType(type);
    // If the item is already in the cart, update it in-place
    if (cartItem) {
      if (type === "subscribe") {
        updateItem(variantId, {
          purchaseType: "subscribe",
          price: subscribePrice,
          originalPrice: price,
        });
      } else {
        updateItem(variantId, {
          purchaseType: "one-time",
          price,
          originalPrice: price,
        });
      }
    }
  }

  function handleAdd() {
    const isSubscribe = purchaseType === "subscribe";
    addItem({
      productId,
      variantId,
      name,
      variantLabel,
      price: isSubscribe ? subscribePrice : price,
      slug,
      productType: "supplement",
      purchaseType,
      originalPrice: price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Purchase Type Selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-heading">
          {isEs ? "Opción de compra" : "Purchase option"}
        </p>

        {/* Subscribe & Save — default/highlighted */}
        <label
          className={`flex items-start gap-3 p-4 rounded-card border-2 cursor-pointer transition-all ${
            purchaseType === "subscribe"
              ? "border-brand-red bg-brand-pink-soft"
              : "border-border hover:border-brand-red/40"
          }`}
        >
          <input
            type="radio"
            name={`purchase-type-${variantId}`}
            value="subscribe"
            checked={purchaseType === "subscribe"}
            onChange={() => handlePurchaseTypeChange("subscribe")}
            className="mt-0.5 accent-brand-red"
          />
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading text-heading font-semibold text-sm">
                {isEs ? "Suscribirse y Ahorrar" : "Subscribe & Save"}
              </span>
              <span className="inline-flex items-center gap-1 bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />
                {isEs ? "Ahorra 10%" : "Save 10%"}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-heading font-bold text-lg">
                {fmt(subscribePrice)}<span className="text-sm font-normal text-body-muted">/mo</span>
              </span>
              <span className="text-body-muted text-sm line-through">{fmt(price)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <RefreshCw className="w-3 h-3 text-success shrink-0" />
              <p className="text-xs text-body-muted">
                {isEs
                  ? "Renovación mensual automática · Cancela cuando quieras"
                  : "Auto-renews monthly · Cancel anytime"}
              </p>
            </div>
          </div>
        </label>

        {/* One-Time Purchase */}
        <label
          className={`flex items-start gap-3 p-4 rounded-card border-2 cursor-pointer transition-all ${
            purchaseType === "one-time"
              ? "border-brand-red bg-brand-pink-soft"
              : "border-border hover:border-brand-red/40"
          }`}
        >
          <input
            type="radio"
            name={`purchase-type-${variantId}`}
            value="one-time"
            checked={purchaseType === "one-time"}
            onChange={() => handlePurchaseTypeChange("one-time")}
            className="mt-0.5 accent-brand-red"
          />
          <div className="flex-grow min-w-0">
            <span className="font-heading text-heading font-semibold text-sm">
              {isEs ? "Compra única" : "One-time purchase"}
            </span>
            <div className="mt-1">
              <span className="font-heading text-heading font-bold text-lg">
                {fmt(price)}
              </span>
            </div>
            <p className="text-xs text-body-muted mt-1">
              {isEs ? "Pago único, sin compromiso" : "Single payment, no commitment"}
            </p>
          </div>
        </label>
      </div>

      {/* Subscribe savings callout */}
      {purchaseType === "subscribe" && (
        <p className="text-xs text-success font-medium flex items-center gap-1">
          <Check className="w-3.5 h-3.5" />
          {isEs
            ? `Ahorras ${fmt(savings)} al mes con la suscripción`
            : `You save ${fmt(savings)}/mo with Subscribe & Save`}
        </p>
      )}

      {/* Add to Cart / In Cart button */}
      {isInCart ? (
        <div className="space-y-2">
          <div className="w-full flex items-center justify-center gap-2 font-heading font-semibold px-8 py-4 rounded-pill text-lg bg-success text-white">
            <Check className="w-5 h-5" />
            {isEs ? "En tu carrito" : "In your cart"}
          </div>
          <button
            onClick={() => router.push(`/${locale}/cart`)}
            className="w-full text-center text-sm font-medium text-brand-red hover:underline"
          >
            {purchaseType === "subscribe"
              ? (isEs ? "Ver carrito — Suscripción activa" : "View cart — Subscription active")
              : (isEs ? "Ver carrito" : "View cart")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleAdd}
            className={`w-full flex items-center justify-center gap-2 font-heading font-semibold px-8 py-4 rounded-pill text-lg transition-all duration-200 ${
              added
                ? "bg-success text-white"
                : "bg-brand-red text-white shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover"
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5" />
                {isEs ? "Agregado al carrito" : "Added to cart"}
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                {purchaseType === "subscribe"
                  ? (isEs ? "Suscribirse y Ahorrar" : "Subscribe & Save")
                  : (isEs ? "Agregar al Carrito" : "Add to Cart")}
              </>
            )}
          </button>
          {added && (
            <button
              onClick={() => router.push(`/${locale}/cart`)}
              className="w-full text-center text-sm font-medium text-brand-red hover:underline"
            >
              {isEs ? "Ver carrito" : "View cart"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
