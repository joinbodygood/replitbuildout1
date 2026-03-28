"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useLocale } from "next-intl";

type AddToCartButtonProps = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  slug: string;
};

export function AddToCartButton({
  productId,
  variantId,
  name,
  variantLabel,
  price,
  slug,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const locale = useLocale();
  const isEs = locale === "es";
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({ productId, variantId, name, variantLabel, price, slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full font-heading font-semibold px-8 py-3.5 rounded-pill transition-all duration-base ${
        added
          ? "bg-success text-white"
          : "bg-brand-red text-white shadow-btn hover:bg-brand-red-hover hover:shadow-btn-hover"
      }`}
    >
      {added
        ? (isEs ? "✓ Agregado" : "✓ Added")
        : (isEs ? "Agregar al Carrito" : "Add to Cart")}
    </button>
  );
}
