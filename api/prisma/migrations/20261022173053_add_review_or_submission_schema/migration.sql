-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'REVIEWED', 'REJECTED');

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "feedback" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "url" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reviews_reviewerId_reviewedAt_idx" ON "reviews"("reviewerId", "reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_submissionId_reviewerId_key" ON "reviews"("submissionId", "reviewerId");

-- CreateIndex
CREATE INDEX "submissions_userId_submittedAt_idx" ON "submissions"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "submissions_status_submittedAt_idx" ON "submissions"("status", "submittedAt");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
