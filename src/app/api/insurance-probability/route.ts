import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const carrier = searchParams.get("carrier");
  const planType = searchParams.get("planType");
  const state = searchParams.get("state");

  if (!carrier || !planType || !state) {
    return NextResponse.json({ probability: 50, notes: "Missing parameters" });
  }

  try {
    // Try exact match first
    const exact = await db.insuranceProbability.findFirst({
      where: { carrier, planType, state },
    });

    if (exact) {
      return NextResponse.json({
        probability: exact.probability,
        notes: exact.notes,
      });
    }

    // Try carrier + state (any plan type)
    const carrierMatch = await db.insuranceProbability.findFirst({
      where: { carrier, state },
    });

    if (carrierMatch) {
      return NextResponse.json({
        probability: carrierMatch.probability,
        notes: "Based on similar plans in your state",
      });
    }

    // No data — return unknown
    return NextResponse.json({
      probability: -1,
      notes: "We don't have enough data for your carrier yet",
    });
  } catch (error) {
    return NextResponse.json({ probability: 50, notes: "Error checking" });
  }
}
