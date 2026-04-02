"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { ShoppingCart, Check } from "lucide-react";

type Props = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  slug: string;
  isEs: boolean;
};

export function SupplementAddToCart({ productId, variantId, name, variantLabel, price, slug, isEs }: Props) {
  const { addItem } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId,
      variantId,
      name,
      variantLabel,
      price,
      slug,
      productType: "supplement",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="space-y-3">
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
            {isEs ? "Agregar al Carrito" : "Add to Cart"}
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
  );
}
