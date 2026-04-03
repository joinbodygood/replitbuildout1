import { db as prisma } from "@/lib/db";
import { addNote } from "./case-service";

const ASSIGNABLE_ROLES = ["clinical_admin", "support"];

export async function autoAssign(caseId: string) {
  const admins = await prisma.adminUser.findMany({
    where: { role: { in: ASSIGNABLE_ROLES }, isActive: true },
    include: {
      _count: {
        select: {
          assignedCases: {
            where: { stage: { not: { startsWith: "closed" } } },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (admins.length === 0) return null;

  const sorted = admins.sort(
    (a, b) => a._count.assignedCases - b._count.assignedCases
  );
  const chosen = sorted[0];

  const updated = await prisma.insuranceCase.update({
    where: { id: caseId },
    data: { assignedToId: chosen.id },
  });

  await addNote(
    caseId,
    null,
    `Auto-assigned to ${chosen.name}`,
    "assignment_change",
    { assignedToId: chosen.id, method: "auto" }
  );

  return updated;
}

export async function reassign(
  caseId: string,
  newAdminId: string,
  reassignedById: string
) {
  const updated = await prisma.insuranceCase.update({
    where: { id: caseId },
    data: { assignedToId: newAdminId },
  });

  const admin = await prisma.adminUser.findUnique({
    where: { id: newAdminId },
    select: { name: true },
  });

  await addNote(
    caseId,
    reassignedById,
    `Reassigned to ${admin?.name ?? newAdminId}`,
    "assignment_change",
    { assignedToId: newAdminId, method: "manual" }
  );

  return updated;
}

export async function getWorkload() {
  const admins = await prisma.adminUser.findMany({
    where: { role: { in: ASSIGNABLE_ROLES }, isActive: true },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          assignedCases: {
            where: { stage: { not: { startsWith: "closed" } } },
          },
        },
      },
    },
  });

  return admins.map((a) => ({
    adminId: a.id,
    name: a.name,
    activeCases: a._count.assignedCases,
  }));
}
