import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

async function resolveProductSlug(shopifyProductId: string): Promise<string | null> {
  if (!shopifyProductId) return null;
  // Try to resolve via ShopifyMapping (which stores shopifyProductId)
  const mapping = await db.shopifyMapping.findFirst({
    where: { shopifyProductId: String(shopifyProductId) },
  });
  if (!mapping || !mapping.ourSku) return null;
  // Look up the product by sku
  const product = await db.product.findFirst({ where: { sku: mapping.ourSku } });
  return product?.slug ?? null;
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rawReviews: any[];
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const text     = await file.text();
    rawReviews     = JSON.parse(text);
    if (!Array.isArray(rawReviews)) throw new Error("Expected JSON array");
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
  }

  let imported    = 0;
  let skipped     = 0; // published: false
  let unmapped    = 0; // no product match (stored as general)
  let duplicates  = 0;

  // Pre-build slug cache to avoid repeated DB lookups for same shopify product
  const slugCache = new Map<string, string | null>();

  for (const r of rawReviews) {
    // Only import published reviews
    if (!r.published) { skipped++; continue; }

    // Dedup by shopifyId
    const shopifyId = r.id ? String(r.id) : null;
    if (shopifyId) {
      const exists = await db.review.findUnique({ where: { shopifyId } });
      if (exists) { duplicates++; continue; }
    }

    // Resolve product slug
    const shopifyProductId = r.product_external_id ? String(r.product_external_id) : null;
    let productSlug: string | null = null;
    if (shopifyProductId) {
      if (!slugCache.has(shopifyProductId)) {
        slugCache.set(shopifyProductId, await resolveProductSlug(shopifyProductId));
      }
      productSlug = slugCache.get(shopifyProductId) ?? null;
      if (!productSlug) unmapped++;
    }

    const isVerified  = r.verified === "verified-purchase";
    const createdAt   = r.created_at ? new Date(r.created_at) : new Date();
    const rating      = Math.min(5, Math.max(1, parseInt(r.rating ?? "5") || 5));
    const reviewerName  = r.reviewer?.name ?? r.name ?? "Verified Customer";
    const reviewerEmail = (r.reviewer?.email ?? r.email ?? "imported@bodygoodstudio.com").toLowerCase();
    const body        = (r.body ?? "").trim();
    const title       = (r.title ?? "").trim() || null;

    await db.review.create({
      data: {
        shopifyId,
        productSlug,
        shopifyProductId,
        email:      reviewerEmail,
        name:       reviewerName,
        rating,
        title,
        body:       body || "Great product!",
        isVerified,
        isApproved: true,     // all imported reviews were published on Shopify
        isFeatured: r.featured === true,
        source:     "imported",
        locale:     "en",
        createdAt,
      },
    });
    imported++;
  }

  const total = await db.review.count({ where: { source: "imported" } });
  return NextResponse.json({ success: true, imported, skipped, unmapped, duplicates, total });
}
