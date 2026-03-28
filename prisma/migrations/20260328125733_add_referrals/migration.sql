-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerEmail" TEXT NOT NULL,
    "referrerCode" TEXT NOT NULL,
    "referredEmail" TEXT,
    "referredOrderId" TEXT,
    "creditAmount" INTEGER NOT NULL DEFAULT 2500,
    "referrerCredited" BOOLEAN NOT NULL DEFAULT false,
    "referredCredited" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productSlug" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "photoUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerCode_key" ON "Referral"("referrerCode");

-- CreateIndex
CREATE INDEX "Referral_referrerEmail_idx" ON "Referral"("referrerEmail");

-- CreateIndex
CREATE INDEX "Referral_referrerCode_idx" ON "Referral"("referrerCode");

-- CreateIndex
CREATE INDEX "Review_productSlug_isApproved_idx" ON "Review"("productSlug", "isApproved");

-- CreateIndex
CREATE INDEX "Review_isApproved_createdAt_idx" ON "Review"("isApproved", "createdAt");
