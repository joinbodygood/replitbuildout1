"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type PayPalButtonProps = {
  amount: number; // cents
  onApprove: (orderId: string) => void;
  onError?: () => void;
  disabled?: boolean;
};

export function PayPalButton({ amount, onApprove, onError, disabled }: PayPalButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="p-6 rounded-card border-2 border-dashed border-border text-center">
        <p className="text-body-muted text-sm">
          PayPal Client ID not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to .env
        </p>
      </div>
    );
  }

  const amountStr = (amount / 100).toFixed(2);

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
          createOrder={(_data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: amountStr,
                  },
                  description: "Body Good Studio - Weight Loss Program",
                },
              ],
            });
          }}
          onApprove={async (_data, actions) => {
            if (actions.order) {
              const details = await actions.order.capture();
              onApprove(details.id || "");
            }
          }}
          onError={() => {
            onError?.();
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
