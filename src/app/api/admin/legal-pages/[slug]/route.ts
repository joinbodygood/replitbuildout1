import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await db.legalPage.findUnique({ where: { slug } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  const { slug } = await params;
  const { title, content } = await req.json();

  const page = await db.legalPage.upsert({
    where: { slug },
    create: { slug, title: title ?? slug, content: content ?? "" },
    update: { title: title ?? undefined, content: content ?? "" },
  });

  return NextResponse.json({ page });
}
