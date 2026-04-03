import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { regenerateLetter } from "@/lib/pa/pa-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subId } = await params;
  const updated = await regenerateLetter(subId);
  return NextResponse.json(updated);
}
