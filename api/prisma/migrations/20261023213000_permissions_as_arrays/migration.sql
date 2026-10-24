ALTER TABLE "roles"
  ALTER COLUMN "overviewPermission" DROP DEFAULT,
  ALTER COLUMN "reviewPermission" DROP DEFAULT,
  ALTER COLUMN "submissionPermission" DROP DEFAULT,
  ALTER COLUMN "teamPermission" DROP DEFAULT;

ALTER TABLE "roles"
  ALTER COLUMN "overviewPermission" TYPE "OverviewPermission"[]
    USING CASE
      WHEN "overviewPermission" = 'NO_ACCESS' THEN ARRAY[]::"OverviewPermission"[]
      ELSE ARRAY["overviewPermission"]
    END,
  ALTER COLUMN "reviewPermission" TYPE "ReviewPermission"[]
    USING CASE
      WHEN "reviewPermission" = 'NO_ACCESS' THEN ARRAY[]::"ReviewPermission"[]
      ELSE ARRAY["reviewPermission"]
    END,
  ALTER COLUMN "submissionPermission" TYPE "SubmissionPermission"[]
    USING CASE
      WHEN "submissionPermission" = 'NO_ACCESS' THEN ARRAY[]::"SubmissionPermission"[]
      ELSE ARRAY["submissionPermission"]
    END,
  ALTER COLUMN "teamPermission" TYPE "TeamPermission"[]
    USING CASE
      WHEN "teamPermission" = 'NO_ACCESS' THEN ARRAY[]::"TeamPermission"[]
      ELSE ARRAY["teamPermission"]
    END;

ALTER TABLE "roles"
  ALTER COLUMN "overviewPermission" SET DEFAULT ARRAY[]::"OverviewPermission"[],
  ALTER COLUMN "reviewPermission" SET DEFAULT ARRAY[]::"ReviewPermission"[],
  ALTER COLUMN "submissionPermission" SET DEFAULT ARRAY[]::"SubmissionPermission"[],
  ALTER COLUMN "teamPermission" SET DEFAULT ARRAY[]::"TeamPermission"[];
