/*
  Warnings:

  - You are about to drop the column `roleId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_roleId_fkey";

-- DropIndex
DROP INDEX "user_roleId_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "roleId",
ADD COLUMN     "roleKey" TEXT;

-- CreateIndex
CREATE INDEX "user_roleKey_idx" ON "user"("roleKey");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleKey_fkey" FOREIGN KEY ("roleKey") REFERENCES "roles"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
