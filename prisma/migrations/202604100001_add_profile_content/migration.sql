CREATE TABLE "profileContent" (
  "id" TEXT NOT NULL,
  "storageKey" TEXT NOT NULL DEFAULT 'primary',
  "fullName" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "shortIntro" TEXT NOT NULL,
  "about" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "availability" TEXT NOT NULL,
  "primaryCta" TEXT NOT NULL,
  "socialLinks" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "profileContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profileContent_storageKey_key" ON "profileContent"("storageKey");
