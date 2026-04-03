import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const pages = await db.legalPage.findMany({ orderBy: { slug: "asc" } });
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { slug, title, content } = await req.json();
  if (!slug || !title) return NextResponse.json({ error: "slug and title required" }, { status: 400 });

  const page = await db.legalPage.upsert({
    where: { slug },
    create: { slug, title, content: content ?? "" },
    update: { title, content: content ?? "" },
  });

  return NextResponse.json({ page });
}
