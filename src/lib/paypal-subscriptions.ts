import { db } from "@/lib/db";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_SANDBOX === "false"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

async function getOrCreatePayPalProduct(token: string): Promise<string> {
  const existingPlan = await db.paypalPlan.findFirst({ select: { paypalProductId: true } });
  if (existingPlan) return existingPlan.paypalProductId;

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": "bgs-telehealth-product-v1",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "Body Good Studio — Telehealth Programs",
      description: "Physician-led GLP-1, wellness, and specialty health programs",
      type: "SERVICE",
      category: "HEALTH_AND_BEAUTY_APPS",
    }),
  });

  if (res.status === 409) {
    const listRes = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products?page_size=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!listRes.ok) throw new Error("Failed to list PayPal products after 409");
    const listData = await listRes.json();
    const first = listData.products?.[0];
    if (!first) throw new Error("No PayPal products found after creation conflict");
    return first.id as string;
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal product creation failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.id as string;
}

export async function getOrCreatePayPalPlan(params: {
  pricePerCycleCents: number;
  totalCycles: number;
  setupFeeCents: number;
  description: string;
}): Promise<string> {
  const { pricePerCycleCents, totalCycles, setupFeeCents, description } = params;

  const existing = await db.paypalPlan.findFirst({
    where: { pricePerCycleCents, totalCycles, setupFeeCents },
  });
  if (existing) return existing.paypalPlanId;

  const token = await getAccessToken();
  const productId = await getOrCreatePayPalProduct(token);

  const priceStr = (pricePerCycleCents / 100).toFixed(2);

  const billingCycles = [
    {
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: totalCycles,
      pricing_scheme: {
        fixed_price: { value: priceStr, currency_code: "USD" },
      },
    },
  ];

  const paymentPreferences: Record<string, unknown> = {
    auto_bill_outstanding: true,
    setup_fee_failure_action: "CANCEL",
    payment_failure_threshold: 3,
  };

  if (setupFeeCents > 0) {
    paymentPreferences.setup_fee = {
      value: (setupFeeCents / 100).toFixed(2),
      currency_code: "USD",
    };
  }

  const planRes = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `bgs-plan-${pricePerCycleCents}-${totalCycles}-${setupFeeCents}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      product_id: productId,
      name: description,
      description,
      status: "ACTIVE",
      billing_cycles: billingCycles,
      payment_preferences: paymentPreferences,
    }),
  });

  if (!planRes.ok) {
    const err = await planRes.text();
    throw new Error(`PayPal plan creation failed: ${planRes.status} ${err}`);
  }

  const planData = await planRes.json();

  await db.paypalPlan.create({
    data: {
      paypalPlanId: planData.id,
      paypalProductId: productId,
      pricePerCycleCents,
      totalCycles,
      setupFeeCents,
      description,
    },
  });

  return planData.id as string;
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Failed to get subscription: ${res.status}`);
  return res.json();
}

export async function cancelPayPalSubscription(
  subscriptionId: string,
  reason = "Cancelled by administrator"
): Promise<boolean> {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Failed to cancel subscription: ${res.status} ${err}`);
  }
  return true;
}
