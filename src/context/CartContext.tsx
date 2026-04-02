"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;        // cents — TOTAL plan cost, not per-month
  quantity: number;
  slug: string;
  productType?: "rx" | "supplement" | "consultation"; // fulfillment routing tag
  isMedPlan?: boolean;      // true for ship-to-me medication plans
  monthlyPrice?: number;    // cents per month, for display purposes
  durationMonths?: number;  // number of months in the plan
  flow?: string;            // quiz flow tag e.g. "wellness-injection", "mental-health"
};

export type FlowToast = { message: string; key: number };

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  replaceFlow: (flow: string, newItems: Omit<CartItem, "quantity">[], options?: { silent?: boolean }) => boolean;
  replaceMedPlan: (item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  flowToast: FlowToast | null;
  clearFlowToast: () => void;
};

const FLOW_LABELS: Record<string, string> = {
  "wellness-injection": "Wellness Injection",
  "mental-health":      "Mental Health",
  "compounded-glp1":    "Weight Loss",
  "oral-glp1":          "Weight Loss",
  "branded-rx":         "Weight Loss",
  "insurance":          "Insurance",
  "hair-loss":          "Hair Loss",
};

/**
 * Infer a flow tag from a product ID for items saved before flow tagging was
 * introduced. This runs once on localStorage load so replaceFlow can identify
 * and remove stale items on quiz retakes.
 */
function inferFlow(productId: string): string | undefined {
  const id = productId ?? "";
  if (id.startsWith("WI-"))           return "wellness-injection";
  if (id.startsWith("MW-"))           return "mental-health";
  if (id.startsWith("HL-"))           return "hair-loss";
  if (id === "WM-BRAND-MGMT")        return "branded-rx";
  if (id.startsWith("WM-ORAL-"))     return "oral-glp1";
  if (id.startsWith("WM-"))          return "compounded-glp1";
  if (id.startsWith("INS-"))         return "insurance";
  return undefined;
}

function migrateItems(items: CartItem[]): CartItem[] {
  // 1. Backfill flow tags for items saved before flow-aware cart was introduced
  const tagged = items.map((item) => {
    if (item.flow) return item;
    const flow = inferFlow(item.productId);
    return flow ? { ...item, flow } : item;
  });

  // 2. Deduplicate: for each flow, keep only the most recent set of items.
  //    If multiple items share the same flow, we keep only the LAST occurrence
  //    of each variantId (most recently added wins). This fixes stale duplicates
  //    from before replaceFlow was introduced.
  const seen = new Map<string, CartItem>();
  for (const item of tagged) {
    seen.set(item.variantId, item);
  }
  return Array.from(seen.values());
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [flowToast, setFlowToast] = useState<FlowToast | null>(null);

  // Ref so replaceFlow can read current items synchronously without stale closures
  const itemsRef = useRef<CartItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const saved = localStorage.getItem("bg_cart");
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        // Backfill flow tags for items saved before flow-aware cart was introduced
        const migrated = migrateItems(parsed);
        setItems(migrated);
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

  /**
   * Flow-aware replacement. Removes all items tagged with `flow`, then adds
   * new items tagged with the same flow. Shows a global toast if items were
   * replaced and `silent` is not set.
   * Returns true when at least one existing item was removed.
   */
  const replaceFlow = useCallback((
    flow: string,
    newItems: Omit<CartItem, "quantity">[],
    options?: { silent?: boolean },
  ): boolean => {
    const hadFlow = itemsRef.current.some((i) => i.flow === flow);
    setItems((prev) => {
      const withoutFlow = prev.filter((i) => i.flow !== flow);
      const tagged = newItems.map((item) => ({ ...item, flow, quantity: 1 }));
      return [...withoutFlow, ...tagged];
    });
    if (hadFlow && !options?.silent) {
      const label = FLOW_LABELS[flow] ?? flow;
      setFlowToast((prev) => ({ message: label, key: (prev?.key ?? 0) + 1 }));
    }
    return hadFlow;
  }, []);

  /**
   * Backward-compatible wrapper — delegates to replaceFlow("compounded-glp1").
   * Silent so callers that already show their own toast aren't doubled-up.
   */
  const replaceMedPlan = useCallback((item: Omit<CartItem, "quantity">): boolean => {
    return replaceFlow("compounded-glp1", [item], { silent: true });
  }, [replaceFlow]);

  const clearFlowToast = useCallback(() => setFlowToast(null), []);

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
      value={{
        items,
        addItem,
        replaceFlow,
        replaceMedPlan,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
        flowToast,
        clearFlowToast,
      }}
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
