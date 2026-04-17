CREATE TABLE "resumeAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL DEFAULT 'primary',
    "downloadUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSizeBytes" INTEGER,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumeAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "resumeAsset_storageKey_key" ON "resumeAsset"("storageKey");
