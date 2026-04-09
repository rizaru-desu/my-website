CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "TestimonialRelation" AS ENUM ('CLIENT', 'COLLEAGUE', 'MENTOR', 'OTHER');

CREATE TABLE "testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "relation" "TestimonialRelation" NOT NULL,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "testimonial_status_idx" ON "testimonial"("status");

CREATE INDEX "testimonial_featured_idx" ON "testimonial"("featured");

CREATE INDEX "testimonial_status_featured_idx" ON "testimonial"("status", "featured");

CREATE INDEX "testimonial_createdAt_idx" ON "testimonial"("createdAt");
