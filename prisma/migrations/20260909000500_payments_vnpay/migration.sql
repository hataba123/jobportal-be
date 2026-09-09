DO $$
BEGIN
  CREATE TYPE "PaymentOrderStatus" AS ENUM ('Pending', 'Paid', 'Failed', 'Expired', 'Refunded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "CreditType" AS ENUM ('JobPost', 'FeaturedJob', 'MatchUnlock');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "ServicePlan" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "price" DECIMAL(18,2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServicePlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlanEntitlement" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "creditType" "CreditType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "expiresInDays" INTEGER,
  CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PlanEntitlement_planId_creditType_key"
  ON "PlanEntitlement"("planId", "creditType");

CREATE TABLE IF NOT EXISTS "PaymentOrder" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "vnpTxnRef" VARCHAR(64) NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
  "status" "PaymentOrderStatus" NOT NULL DEFAULT 'Pending',
  "providerResponseCode" VARCHAR(10),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentOrder_vnpTxnRef_key"
  ON "PaymentOrder"("vnpTxnRef");
CREATE INDEX IF NOT EXISTS "PaymentOrder_userId_createdAt_idx"
  ON "PaymentOrder"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "PaymentOrder_status_expiresAt_idx"
  ON "PaymentOrder"("status", "expiresAt");

CREATE TABLE IF NOT EXISTS "CreditLedger" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentOrderId" TEXT,
  "creditType" "CreditType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditLedger_paymentOrderId_creditType_key"
  ON "CreditLedger"("paymentOrderId", "creditType");
CREATE INDEX IF NOT EXISTS "CreditLedger_userId_creditType_expiresAt_idx"
  ON "CreditLedger"("userId", "creditType", "expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PlanEntitlement_planId_fkey'
  ) THEN
    ALTER TABLE "PlanEntitlement"
      ADD CONSTRAINT "PlanEntitlement_planId_fkey"
      FOREIGN KEY ("planId") REFERENCES "ServicePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PaymentOrder_userId_fkey'
  ) THEN
    ALTER TABLE "PaymentOrder"
      ADD CONSTRAINT "PaymentOrder_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PaymentOrder_planId_fkey'
  ) THEN
    ALTER TABLE "PaymentOrder"
      ADD CONSTRAINT "PaymentOrder_planId_fkey"
      FOREIGN KEY ("planId") REFERENCES "ServicePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CreditLedger_userId_fkey'
  ) THEN
    ALTER TABLE "CreditLedger"
      ADD CONSTRAINT "CreditLedger_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CreditLedger_paymentOrderId_fkey'
  ) THEN
    ALTER TABLE "CreditLedger"
      ADD CONSTRAINT "CreditLedger_paymentOrderId_fkey"
      FOREIGN KEY ("paymentOrderId") REFERENCES "PaymentOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
