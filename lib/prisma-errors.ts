import { Prisma } from "@prisma/client";

function isMissingRelationError(error: unknown, relationName: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2021";
  }

  return (
    error instanceof Error &&
    new RegExp(
      `42P01|relation .*${relationName}.* does not exist|table .*${relationName}.* does not exist`,
      "i",
    ).test(error.message)
  );
}

export function isMissingMessageTableError(error: unknown) {
  return isMissingRelationError(error, "message");
}

export function isMissingTestimonialTableError(error: unknown) {
  return isMissingRelationError(error, "testimonial");
}

export function isMissingCvDownloadLogTableError(error: unknown) {
  return isMissingRelationError(error, "cvDownloadLog");
}

export function isMissingResumeAssetTableError(error: unknown) {
  return isMissingRelationError(error, "resumeAsset");
}

export function isMissingProfileContentTableError(error: unknown) {
  return isMissingRelationError(error, "profileContent");
}

export function isMissingSkillTableError(error: unknown) {
  return isMissingRelationError(error, "skill");
}

export function isMissingProjectTableError(error: unknown) {
  return isMissingRelationError(error, "project");
}

export function isMissingBlogPostTableError(error: unknown) {
  return isMissingRelationError(error, "blogPost");
}

export function isMissingBlogCommentTableError(error: unknown) {
  return isMissingRelationError(error, "blogComment");
}

export function isPrismaConnectionError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  ) {
    return true;
  }

  return (
    error instanceof Error &&
    /can't reach database server|connection refused|schema engine error|connect|localhost:5432/i.test(
      error.message,
    )
  );
}
