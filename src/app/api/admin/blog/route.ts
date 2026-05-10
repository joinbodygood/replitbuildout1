import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser, hasPermission } from "@/lib/admin-auth";

const VALID_CATEGORIES = [
  "glp1-education",
  "weight-loss-tips",
  "insurance-guides",
  "patient-stories",
];

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") where.category = category;
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;

  const posts = await db.blogPost.findMany({
    where,
    include: { translations: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const filtered = search
    ? posts.filter((p) => {
        const q = search.toLowerCase();
        if (p.slug.toLowerCase().includes(q)) return true;
        return p.translations.some((t) => t.title.toLowerCase().includes(q));
      })
    : posts;

  return NextResponse.json({ posts: filtered });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(user.role, "content")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    slug,
    category,
    authorName,
    featuredImage,
    isPublished,
    translations,
  }: {
    slug?: string;
    category?: string;
    authorName?: string;
    featuredImage?: string | null;
    isPublished?: boolean;
    translations?: Array<{
      locale: string;
      title: string;
      excerpt: string;
      body: string;
      seoTitle?: string;
      seoDescription?: string;
    }>;
  } = body;

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "slug required (lowercase letters, numbers, hyphens)" }, { status: 400 });
  }
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }
  if (!translations || translations.length === 0) {
    return NextResponse.json({ error: "at least one translation required" }, { status: 400 });
  }
  for (const t of translations) {
    if (!t.locale || !t.title || !t.excerpt || !t.body) {
      return NextResponse.json({ error: "each translation needs locale, title, excerpt, body" }, { status: 400 });
    }
  }

  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "slug already in use" }, { status: 409 });
  }

  const post = await db.blogPost.create({
    data: {
      slug,
      category,
      authorName: authorName || "Dr. Linda Moleon, MD",
      featuredImage: featuredImage?.trim() || null,
      isPublished: !!isPublished,
      publishedAt: isPublished ? new Date() : null,
      translations: {
        create: translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          excerpt: t.excerpt,
          body: t.body,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json({ post }, { status: 201 });
}
