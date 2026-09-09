DO $$
BEGIN
  CREATE TYPE "JobPostStatus" AS ENUM ('Draft', 'PendingApproval', 'Active', 'Closed', 'Expired', 'Rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "status" "JobPostStatus" NOT NULL DEFAULT 'Active';

CREATE INDEX IF NOT EXISTS "JobPost_status_expiresAt_idx"
  ON "JobPost"("status", "expiresAt");
