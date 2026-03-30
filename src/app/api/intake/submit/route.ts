import { NextRequest, NextResponse } from "next/server";
import { fireWebhook } from "@/lib/webhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await fireWebhook("intake.submitted", body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
