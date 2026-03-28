import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
