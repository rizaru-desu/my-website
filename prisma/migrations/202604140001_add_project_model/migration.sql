CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ProjectAccent" AS ENUM ('RED', 'BLUE', 'CREAM');

CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "clientOrCompany" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "thumbnailPlaceholder" TEXT NOT NULL,
    "projectUrl" TEXT,
    "githubUrl" TEXT,
    "impactSummary" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "impactBullets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "process" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER,
    "accent" "ProjectAccent" NOT NULL DEFAULT 'RED',
    "challenge" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "gallery" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_slug_key" ON "project"("slug");
CREATE INDEX "project_status_idx" ON "project"("status");
CREATE INDEX "project_featured_idx" ON "project"("featured");
CREATE INDEX "project_sortOrder_idx" ON "project"("sortOrder");
CREATE INDEX "project_status_featured_sortOrder_idx" ON "project"("status", "featured", "sortOrder");
CREATE INDEX "project_updatedAt_idx" ON "project"("updatedAt");
