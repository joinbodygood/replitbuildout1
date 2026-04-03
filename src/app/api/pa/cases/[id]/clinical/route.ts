import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { upsertClinical, autoDetectDiagnoses } from "@/lib/pa/clinical-service";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.autoDetect) {
    const detected = autoDetectDiagnoses(body);
    body.diagnoses = [...new Set([...(body.diagnoses ?? []), ...detected])];
  }

  const clinical = await upsertClinical(id, body);
  return NextResponse.json(clinical);
}
