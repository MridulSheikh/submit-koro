/*
  Warnings:

  - You are about to drop the column `content` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `submissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,projectName,liveUrl,repositoryUrl]` on the table `submissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `liveUrl` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `submissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repositoryUrl` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "submissions_status_submittedAt_idx";

-- DropIndex
DROP INDEX "submissions_userId_submittedAt_idx";

-- AlterTable
ALTER TABLE "submissions" DROP COLUMN "content",
DROP COLUMN "submittedAt",
DROP COLUMN "title",
DROP COLUMN "url",
ADD COLUMN     "liveUrl" TEXT NOT NULL,
ADD COLUMN     "projectName" TEXT NOT NULL,
ADD COLUMN     "repositoryUrl" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "submissions_userId_idx" ON "submissions"("userId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE INDEX "submissions_projectName_idx" ON "submissions"("projectName");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_userId_projectName_liveUrl_repositoryUrl_key" ON "submissions"("userId", "projectName", "liveUrl", "repositoryUrl");
