-- Giữ lại lịch sử người dùng, công ty và tin tuyển dụng thay vì xóa vật lý.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx"
  ON "User"("deletedAt");

CREATE INDEX IF NOT EXISTS "Company_deletedAt_idx"
  ON "Company"("deletedAt");

CREATE INDEX IF NOT EXISTS "JobPost_deletedAt_idx"
  ON "JobPost"("deletedAt");
