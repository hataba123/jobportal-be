-- Trạng thái xác minh công ty để admin kiểm duyệt trước khi hiển thị công khai.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CompanyVerificationStatus') THEN
    CREATE TYPE "CompanyVerificationStatus" AS ENUM ('Pending', 'Verified', 'Rejected');
  END IF;
END $$;

ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "verificationStatus" "CompanyVerificationStatus" NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- Các công ty hiện hữu đã được sử dụng trong dữ liệu công khai, giữ tương thích khi nâng cấp.
UPDATE "Company"
SET "verificationStatus" = 'Verified', "verifiedAt" = COALESCE("verifiedAt", NOW())
WHERE "verificationStatus" = 'Pending';

CREATE INDEX IF NOT EXISTS "Company_verificationStatus_idx"
  ON "Company"("verificationStatus");
