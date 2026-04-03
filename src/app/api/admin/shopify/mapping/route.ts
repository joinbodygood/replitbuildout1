import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [mappings, supplements] = await Promise.all([
    db.shopifyMapping.findMany({ orderBy: { ourSku: "asc" } }),
    db.product.findMany({
      where: { productType: "supplement" },
      include: {
        translations: { where: { locale: "en" } },
        variants:     { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return NextResponse.json({ mappings, supplements });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { ourSku, productId, shopifyProductId, shopifyVariantId, isActive } = body;

  if (!ourSku || !shopifyProductId || !shopifyVariantId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const mapping = await db.shopifyMapping.upsert({
    where:  { ourSku },
    create: { ourSku, productId: productId || null, shopifyProductId, shopifyVariantId, isActive: isActive ?? true },
    update: { productId: productId || null, shopifyProductId, shopifyVariantId, isActive: isActive ?? true },
  });

  return NextResponse.json({ mapping });
}

export async function DELETE(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ourSku = searchParams.get("sku");
  if (!ourSku) return NextResponse.json({ error: "Missing sku" }, { status: 400 });

  await db.shopifyMapping.delete({ where: { ourSku } });
  return NextResponse.json({ success: true });
}
