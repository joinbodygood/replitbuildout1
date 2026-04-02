import type { CartItem } from "@/context/CartContext";

export function isSubscriptionItem(item: CartItem): boolean {
  // Rx subscription: has isMedPlan + monthlyPrice
  if (item.isMedPlan && item.monthlyPrice && item.monthlyPrice > 0) return true;
  // Supplement subscription: purchaseType === "subscribe"
  if (item.purchaseType === "subscribe") return true;
  return false;
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
  hasRxSubscription: boolean;
  hasSupplementSubscription: boolean;
};

export function classifyCart(items: CartItem[]): CartClassification {
  const subscriptionItems = items.filter(isSubscriptionItem);
  const oneTimeItems = items.filter((i) => !isSubscriptionItem(i));

  const hasSubscription = subscriptionItems.length > 0;
  const hasMixed = hasSubscription && oneTimeItems.length > 0;

  // Separate Rx subscriptions (isMedPlan) from supplement subscriptions (purchaseType === "subscribe")
  const rxSubItems = subscriptionItems.filter(
    (i) => i.isMedPlan && (i.monthlyPrice ?? 0) > 0
  );
  const suppSubItems = subscriptionItems.filter(
    (i) => i.purchaseType === "subscribe"
  );

  const hasRxSubscription = rxSubItems.length > 0;
  const hasSupplementSubscription = suppSubItems.length > 0;

  // Monthly price = sum of all subscription monthly amounts
  const rxMonthly = rxSubItems.reduce((sum, i) => sum + (i.monthlyPrice ?? 0), 0);
  const suppMonthly = suppSubItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const monthlyPriceCents = rxMonthly + suppMonthly;

  // Duration: Rx subscription drives the cycle count; supplement-only = 0 (infinite)
  const primaryRx = rxSubItems[0];
  const durationMonths = primaryRx?.durationMonths ?? 0;
  const paypalTotalCycles = durationMonths <= 1 ? 0 : durationMonths;

  // Setup fee = sum of all one-time items (including one-time supplements)
  const setupFeeCents = oneTimeItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return {
    subscriptionItems,
    oneTimeItems,
    hasSubscription,
    hasMixed,
    monthlyPriceCents,
    paypalTotalCycles,
    displayTotalCycles: durationMonths,
    setupFeeCents,
    hasRxSubscription,
    hasSupplementSubscription,
  };
}

export function buildSubscriptionDescription(
  classification: CartClassification
): string {
  const {
    subscriptionItems,
    monthlyPriceCents,
    paypalTotalCycles,
    hasRxSubscription,
    hasSupplementSubscription,
  } = classification;

  const price = `$${(monthlyPriceCents / 100).toFixed(2)}/mo`;

  if (hasSupplementSubscription && !hasRxSubscription) {
    // Supplement-only subscription
    const suppNames = subscriptionItems.map((i) => i.name).join(", ");
    return `Body Good Studio — Monthly Supplements: ${suppNames} — ${price}`;
  }

  if (hasRxSubscription && hasSupplementSubscription) {
    // Mixed: Rx + supplement subscriptions
    const rxName = subscriptionItems.find((i) => i.isMedPlan)?.name ?? "Program";
    const suppCount = subscriptionItems.filter(
      (i) => i.purchaseType === "subscribe"
    ).length;
    const cycleStr =
      paypalTotalCycles === 0
        ? "(ongoing)"
        : `× ${paypalTotalCycles} months`;
    return `${rxName} + ${suppCount} supplement${suppCount > 1 ? "s" : ""} — ${price} ${cycleStr}`;
  }

  // Standard Rx-only subscription
  const name = subscriptionItems[0]?.name ?? "Subscription";
  if (paypalTotalCycles === 0) return `${name} — ${price} (ongoing)`;
  return `${name} — ${price} × ${paypalTotalCycles} months`;
}
