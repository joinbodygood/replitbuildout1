"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type PayPalButtonProps = {
  amount: number;
  discountCode?: string;
  onApprove: (paypalOrderId: string) => void;
  onError?: (message?: string) => void;
  disabled?: boolean;
};

export function PayPalButton({ amount, discountCode, onApprove, onError, disabled }: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-6 rounded-card border-2 border-dashed border-border text-center">
        <p className="text-body-muted text-sm">
          PayPal not configured. Contact support.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "pill",
            label: "pay",
            height: 50,
          }}
          createOrder={async () => {
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subtotal: amount,
                discountCode: discountCode || null,
                items: [],
              }),
            });

            if (!res.ok) {
              onError?.("Failed to initialize payment");
              throw new Error("Failed to create PayPal order");
            }

            const data = await res.json();
            return data.paypalOrderId;
          }}
          onApprove={async (data) => {
            onApprove(data.orderID);
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            onError?.();
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
