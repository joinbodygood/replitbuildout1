import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") where.category = category;
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const products = await db.product.findMany({
    where,
    include: {
      translations: { where: { locale: "en" } },
      variants: { orderBy: { sortOrder: "asc" } },
      _count: { select: { variants: true } },
    },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const filtered = search
    ? products.filter((p) => {
        const name = p.translations[0]?.name ?? "";
        const sku = p.sku ?? "";
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || sku.toLowerCase().includes(q) || p.slug.includes(q);
      })
    : products;

  return NextResponse.json({ products: filtered });
}
