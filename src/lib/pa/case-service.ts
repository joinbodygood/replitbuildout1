import { db as prisma } from "@/lib/db";
import type {
  CreateCaseInput,
  UpdateCaseInput,
  CaseFilters,
  CaseWithRelations,
  InsuranceCaseSummary,
  PaginatedResult,
} from "./types";

export async function createCase(data: CreateCaseInput) {
  const existing = await prisma.insuranceCase.findFirst({
    where: { patientEmail: data.patientEmail, stage: { not: { startsWith: "closed" } } },
  });
  if (existing) return existing;

  return prisma.insuranceCase.create({
    data: {
      patientEmail: data.patientEmail,
      patientName: data.patientName,
      patientDob: data.patientDob,
      patientPhone: data.patientPhone,
      patientState: data.patientState,
      carrierId: data.carrierId,
      carrierName: data.carrierName,
      memberId: data.memberId,
      groupNumber: data.groupNumber,
      planName: data.planName,
      planType: data.planType,
      subscriberName: data.subscriberName,
      subscriberDob: data.subscriberDob,
      subscriberRelation: data.subscriberRelation,
      insuranceCardFrontUrl: data.insuranceCardFrontUrl,
      insuranceCardBackUrl: data.insuranceCardBackUrl,
      idCardFrontUrl: data.idCardFrontUrl,
      idCardBackUrl: data.idCardBackUrl,
      probabilityScore: data.probabilityScore,
      probabilityBucket: data.probabilityBucket,
      qualifiedAt: data.probabilityScore && data.probabilityScore >= 65 ? new Date() : undefined,
      eligibilityData: data.eligibilityData ? (data.eligibilityData as object) : undefined,
      eligibilityCheckedAt: data.eligibilityData ? new Date() : undefined,
      orderId: data.orderId,
      quizLeadId: data.quizLeadId,
      stage: data.stage ?? "probability",
    },
  });
}

export async function getCase(id: string): Promise<CaseWithRelations | null> {
  return prisma.insuranceCase.findUnique({
    where: { id },
    include: {
      submissions: { orderBy: { createdAt: "asc" } },
      clinicalData: true,
      notes: { orderBy: { createdAt: "desc" } },
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function listCases(
  filters: CaseFilters
): Promise<PaginatedResult<InsuranceCaseSummary>> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const where: Record<string, unknown> = {};
  if (filters.stage) where.stage = filters.stage;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.search) {
    where.OR = [
      { patientEmail: { contains: filters.search, mode: "insensitive" } },
      { patientName: { contains: filters.search, mode: "insensitive" } },
      { carrierName: { contains: filters.search, mode: "insensitive" } },
      { memberId: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.insuranceCase.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { submissions: true } },
      },
    }),
    prisma.insuranceCase.count({ where }),
  ]);

  return { data: data as InsuranceCaseSummary[], total, page, limit };
}

export async function updateCase(id: string, data: UpdateCaseInput) {
  return prisma.insuranceCase.update({ where: { id }, data });
}

export async function advanceStage(
  id: string,
  newStage: string,
  adminId: string
) {
  const existing = await prisma.insuranceCase.findUnique({ where: { id } });
  if (!existing) throw new Error("Case not found");

  const previousStage = existing.stage;

  const updateData: Record<string, unknown> = { stage: newStage };
  if (newStage === "closed_approved") updateData.approvedAt = new Date();
  if (newStage.startsWith("closed")) updateData.closedAt = new Date();

  const [updated] = await Promise.all([
    prisma.insuranceCase.update({ where: { id }, data: updateData }),
    prisma.caseNote.create({
      data: {
        caseId: id,
        authorId: adminId,
        content: `Stage changed from "${previousStage}" to "${newStage}"`,
        type: "stage_change",
        metadata: { previousStage, newStage },
      },
    }),
  ]);

  return updated;
}

export async function assignCase(
  id: string,
  assignToId: string,
  assignedById: string
) {
  const [updated] = await Promise.all([
    prisma.insuranceCase.update({
      where: { id },
      data: { assignedToId: assignToId },
    }),
    prisma.caseNote.create({
      data: {
        caseId: id,
        authorId: assignedById,
        content: `Case assigned to admin ${assignToId}`,
        type: "assignment_change",
        metadata: { assignedToId: assignToId },
      },
    }),
  ]);
  return updated;
}

export async function addNote(
  caseId: string,
  authorId: string | null,
  content: string,
  type: string = "note",
  metadata?: Record<string, unknown>
) {
  return prisma.caseNote.create({
    data: { caseId, authorId, content, type, metadata: metadata ?? undefined },
  });
}

export async function getNotes(caseId: string, page = 1, limit = 50) {
  const [data, total] = await Promise.all([
    prisma.caseNote.findMany({
      where: { caseId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.caseNote.count({ where: { caseId } }),
  ]);
  return { data, total, page, limit };
}

export async function getCaseByStatusToken(token: string) {
  return prisma.insuranceCase.findUnique({
    where: { statusToken: token },
    include: {
      submissions: {
        select: { drug: true, status: true, round: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function findCaseByEmail(email: string) {
  return prisma.insuranceCase.findFirst({
    where: { patientEmail: email, stage: { not: { startsWith: "closed" } } },
    orderBy: { createdAt: "desc" },
  });
}
