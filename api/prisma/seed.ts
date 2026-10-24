import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";
import type { Prisma } from "../generated/prisma/client";
import config from "../src/config";

const roles = [
  {
    key: "ADMIN",
    name: "Admin",
    overviewPermission: ["VIEW"],
    reviewPermission: ["VIEW", "REVIEW"],
    submissionPermission: ["VIEW", "SUBMIT"],
    teamPermission: ["VIEW", "MANAGE"],
  },
  {
    key: "MENTOR",
    name: "Mentor",
    overviewPermission: ["VIEW"],
    reviewPermission: ["VIEW", "REVIEW"],
    submissionPermission: ["VIEW"],
    teamPermission: [],
  },
  {
    key: "STUDENT",
    name: "Student",
    overviewPermission: [],
    reviewPermission: [],
    submissionPermission: ["SUBMIT"],
    teamPermission: [],
  },
  {
    key: "SUPER_ADMIN",
    name: "Super Admin",
    overviewPermission: ["VIEW"],
    reviewPermission: ["VIEW", "REVIEW"],
    submissionPermission: ["VIEW", "SUBMIT"],
    teamPermission: ["VIEW", "MANAGE"],
  },
] satisfies Prisma.RoleUncheckedCreateInput[];

async function main() {
  const superAdminEmail = config.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!superAdminEmail) {
    throw new Error("Set SUPER_ADMIN_EMAIL in .env before running the seed.");
  }

  for (const role of roles) {
    await prisma.role.upsert({
      where: { key: role.key },
      create: role,
      update: role,
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
    select: { id: true },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { roleKey: "SUPER_ADMIN" },
    });
    console.log(`Assigned SUPER_ADMIN role to ${superAdminEmail}.`);
  } else {
    const name = config.SUPER_ADMIN_NAME?.trim();
    const password = config.SUPER_ADMIN_PASSWORD;

    if (!name || !password) {
      throw new Error(
        "Set SUPER_ADMIN_NAME and SUPER_ADMIN_PASSWORD in .env to create the super admin account.",
      );
    }
    if (password.length < 8 || password.length > 128) {
      throw new Error("SUPER_ADMIN_PASSWORD must be between 8 and 128 characters.");
    }

    const userId = randomUUID();
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        id: userId,
        name,
        email: superAdminEmail,
        emailVerified: true,
        status: "ACTIVE",
        roleKey: "SUPER_ADMIN",
        accounts: {
          create: {
            id: randomUUID(),
            accountId: superAdminEmail,
            providerId: "credential",
            password: hashedPassword,
          },
        },
      },
    });
    console.log(`Created SUPER_ADMIN account for ${superAdminEmail}.`);
  }

  console.log(`Seeded ${roles.length} roles.`);
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed roles:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
