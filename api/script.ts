
import {
  AuthProvider,
  AccountStatus,
  UserRole,
} from "./generated/prisma/client";
import { prisma } from "./lib/prisma";

async function main() {
  const accounts = [
    {
      email: "mridul@example.com",
      name: "Mridul Sheikh",
      username: "mridulsheikh",
      role: UserRole.STUDENT,
      githubUrl: "https://github.com/MridulSheikh",
      providers: [
        {
          provider: AuthProvider.GOOGLE,
          providerAccountId: "google_mridul_001",
        },
        {
          provider: AuthProvider.GITHUB,
          providerAccountId: "github_mridul_001",
        },
      ],
    },
    {
      email: "rahim@example.com",
      name: "Rahim Ahmed",
      username: "rahimdev",
      role: UserRole.REVIEWER,
      githubUrl: "https://github.com/rahimdev",
      providers: [
        {
          provider: AuthProvider.GITHUB,
          providerAccountId: "github_rahim_002",
        },
      ],
    },
    {
      email: "admin@example.com",
      name: "Admin User",
      username: "submitkoro_admin",
      role: UserRole.ADMIN,
      githubUrl: null,
      providers: [],
    },
  ];

  for (const data of accounts) {
    await prisma.account.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        status: AccountStatus.ACTIVE,
        emailVerified: new Date(),
        user: {
          create: {
            name: data.name,
            username: data.username,
            role: data.role,
            githubUrl: data.githubUrl,
          },
        },
        authProviders: {
          create: data.providers,
        },
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
