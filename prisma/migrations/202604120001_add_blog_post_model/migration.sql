-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "blogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL,
    "category" TEXT NOT NULL,
    "coverImagePlaceholder" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishDate" TIMESTAMP(3),
    "readingTime" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "authorName" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogPost_slug_key" ON "blogPost"("slug");

-- CreateIndex
CREATE INDEX "blogPost_status_idx" ON "blogPost"("status");

-- CreateIndex
CREATE INDEX "blogPost_featured_idx" ON "blogPost"("featured");

-- CreateIndex
CREATE INDEX "blogPost_publishDate_idx" ON "blogPost"("publishDate");

-- CreateIndex
CREATE INDEX "blogPost_authorUserId_idx" ON "blogPost"("authorUserId");

-- CreateIndex
CREATE INDEX "blogPost_status_featured_publishDate_idx" ON "blogPost"("status", "featured", "publishDate");

-- AddForeignKey
ALTER TABLE "blogPost" ADD CONSTRAINT "blogPost_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
