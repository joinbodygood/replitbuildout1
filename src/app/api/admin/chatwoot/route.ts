import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenConversationCount } from "@/lib/chatwoot";

export async function GET() {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const openCount = await getOpenConversationCount();
  return NextResponse.json({ openCount });
}
