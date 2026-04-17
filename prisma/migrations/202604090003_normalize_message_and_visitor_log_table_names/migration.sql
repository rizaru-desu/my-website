ALTER TABLE IF EXISTS "Message" RENAME TO "message";
ALTER TABLE IF EXISTS "VisitorLog" RENAME TO "visitorLog";

ALTER INDEX IF EXISTS "Message_pkey" RENAME TO "message_pkey";
ALTER INDEX IF EXISTS "Message_status_idx" RENAME TO "message_status_idx";
ALTER INDEX IF EXISTS "Message_createdAt_idx" RENAME TO "message_createdAt_idx";
ALTER INDEX IF EXISTS "Message_status_createdAt_idx" RENAME TO "message_status_createdAt_idx";

ALTER INDEX IF EXISTS "VisitorLog_pkey" RENAME TO "visitorLog_pkey";
ALTER INDEX IF EXISTS "VisitorLog_visitedAt_idx" RENAME TO "visitorLog_visitedAt_idx";
ALTER INDEX IF EXISTS "VisitorLog_path_visitedAt_idx" RENAME TO "visitorLog_path_visitedAt_idx";
ALTER INDEX IF EXISTS "VisitorLog_referrerSource_visitedAt_idx" RENAME TO "visitorLog_referrerSource_visitedAt_idx";
ALTER INDEX IF EXISTS "VisitorLog_visitorId_visitedAt_idx" RENAME TO "visitorLog_visitorId_visitedAt_idx";
