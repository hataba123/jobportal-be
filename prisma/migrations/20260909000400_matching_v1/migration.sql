ALTER TABLE "CandidateProfile"
  ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER,
  ADD COLUMN IF NOT EXISTS "preferredLocation" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "preferredJobType" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "expectedSalary" DECIMAL(18,2);

ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "minExperienceYears" INTEGER,
  ADD COLUMN IF NOT EXISTS "educationRequirement" VARCHAR(200);

CREATE TABLE IF NOT EXISTS "MatchResult" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "jobPostId" TEXT NOT NULL,
  "totalScore" INTEGER NOT NULL,
  "breakdown" JSONB NOT NULL,
  "matchedSkills" JSONB NOT NULL,
  "missingSkills" JSONB NOT NULL,
  "reasons" JSONB NOT NULL,
  "algorithmVersion" VARCHAR(20) NOT NULL,
  "inputFingerprint" VARCHAR(64) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MatchResult_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MatchResult_jobPostId_fkey"
    FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "MatchResult_candidateId_jobPostId_key"
  ON "MatchResult"("candidateId", "jobPostId");
CREATE INDEX IF NOT EXISTS "MatchResult_jobPostId_totalScore_idx"
  ON "MatchResult"("jobPostId", "totalScore");
CREATE INDEX IF NOT EXISTS "MatchResult_candidateId_totalScore_idx"
  ON "MatchResult"("candidateId", "totalScore");
