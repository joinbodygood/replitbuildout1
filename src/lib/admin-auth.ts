import { cookies } from "next/headers";
import { db as prisma } from "@/lib/db";
import { cache } from "react";

export const ADMIN_COOKIE = "bg_admin_session";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

export type AdminRole =
  | "super_admin"
  | "clinical_admin"
  | "provider"
  | "support"
  | "marketing"
  | "developer";

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  clinical_admin: "Clinical Admin",
  provider: "Provider",
  support: "Support Agent",
  marketing: "Marketing",
  developer: "Developer",
};

export const PERMISSIONS: Record<string, string[]> = {
  super_admin: ["*"],
  clinical_admin: ["patients", "orders", "dashboard", "messaging", "discounts"],
  provider: ["patients.read", "messaging"],
  support: ["orders", "patients.read", "messaging", "dashboard"],
  marketing: ["content", "discounts", "analytics.read", "dashboard"],
  developer: ["*"],
};

export function hasPermission(role: string, resource: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  if (perms.includes("*")) return true;
  if (perms.includes(resource)) return true;
  const prefix = resource.split(".")[0];
  if (perms.includes(prefix)) return true;
  return false;
}

export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await prisma.adminSession.delete({ where: { id: session.id } });
      return null;
    }
    if (!session.admin.isActive) return null;

    return {
      id: session.admin.id,
      email: session.admin.email,
      name: session.admin.name,
      role: session.admin.role,
      isActive: session.admin.isActive,
    };
  } catch {
    return null;
  }
});
