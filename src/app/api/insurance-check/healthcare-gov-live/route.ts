import { NextRequest, NextResponse } from "next/server";
import { checkCoverage } from "@/lib/insurance/healthcare-gov-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const rxcui = searchParams.get("rxcui");
  const planId = searchParams.get("planId");
  if (!rxcui || !planId) return NextResponse.json({ error: "rxcui and planId required" }, { status: 400 });
  const r = await checkCoverage({ year, rxcui, planId });
  return NextResponse.json({ result: r });
}
