CREATE TABLE "VisitorLog" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'direct',
    "referrerSource" TEXT NOT NULL DEFAULT 'direct',
    "userAgent" TEXT NOT NULL,
    "isUniqueDailyVisitor" BOOLEAN NOT NULL DEFAULT false,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitorLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VisitorLog_visitedAt_idx" ON "VisitorLog"("visitedAt");
CREATE INDEX "VisitorLog_path_visitedAt_idx" ON "VisitorLog"("path", "visitedAt");
CREATE INDEX "VisitorLog_referrerSource_visitedAt_idx" ON "VisitorLog"("referrerSource", "visitedAt");
CREATE INDEX "VisitorLog_visitorId_visitedAt_idx" ON "VisitorLog"("visitorId", "visitedAt");
