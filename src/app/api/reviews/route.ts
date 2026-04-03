import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fireWebhook } from "@/lib/webhooks";

export async function GET(req: NextRequest) {
  const productSlug = req.nextUrl.searchParams.get("product");
  const featured    = req.nextUrl.searchParams.get("featured") === "true";
  const siteWide    = req.nextUrl.searchParams.get("siteWide") === "true";
  const limit       = Math.min(100, parseInt(req.nextUrl.searchParams.get("limit") || "20"));

  const where: any = { isApproved: true };
  if (featured) where.isFeatured = true;
  if (productSlug && !siteWide) where.productSlug = productSlug;

  const reviews = await db.review.findMany({
    where,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true, name: true, rating: true, title: true, body: true,
      isVerified: true, isFeatured: true, productSlug: true, createdAt: true,
    },
  });

  const stats = await db.review.aggregate({
    where: { isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  });

  return NextResponse.json({
    reviews,
    avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
    totalCount: stats._count.id,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const review = await db.review.create({
      data: {
        email: body.email,
        name: body.name,
        rating: body.rating,
        title: body.title || null,
        body: body.body,
        productSlug: body.productSlug || null,
        locale: body.locale || "en",
        isApproved: false, // requires admin approval
      },
    });

    await fireWebhook("review.submitted", {
      reviewId: review.id,
      email: body.email,
      rating: body.rating,
      productSlug: body.productSlug,
    });

    return NextResponse.json({ success: true, id: review.id });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
