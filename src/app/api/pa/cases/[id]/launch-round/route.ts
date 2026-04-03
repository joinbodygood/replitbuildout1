import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { launchRound } from "@/lib/pa/pa-engine";
import { fireEvent, buildEvent } from "@/lib/pa/webhook-service";
import { db as prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const round = body.round as number;

  if (!round || round < 1 || round > 5) {
    return NextResponse.json({ error: "Round must be 1-5" }, { status: 400 });
  }

  const result = await launchRound(id, round, user.id);

  const caseData = await prisma.insuranceCase.findUnique({ where: { id } });
  if (caseData) {
    await fireEvent(
      buildEvent("pa.round_launched", id, caseData.patientEmail, caseData.patientName, {
        round,
        submissions: result.submissions.length,
      })
    );
  }

  return NextResponse.json(result, { status: 201 });
}
