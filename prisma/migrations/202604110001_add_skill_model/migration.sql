CREATE TABLE "skill" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "skill_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "skill_category_idx" ON "skill"("category");
CREATE INDEX "skill_featured_idx" ON "skill"("featured");
CREATE INDEX "skill_category_featured_idx" ON "skill"("category", "featured");
