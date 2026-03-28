import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const productSlug = req.nextUrl.searchParams.get("product");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

  const where: any = { isApproved: true };
  if (productSlug) where.productSlug = productSlug;

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const stats = await db.review.aggregate({
    where,
    _avg: { rating: true },
    _count: true,
  });

  return NextResponse.json({
    reviews,
    avgRating: Math.round((stats._avg.rating || 0) * 10) / 10,
    totalCount: stats._count,
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

    return NextResponse.json({ success: true, id: review.id });
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
