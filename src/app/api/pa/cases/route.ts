import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createCase, listCases } from "@/lib/pa/case-service";
import { autoAssign } from "@/lib/pa/assignment-service";
import { fireEvent, buildEvent } from "@/lib/pa/webhook-service";

export async function GET(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const result = await listCases({
    stage: searchParams.get("stage") ?? undefined,
    assignedToId: searchParams.get("assignedTo") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    page: parseInt(searchParams.get("page") ?? "1"),
    limit: parseInt(searchParams.get("limit") ?? "20"),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const insuranceCase = await createCase(body);
  await autoAssign(insuranceCase.id);

  await fireEvent(
    buildEvent("pa.case_created", insuranceCase.id, insuranceCase.patientEmail, insuranceCase.patientName, {
      stage: insuranceCase.stage,
    })
  );

  return NextResponse.json(insuranceCase, { status: 201 });
}
