CREATE TABLE "cvDownloadLog" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'direct',
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cvDownloadLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cvDownloadLog_downloadedAt_idx" ON "cvDownloadLog"("downloadedAt");

CREATE INDEX "cvDownloadLog_ipHash_downloadedAt_idx" ON "cvDownloadLog"("ipHash", "downloadedAt");
