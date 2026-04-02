import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("locale") ?? "en";

  try {
    const bundles = await db.product.findMany({
      where: { productType: "bundle", isActive: true },
      include: {
        translations: { where: { locale } },
        variants: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = bundles.map((b) => {
      const t = b.translations[0];
      const variant = b.variants[0];
      if (!t || !variant) return null;

      const bundleItems = t.descriptionLong
        .split("\n")
        .filter((line) => line.startsWith("•"))
        .map((line) => line.replace(/^•\s*/, ""));

      return {
        id: b.id,
        slug: b.slug,
        programTag: b.programTag,
        name: t.name,
        descriptionShort: t.descriptionShort,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        variantId: variant.id,
        variantLabel: variant.label,
        bundleItems,
      };
    }).filter(Boolean);

    return NextResponse.json({ bundles: result });
  } catch (err) {
    console.error("Bundles API error:", err);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}
