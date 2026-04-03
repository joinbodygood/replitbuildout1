import { db } from "@/lib/db";
import { createHmac } from "crypto";

const SHOPIFY_DOMAIN        = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_CLIENT_ID     = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_APP_SHARED_SECRET;

/* ─── Token management ──────────────────────────────────────────────────── */

export async function getShopifyToken(): Promise<string> {
  const staticToken = process.env.SHOPIFY_ACCESS_TOKEN;

  const cached = await db.shopifyToken.findFirst({ orderBy: { createdAt: "desc" } });

  if (cached && cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
    return cached.token;
  }

  if (SHOPIFY_CLIENT_ID && SHOPIFY_CLIENT_SECRET && SHOPIFY_DOMAIN) {
    try {
      const resp = await fetch(`https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id:     SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          grant_type:    "client_credentials",
        }),
      });

      if (resp.ok) {
        const data      = await resp.json();
        const token     = data.access_token as string;
        // Use server-reported expires_in (seconds), subtract 5 min buffer
        const expiresInMs = ((data.expires_in as number ?? 86400) - 300) * 1000;
        const expiresAt   = new Date(Date.now() + expiresInMs);

        if (cached) {
          await db.shopifyToken.update({ where: { id: cached.id }, data: { token, expiresAt } });
        } else {
          await db.shopifyToken.create({ data: { token, expiresAt } });
        }
        return token;
      }
    } catch (err) {
      console.error("[Shopify] Token refresh failed:", err);
    }
  }

  if (staticToken) return staticToken;
  throw new Error("No Shopify token available — configure SHOPIFY_ACCESS_TOKEN or SHOPIFY_CLIENT_ID/SHOPIFY_APP_SHARED_SECRET");
}

/* ─── Webhook HMAC verification ─────────────────────────────────────────── */

export function verifyShopifyWebhook(rawBody: string, hmacHeader: string): boolean {
  // Use dedicated webhook secret if set, fall back to app shared secret
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_APP_SHARED_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  return digest === hmacHeader;
}

/* ─── Order creation ─────────────────────────────────────────────────────── */

export interface ShopifyOrderParams {
  orderId:         string;
  email:           string;
  shippingName:    string;
  shippingAddress: string;
  shippingCity:    string;
  shippingState:   string;
  shippingZip:     string;
  items: Array<{
    sku:         string;
    productName: string;
    quantity:    number;
    price:       number;
  }>;
}

export async function createShopifyOrder(
  params: ShopifyOrderParams
): Promise<{ shopifyOrderId: string; shopifyOrderUrl: string }> {
  if (!SHOPIFY_DOMAIN) throw new Error("SHOPIFY_DOMAIN not configured");

  const token = await getShopifyToken();

  // Build a set of candidate SKUs — include both the raw SKU and, for variant SKUs
  // ending in "-VAR", also try the base catalog SKU (e.g. "VOX4ASHW-VAR" → "VOX4ASHW").
  const rawSkus       = params.items.map((i) => i.sku).filter(Boolean) as string[];
  const baseCandidates = rawSkus.flatMap((s) => (s.endsWith("-VAR") ? [s, s.slice(0, -4)] : [s]));
  const mappings = await db.shopifyMapping.findMany({
    where: { ourSku: { in: baseCandidates }, isActive: true },
  });

  const lineItems = params.items
    .map((item) => {
      const baseSku  = item.sku.endsWith("-VAR") ? item.sku.slice(0, -4) : item.sku;
      const mapping  = mappings.find((m) => m.ourSku === item.sku || m.ourSku === baseSku);
      if (!mapping) return null;
      return {
        variant_id:        parseInt(mapping.shopifyVariantId),
        quantity:          item.quantity,
        price:             (item.price / 100).toFixed(2),
        requires_shipping: true,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (lineItems.length === 0) {
    throw new Error(
      `No Shopify variant mappings found for SKUs: ${skus.join(", ")}. Add mappings in Admin → Products → Shopify Mapping.`
    );
  }

  const [firstName, ...lastParts] = (params.shippingName || "Customer").split(" ");
  const lastName = lastParts.join(" ") || "";

  const resp = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/orders.json`, {
    method:  "POST",
    headers: {
      "Content-Type":           "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({
      order: {
        email:              params.email,
        financial_status:   "paid",
        fulfillment_status: null,
        note:               `Auto-created from Body Good platform. Order #${params.orderId}`,
        tags:               "supliful, auto-routed, bodygood-platform",
        line_items:         lineItems,
        customer:           { first_name: firstName, last_name: lastName, email: params.email },
        shipping_address:   {
          first_name: firstName,
          last_name:  lastName,
          address1:   params.shippingAddress,
          city:       params.shippingCity,
          province:   params.shippingState,
          zip:        params.shippingZip,
          country:    "US",
        },
        send_receipt:             false,
        send_fulfillment_receipt: false,
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Shopify API error ${resp.status}: ${err}`);
  }

  const data         = await resp.json();
  const shopifyOrder = data.order;

  return {
    shopifyOrderId:  String(shopifyOrder.id),
    shopifyOrderUrl: shopifyOrder.order_status_url ?? `https://${SHOPIFY_DOMAIN}/admin/orders/${shopifyOrder.id}`,
  };
}

/* ─── Route supplement items to Shopify ──────────────────────────────────── */

export async function routeSupplementsToShopify(order: {
  id:              string;
  email:           string;
  shippingName:    string | null;
  shippingAddress: string | null;
  shippingCity:    string | null;
  shippingState:   string | null;
  shippingZip:     string | null;
  items: Array<{
    id:          string;
    productType: string;
    sku:         string | null;
    productName: string;
    quantity:    number;
    price:       number;
  }>;
}): Promise<void> {
  const supplementItems = order.items.filter((i) => i.productType === "supplement" && i.sku);
  if (supplementItems.length === 0) return;

  try {
    const { shopifyOrderId, shopifyOrderUrl } = await createShopifyOrder({
      orderId:         order.id,
      email:           order.email,
      shippingName:    order.shippingName    ?? "Customer",
      shippingAddress: order.shippingAddress ?? "",
      shippingCity:    order.shippingCity    ?? "",
      shippingState:   order.shippingState   ?? "",
      shippingZip:     order.shippingZip     ?? "",
      items: supplementItems.map((i) => ({
        sku:         i.sku!,
        productName: i.productName,
        quantity:    i.quantity,
        price:       i.price,
      })),
    });

    await db.shopifyOrder.create({
      data: {
        orderId:        order.id,
        shopifyOrderId,
        shopifyOrderUrl,
        status:         "processing",
      },
    });

    await db.orderItem.updateMany({
      where: { orderId: order.id, productType: "supplement" },
      data:  { shopifyFulfillmentStatus: "processing" },
    });

    console.log(`[Shopify] Order ${shopifyOrderId} created for our order ${order.id}`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(`[Shopify] Failed to create order for our order ${order.id}:`, reason);

    await db.shopifyOrder.create({
      data: {
        orderId:       order.id,
        shopifyOrderId: `FAILED-${order.id}-${Date.now()}`,
        status:        "failed",
        failureReason: reason,
      },
    });

    await db.orderItem.updateMany({
      where: { orderId: order.id, productType: "supplement" },
      data:  { shopifyFulfillmentStatus: "failed" },
    });
  }
}
