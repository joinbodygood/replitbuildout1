"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  slug: string;
  redirectToUpsell?: boolean;
  className?: string;
  label?: string;
};

export function AddToCartButton({
  productId,
  variantId,
  name,
  variantLabel,
  price,
  slug,
  redirectToUpsell = false,
  className,
  label,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const isEs = locale === "es";
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, variantId, name, variantLabel, price, slug });
    if (redirectToUpsell) {
      router.push(`/${locale}/cart/upsell`);
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const defaultLabel = isEs ? "Agregar al Carrito" : "Add to Cart";
  const addedLabel = isEs ? "✓ Agregado" : "✓ Added";

  return (
    <button
      onClick={handleAdd}
      className={`w-full font-heading font-semibold px-8 py-3.5 rounded-pill transition-all duration-base ${
        added
          ? "bg-success text-white"
          : "bg-brand-red text-white shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover"
      } ${className ?? ""}`}
    >
      {added ? addedLabel : (label ?? defaultLabel)}
    </button>
  );
}
