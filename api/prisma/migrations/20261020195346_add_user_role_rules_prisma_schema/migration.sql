/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OverviewPermission" AS ENUM ('NO_ACCESS', 'VIEW');

-- CreateEnum
CREATE TYPE "ReviewPermission" AS ENUM ('NO_ACCESS', 'VIEW', 'REVIEW');

-- CreateEnum
CREATE TYPE "SubmissionPermission" AS ENUM ('NO_ACCESS', 'VIEW', 'SUBMIT');

-- CreateEnum
CREATE TYPE "TeamPermission" AS ENUM ('NO_ACCESS', 'VIEW', 'MANAGE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "overviewPermission" "OverviewPermission" NOT NULL DEFAULT 'NO_ACCESS',
    "reviewPermission" "ReviewPermission" NOT NULL DEFAULT 'NO_ACCESS',
    "submissionPermission" "SubmissionPermission" NOT NULL DEFAULT 'NO_ACCESS',
    "teamPermission" "TeamPermission" NOT NULL DEFAULT 'NO_ACCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
