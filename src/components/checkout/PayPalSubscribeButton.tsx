"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type PayPalSubscribeButtonProps = {
  monthlyPriceCents: number;
  paypalTotalCycles: number;
  setupFeeCents: number;
  description: string;
  onApprove: (subscriptionId: string) => void;
  onError?: (message?: string) => void;
  disabled?: boolean;
};

export function PayPalSubscribeButton({
  monthlyPriceCents,
  paypalTotalCycles,
  setupFeeCents,
  description,
  onApprove,
  onError,
  disabled,
}: PayPalSubscribeButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-6 rounded-card border-2 border-dashed border-border text-center">
        <p className="text-body-muted text-sm">PayPal not configured. Contact support.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        vault: "true",
        intent: "subscription",
      }}
    >
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "pill",
            height: 50,
          }}
          createSubscription={async (_data, actions) => {
            const res = await fetch("/api/paypal/create-subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                monthlyPriceCents,
                paypalTotalCycles,
                setupFeeCents,
                description,
              }),
            });

            if (!res.ok) {
              onError?.("Failed to initialize subscription");
              throw new Error("Failed to create subscription plan");
            }

            const data = await res.json();
            return actions.subscription.create({ plan_id: data.planId });
          }}
          onApprove={async (data) => {
            if (data.subscriptionID) {
              onApprove(data.subscriptionID);
            } else {
              onError?.("Subscription ID missing from PayPal response");
            }
          }}
          onError={(err) => {
            console.error("PayPal subscription error:", err);
            onError?.();
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
