"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/context/CartContext";
import { detectCartConflict } from "@/lib/cart-utils";

interface ConflictState {
  existingProgram: string;
  onReplace: () => void;
}

/**
 * Provides a `guardedReplaceFlow` wrapper that detects cross-program cart
 * conflicts before writing to the cart.
 *
 * Returns `true` when the replacement was applied (no conflict), `false` when
 * a conflict was detected and the caller should show the modal.
 *
 * Exception: Weight Loss flows + Wellness Injection can coexist.
 */
export function useCartConflictGuard() {
  const { items, replaceFlow, clearCart } = useCart();
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  function guardedReplaceFlow(
    flow: string,
    newItems: Omit<CartItem, "quantity">[],
    onSuccess: () => void,
    options?: { silent?: boolean },
  ): boolean {
    const conflictingProgram = detectCartConflict(flow, items);

    if (conflictingProgram) {
      setConflict({
        existingProgram: conflictingProgram,
        onReplace: () => {
          clearCart();
          replaceFlow(flow, newItems, { ...options, silent: true });
          setConflict(null);
          onSuccess();
        },
      });
      return false;
    }

    replaceFlow(flow, newItems, options);
    onSuccess();
    return true;
  }

  return {
    conflict,
    dismissConflict: () => setConflict(null),
    guardedReplaceFlow,
  };
}
