import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminUser, hasPermission } from "@/lib/admin-auth";

const VALID_CATEGORIES = [
  "glp1-education",
  "weight-loss-tips",
  "insurance-guides",
  "patient-stories",
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await db.blogPost.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(user.role, "content")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};

  if (typeof body.slug === "string") {
    if (!/^[a-z0-9-]+$/.test(body.slug)) {
      return NextResponse.json({ error: "slug must be lowercase letters, numbers, hyphens" }, { status: 400 });
    }
    if (body.slug !== existing.slug) {
      const clash = await db.blogPost.findUnique({ where: { slug: body.slug } });
      if (clash) return NextResponse.json({ error: "slug already in use" }, { status: 409 });
      data.slug = body.slug;
    }
  }
  if (typeof body.category === "string") {
    if (!VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
    }
    data.category = body.category;
  }
  if (typeof body.authorName === "string") data.authorName = body.authorName;

  if ("featuredImage" in body) {
    if (body.featuredImage === null || body.featuredImage === "") {
      data.featuredImage = null;
    } else if (typeof body.featuredImage === "string") {
      data.featuredImage = body.featuredImage.trim();
    }
  }

  if (typeof body.isPublished === "boolean") {
    data.isPublished = body.isPublished;
    if (body.isPublished && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    if (!body.isPublished) {
      // keep publishedAt history; do not overwrite
    }
  }

  if (Array.isArray(body.translations)) {
    for (const t of body.translations) {
      if (!t.locale || !t.title || !t.excerpt || !t.body) {
        return NextResponse.json({ error: "each translation needs locale, title, excerpt, body" }, { status: 400 });
      }
      await db.blogPostTranslation.upsert({
        where: { postId_locale: { postId: id, locale: t.locale } },
        update: {
          title: t.title,
          excerpt: t.excerpt,
          body: t.body,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        },
        create: {
          postId: id,
          locale: t.locale,
          title: t.title,
          excerpt: t.excerpt,
          body: t.body,
          seoTitle: t.seoTitle || null,
          seoDescription: t.seoDescription || null,
        },
      });
    }
  }

  const post = await db.blogPost.update({
    where: { id },
    data,
    include: { translations: true },
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(user.role, "content") && user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.blogPost.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
