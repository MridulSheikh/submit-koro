/*
  Warnings:

  - You are about to drop the column `reviewedAt` on the `reviews` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "reviews_reviewerId_reviewedAt_idx";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "reviewedAt";

-- CreateIndex
CREATE INDEX "reviews_reviewerId_createdAt_idx" ON "reviews"("reviewerId", "createdAt");
