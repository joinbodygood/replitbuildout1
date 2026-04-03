import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db as prisma } from "@/lib/db";
import { addNote } from "@/lib/pa/case-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submissions = await prisma.pASubmission.findMany({
    where: { caseId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const submission = await prisma.pASubmission.create({
    data: {
      caseId: id,
      drug: body.drug,
      round: body.round,
      indication: body.indication,
      status: "drafted",
      letterText: body.letterText ?? null,
    },
  });

  await addNote(id, user.id, `Submission created: ${body.drug} (round ${body.round})`, "letter_generated");

  return NextResponse.json(submission, { status: 201 });
}
