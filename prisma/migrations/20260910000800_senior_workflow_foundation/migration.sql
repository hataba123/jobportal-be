-- Senior workflow foundation: immutable history/audit, interviews, outbox,
-- optimistic versioning, reports/newsletter and normalized candidate skills.

-- Replace the legacy application enum while preserving existing data.
ALTER TYPE "ApplyStatus" RENAME TO "ApplyStatus_legacy";
CREATE TYPE "ApplyStatus" AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn');
ALTER TABLE "Job"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ApplyStatus"
    USING (CASE "status"::text
      WHEN 'Pending' THEN 'Applied'
      WHEN 'Reviewed' THEN 'Screening'
      WHEN 'Accepted' THEN 'Offer'
      WHEN 'Rejected' THEN 'Rejected'
      ELSE 'Applied'
    END::"ApplyStatus"),
  ALTER COLUMN "status" SET DEFAULT 'Applied';
DROP TYPE "ApplyStatus_legacy";

ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "JobPost" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "ApplicationStatusHistory" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "fromStatus" "ApplyStatus",
  "toStatus" "ApplyStatus" NOT NULL,
  "changedBy" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reason" VARCHAR(1000),
  CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_applicationId_changedAt_idx"
  ON "ApplicationStatusHistory"("applicationId", "changedAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ApplicationStatusHistory_applicationId_fkey') THEN
    ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TYPE IF NOT EXISTS "InterviewType" AS ENUM ('Online', 'Onsite', 'Phone');
CREATE TYPE IF NOT EXISTS "InterviewStatus" AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE IF NOT EXISTS "InterviewResult" AS ENUM ('Pending', 'Passed', 'Failed');

CREATE TABLE IF NOT EXISTS "Interview" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "type" "InterviewType" NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "location" VARCHAR(500),
  "meetingUrl" VARCHAR(500),
  "interviewerId" TEXT NOT NULL,
  "status" "InterviewStatus" NOT NULL DEFAULT 'Scheduled',
  "result" "InterviewResult" NOT NULL DEFAULT 'Pending',
  "notes" VARCHAR(4000),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Interview_interviewerId_startAt_status_idx"
  ON "Interview"("interviewerId", "startAt", "status");
CREATE INDEX IF NOT EXISTS "Interview_applicationId_startAt_idx"
  ON "Interview"("applicationId", "startAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Interview_applicationId_fkey') THEN
    ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Interview_interviewerId_fkey') THEN
    ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey"
      FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(100) NOT NULL,
  "entityId" VARCHAR(100) NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "ipAddress" VARCHAR(64),
  "correlationId" VARCHAR(64),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_actorId_fkey') THEN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "OutboxMessage" (
  "id" TEXT NOT NULL,
  "type" VARCHAR(100) NOT NULL,
  "payload" JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3),
  "lastError" VARCHAR(2000),
  "deadLetteredAt" TIMESTAMP(3),
  "deduplicationKey" VARCHAR(200),
  "correlationId" VARCHAR(64),
  CONSTRAINT "OutboxMessage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "OutboxMessage_deduplicationKey_key" ON "OutboxMessage"("deduplicationKey");
CREATE INDEX IF NOT EXISTS "OutboxMessage_processedAt_nextAttemptAt_occurredAt_idx" ON "OutboxMessage"("processedAt", "nextAttemptAt", "occurredAt");

CREATE TYPE IF NOT EXISTS "JobReportStatus" AS ENUM ('Pending', 'Resolved', 'Dismissed');
CREATE TABLE IF NOT EXISTS "JobReport" (
  "id" TEXT NOT NULL,
  "jobPostId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" VARCHAR(200) NOT NULL,
  "description" VARCHAR(2000),
  "status" "JobReportStatus" NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "resolvedBy" TEXT,
  "version" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "JobReport_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "JobReport_status_createdAt_idx" ON "JobReport"("status", "createdAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JobReport_jobPostId_fkey') THEN
    ALTER TABLE "JobReport" ADD CONSTRAINT "JobReport_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'JobReport_reporterId_fkey') THEN
    ALTER TABLE "JobReport" ADD CONSTRAINT "JobReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribedAt" TIMESTAMP(3),
  CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscription_email_isActive_key" ON "NewsletterSubscription"("email", "isActive");
CREATE INDEX IF NOT EXISTS "NewsletterSubscription_isActive_subscribedAt_idx" ON "NewsletterSubscription"("isActive", "subscribedAt");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'NewsletterSubscription_userId_fkey') THEN
    ALTER TABLE "NewsletterSubscription" ADD CONSTRAINT "NewsletterSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "sourceMessageId" VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_sourceMessageId_userId_key" ON "Notification"("sourceMessageId", "userId");

CREATE TABLE IF NOT EXISTS "CandidateSkill" (
  "id" TEXT NOT NULL,
  "candidateProfileId" TEXT NOT NULL,
  "normalizedName" VARCHAR(100) NOT NULL,
  "displayName" VARCHAR(100) NOT NULL,
  CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CandidateSkill_candidateProfileId_normalizedName_key" ON "CandidateSkill"("candidateProfileId", "normalizedName");
CREATE INDEX IF NOT EXISTS "CandidateSkill_normalizedName_candidateProfileId_idx" ON "CandidateSkill"("normalizedName", "candidateProfileId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CandidateSkill_candidateProfileId_fkey') THEN
    ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Deterministic IDs make this backfill safe to re-run on a restored copy.
INSERT INTO "CandidateSkill" ("id", "candidateProfileId", "normalizedName", "displayName")
SELECT md5(cp."id" || ':' || trim(skill))::uuid::text, cp."id", upper(trim(skill)), trim(skill)
FROM "CandidateProfile" cp
CROSS JOIN LATERAL regexp_split_to_table(COALESCE(cp."skills", ''), ',') AS skill
WHERE trim(skill) <> ''
ON CONFLICT ("candidateProfileId", "normalizedName") DO NOTHING;
