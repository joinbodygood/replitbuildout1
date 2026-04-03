import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { runEligibilityCheck } from "@/lib/pa/eligibility-service";

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.patientEmail || !body.insurerName || !body.memberId) {
    return NextResponse.json(
      { error: "Required: patientEmail, insurerName, memberId" },
      { status: 400 }
    );
  }

  const result = await runEligibilityCheck(body);
  return NextResponse.json(result);
}
