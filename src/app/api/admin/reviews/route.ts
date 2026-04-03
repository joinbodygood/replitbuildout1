import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "25"));
  const search   = searchParams.get("search") ?? "";
  const approved = searchParams.get("approved"); // "true" | "false" | "" (all)
  const featured = searchParams.get("featured"); // "true" | "" (all)
  const rating   = searchParams.get("rating");   // "1"-"5" | "" (all)
  const source   = searchParams.get("source");   // "imported" | "organic" | ""

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { productSlug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (approved === "true")  where.isApproved = true;
  if (approved === "false") where.isApproved = false;
  if (featured === "true")  where.isFeatured = true;
  if (rating)               where.rating     = parseInt(rating);
  if (source)               where.source     = source;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    db.review.count({ where }),
  ]);

  const stats = await db.review.aggregate({
    _avg:   { rating: true },
    _count: { id: true },
    where:  { isApproved: true },
  });

  return NextResponse.json({
    reviews,
    total,
    page,
    limit,
    stats: {
      totalApproved: stats._count.id,
      avgRating:     Math.round((stats._avg.rating ?? 0) * 10) / 10,
    },
  });
}
