import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getCase, updateCase, advanceStage, assignCase } from "@/lib/pa/case-service";
import { fireEvent, buildEvent } from "@/lib/pa/webhook-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await getCase(id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.stage) {
    const updated = await advanceStage(id, body.stage, user.id);
    await fireEvent(
      buildEvent("pa.stage_changed", id, updated.patientEmail, updated.patientName, {
        previousStage: body._previousStage,
        newStage: body.stage,
      })
    );
    return NextResponse.json(updated);
  }

  if (body.assignedToId) {
    const updated = await assignCase(id, body.assignedToId, user.id);
    return NextResponse.json(updated);
  }

  const updated = await updateCase(id, body);
  return NextResponse.json(updated);
}
