CREATE TYPE "BlogCommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SPAM');

CREATE TABLE "blogComment" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "parentId" TEXT,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "BlogCommentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "ipHash" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "blogComment_blogPostId_idx" ON "blogComment"("blogPostId");
CREATE INDEX "blogComment_blogPostId_status_createdAt_idx" ON "blogComment"("blogPostId", "status", "createdAt");
CREATE INDEX "blogComment_blogPostId_parentId_status_createdAt_idx" ON "blogComment"("blogPostId", "parentId", "status", "createdAt");
CREATE INDEX "blogComment_parentId_idx" ON "blogComment"("parentId");
CREATE INDEX "blogComment_status_idx" ON "blogComment"("status");
CREATE INDEX "blogComment_reviewedByUserId_idx" ON "blogComment"("reviewedByUserId");
CREATE INDEX "blogComment_fingerprint_idx" ON "blogComment"("fingerprint");
CREATE INDEX "blogComment_ipHash_createdAt_idx" ON "blogComment"("ipHash", "createdAt");

ALTER TABLE "blogComment"
ADD CONSTRAINT "blogComment_blogPostId_fkey"
FOREIGN KEY ("blogPostId") REFERENCES "blogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blogComment"
ADD CONSTRAINT "blogComment_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "blogComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blogComment"
ADD CONSTRAINT "blogComment_reviewedByUserId_fkey"
FOREIGN KEY ("reviewedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
