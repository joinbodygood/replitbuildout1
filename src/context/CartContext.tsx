"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;        // cents — TOTAL plan cost, not per-month
  quantity: number;
  slug: string;
  isMedPlan?: boolean;      // true for ship-to-me medication plans
  monthlyPrice?: number;    // cents per month, for display purposes
  durationMonths?: number;  // number of months in the plan
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  replaceMedPlan: (item: Omit<CartItem, "quantity">) => boolean; // returns true if an existing plan was replaced
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bg_cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("bg_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  // Replace any existing medication plan with the new one.
  // Returns true if a previous plan was removed (so callers can show a toast).
  const replaceMedPlan = useCallback((item: Omit<CartItem, "quantity">): boolean => {
    let replaced = false;
    setItems((prev) => {
      const hadExisting = prev.some((i) => i.isMedPlan);
      if (hadExisting) replaced = true;
      const filtered = prev.filter((i) => !i.isMedPlan);
      return [...filtered, { ...item, quantity: 1 }];
    });
    return replaced;
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, replaceMedPlan, removeItem, updateQuantity, clearCart, itemCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
