/**
 * Admin user seeder
 * Run: npx ts-node prisma/seed-admin.ts
 *
 * This creates or updates admin users. Passwords are hashed with bcrypt.
 * Change the password values before running in production.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminUsers = [
  {
    email: "linda@bodygoodstudio.com",
    name: "Dr. Linda Moleon, MD",
    role: "super_admin",
    password: "ChangeMe2024!",
  },
  {
    email: "ayush@bodygoodstudio.com",
    name: "Ayush",
    role: "developer",
    password: "ChangeMe2024!",
  },
];

async function main() {
  for (const u of adminUsers) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.adminUser.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash },
    });
    console.log(`✓ Admin user upserted: ${u.email} (${u.role})`);
  }
  console.log("\n⚠️  IMPORTANT: Change all passwords immediately after first login.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
