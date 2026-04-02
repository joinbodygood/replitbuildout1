import type { CartItem } from "@/context/CartContext";

export function isSubscriptionItem(item: CartItem): boolean {
  return !!(item.isMedPlan && item.monthlyPrice && item.monthlyPrice > 0);
}

export type CartClassification = {
  subscriptionItems: CartItem[];
  oneTimeItems: CartItem[];
  hasSubscription: boolean;
  hasMixed: boolean;
  monthlyPriceCents: number;
  paypalTotalCycles: number;
  displayTotalCycles: number;
  setupFeeCents: number;
};

export function classifyCart(items: CartItem[]): CartClassification {
  const subscriptionItems = items.filter(isSubscriptionItem);
  const oneTimeItems = items.filter((i) => !isSubscriptionItem(i));

  const hasSubscription = subscriptionItems.length > 0;
  const hasMixed = hasSubscription && oneTimeItems.length > 0;

  const primarySub = subscriptionItems[0];
  const monthlyPriceCents = primarySub?.monthlyPrice ?? 0;
  const durationMonths = primarySub?.durationMonths ?? 1;

  const paypalTotalCycles = durationMonths <= 1 ? 0 : durationMonths;
  const setupFeeCents = oneTimeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    subscriptionItems,
    oneTimeItems,
    hasSubscription,
    hasMixed,
    monthlyPriceCents,
    paypalTotalCycles,
    displayTotalCycles: durationMonths,
    setupFeeCents,
  };
}

export function buildSubscriptionDescription(classification: CartClassification): string {
  const { subscriptionItems, monthlyPriceCents, paypalTotalCycles } = classification;
  const name = subscriptionItems[0]?.name ?? "Subscription";
  const price = `$${(monthlyPriceCents / 100).toFixed(2)}/mo`;
  if (paypalTotalCycles === 0) return `${name} — ${price} (ongoing)`;
  return `${name} — ${price} × ${paypalTotalCycles} months`;
}
