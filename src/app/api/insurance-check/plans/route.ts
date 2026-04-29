import { NextRequest, NextResponse } from "next/server";
import { searchPlansForAutocomplete } from "@/lib/insurance/coverage-index";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const carrierKey = searchParams.get("carrier");
  const state = searchParams.get("state");
  const query = searchParams.get("q") ?? "";
  if (!carrierKey || !state || query.length < 2) return NextResponse.json({ plans: [] });
  const rows = await searchPlansForAutocomplete({ carrierKey, state, query });
  return NextResponse.json({
    plans: rows.map(p => ({ planId: p.planId, planName: p.planName, metalLevel: p.metalLevel }))
  });
}
