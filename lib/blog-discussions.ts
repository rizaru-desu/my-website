import "server-only";

import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import type { BlogPermissionSet } from "@/lib/blog.shared";
import {
  buildPublicBlogCommentTree,
  type AdminBlogCommentRecord,
  type BlogCommentActionResult,
  type BlogCommentModerationAction,
  type PublicBlogCommentInput,
  type PublicBlogCommentRecord,
} from "@/lib/blog-discussions.shared";
import {
  isMissingBlogCommentTableError,
  isMissingBlogPostTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { expireRedisKey, hasRedisConfig, incrementRedisKey } from "@/lib/redis";

const BOT_USER_AGENT_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|wget|curl|python|scrapy|headlesschrome|rendertron|facebookexternalhit|linkedinbot|whatsapp/i;

const COMMENT_COOLDOWN_WINDOW_SECONDS = 30;
const COMMENT_COOLDOWN_MAX_SUBMISSIONS = 1;
const COMMENT_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const COMMENT_RATE_LIMIT_MAX_SUBMISSIONS = 5;
const COMMENT_DUPLICATE_WINDOW_MS = 60 * 60 * 1000;

type AdminBlogDiscussionContext = {
  currentUserId: string;
  currentUserName: string;
  permissions: BlogPermissionSet;
};

type StoredPublicBlogPost = {
  id: string;
  slug: string;
  status: "ARCHIVED" | "DRAFT" | "PUBLISHED";
  title: string;
};

type StoredBlogComment = {
  blogPost: {
    id: string;
    slug: string;
    title: string;
  };
  blogPostId: string;
  body: string;
  createdAt: Date;
  displayName: string;
  email: string;
  fingerprint: string;
  id: string;
  ipHash: string;
  parent: {
    displayName: string;
    id: string;
  } | null;
  parentId: string | null;
  reviewedAt: Date | null;
  reviewedByUser: {
    name: string | null;
  } | null;
  reviewedByUserId: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED" | "SPAM";
  updatedAt: Date;
};

export class AdminBlogDiscussionAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminBlogDiscussionAccessError";
    this.status = status;
  }
}

export class BlogCommentStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogCommentStorageError";
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getCommentHashSalt() {
  return (
    process.env.COMMENT_HASH_SALT?.trim() ||
    process.env.ANALYTICS_HASH_SALT?.trim() ||
    "local-blog-comment-salt"
  );
}

function hashCommentValue(value: string) {
  return createHash("sha256")
    .update(`${getCommentHashSalt()}:${value}`)
    .digest("hex");
}

function normalizeCommentBody(value: string) {
  return value
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function buildCommentFingerprint(email: string, body: string) {
  return hashCommentValue(`${email.toLowerCase().trim()}::${normalizeCommentBody(body)}`);
}

function resolveClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("fly-client-ip") ||
    "unknown"
  );
}

function getClientIpHash(requestHeaders: Headers) {
  return hashCommentValue(resolveClientIp(requestHeaders));
}

function getUserAgent(requestHeaders: Headers) {
  return requestHeaders.get("user-agent")?.trim() ?? "";
}

function isBotLikeRequest(requestHeaders: Headers) {
  return BOT_USER_AGENT_PATTERN.test(getUserAgent(requestHeaders));
}

async function enforceSubmissionRateLimit(requestHeaders: Headers) {
  if (!hasRedisConfig()) {
    return null;
  }

  const ipHash = getClientIpHash(requestHeaders);
  const cooldownBucket = Math.floor(Date.now() / (COMMENT_COOLDOWN_WINDOW_SECONDS * 1000));
  const cooldownKey = `blog-comment:cooldown:${ipHash}:${cooldownBucket}`;
  const hourKey = `blog-comment:hour:${ipHash}`;

  const cooldownCount = Number(await incrementRedisKey(cooldownKey));

  if (cooldownCount === 1) {
    await expireRedisKey(cooldownKey, COMMENT_COOLDOWN_WINDOW_SECONDS + 1);
  }

  if (cooldownCount > COMMENT_COOLDOWN_MAX_SUBMISSIONS) {
    return {
      message: "Please wait a moment before sending another comment.",
      ok: false,
    } satisfies BlogCommentActionResult;
  }

  const hourlyCount = Number(await incrementRedisKey(hourKey));

  if (hourlyCount === 1) {
    await expireRedisKey(hourKey, COMMENT_RATE_LIMIT_WINDOW_SECONDS);
  }

  if (hourlyCount > COMMENT_RATE_LIMIT_MAX_SUBMISSIONS) {
    return {
      message:
        "Too many comment submissions came from this connection. Please try again later.",
      ok: false,
    } satisfies BlogCommentActionResult;
  }

  return null;
}

function getBlogCommentStorageMessage(error: unknown) {
  if (isMissingBlogCommentTableError(error) || isMissingBlogPostTableError(error)) {
    return "Comment storage is not ready yet. Start the database and run `npx prisma db push` first.";
  }

  if (isPrismaConnectionError(error)) {
    return "The database is not reachable right now. Make sure PostgreSQL is running, then try again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The blog discussion could not be updated right now.";
}

function getNextCommentStatus(
  currentStatus: StoredBlogComment["status"],
  action: BlogCommentModerationAction,
) {
  if (action === "approve") {
    if (currentStatus === "APPROVED") {
      throw new Error("This comment is already approved.");
    }

    return "APPROVED" as const;
  }

  if (action === "reject") {
    if (currentStatus === "REJECTED") {
      throw new Error("This comment is already rejected.");
    }

    return "REJECTED" as const;
  }

  if (currentStatus === "SPAM") {
    throw new Error("This comment is already marked as spam.");
  }

  return "SPAM" as const;
}

function revalidateDiscussionSurfaces(slug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

async function findPublishedBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    select: {
      id: true,
      slug: true,
      status: true,
      title: true,
    },
    where: {
      slug,
      status: "PUBLISHED",
    },
  }) as Promise<StoredPublicBlogPost | null>;
}

async function findBlogCommentOrThrow(id: string) {
  const comment = await prisma.blogComment.findUnique({
    include: {
      blogPost: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
      parent: {
        select: {
          displayName: true,
          id: true,
        },
      },
      reviewedByUser: {
        select: {
          name: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!comment) {
    throw new BlogCommentStorageError("That comment could not be found.");
  }

  return comment as StoredBlogComment;
}

function toAdminCommentRecord(comment: StoredBlogComment): AdminBlogCommentRecord {
  return {
    blogPostId: comment.blogPostId,
    blogPostSlug: comment.blogPost.slug,
    blogPostTitle: comment.blogPost.title,
    body: comment.body,
    createdAt: normalizeDate(comment.createdAt) ?? new Date(0).toISOString(),
    depth: comment.parentId ? 1 : 0,
    displayName: comment.displayName,
    email: comment.email,
    id: comment.id,
    parentDisplayName: comment.parent?.displayName ?? null,
    parentId: comment.parentId,
    reviewedAt: normalizeDate(comment.reviewedAt),
    reviewedByUserName: comment.reviewedByUser?.name?.trim() || null,
    status: comment.status,
  };
}

export async function getBlogCommentCountsByPostId(postIds: string[]) {
  if (postIds.length === 0) {
    return new Map<string, { pending: number; total: number }>();
  }

  try {
    const comments = await prisma.blogComment.findMany({
      select: {
        blogPostId: true,
        status: true,
      },
      where: {
        blogPostId: {
          in: postIds,
        },
      },
    });

    const counts = new Map<string, { pending: number; total: number }>();

    for (const postId of postIds) {
      counts.set(postId, { pending: 0, total: 0 });
    }

    for (const comment of comments) {
      const current = counts.get(comment.blogPostId) ?? { pending: 0, total: 0 };
      current.total += 1;

      if (comment.status === "PENDING") {
        current.pending += 1;
      }

      counts.set(comment.blogPostId, current);
    }

    return counts;
  } catch (error) {
    if (isMissingBlogCommentTableError(error) || isPrismaConnectionError(error)) {
      return new Map<string, { pending: number; total: number }>();
    }

    throw new BlogCommentStorageError(getBlogCommentStorageMessage(error));
  }
}

export async function getPublicBlogComments(
  blogSlug: string,
): Promise<{ comments: PublicBlogCommentRecord[]; totalCount: number }> {
  try {
    const post = await findPublishedBlogPostBySlug(blogSlug);

    if (!post) {
      return {
        comments: [],
        totalCount: 0,
      };
    }

    const comments = await prisma.blogComment.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      select: {
        body: true,
        createdAt: true,
        displayName: true,
        id: true,
        parentId: true,
      },
      where: {
        blogPostId: post.id,
        status: "APPROVED",
      },
    });

    return {
      comments: buildPublicBlogCommentTree(
        comments.map((comment) => ({
          body: comment.body,
          createdAt: normalizeDate(comment.createdAt) ?? new Date(0).toISOString(),
          displayName: comment.displayName,
          id: comment.id,
          parentId: comment.parentId,
        })),
      ),
      totalCount: comments.length,
    };
  } catch (error) {
    if (
      isMissingBlogCommentTableError(error) ||
      isMissingBlogPostTableError(error) ||
      isPrismaConnectionError(error)
    ) {
      return {
        comments: [],
        totalCount: 0,
      };
    }

    throw new BlogCommentStorageError(getBlogCommentStorageMessage(error));
  }
}

export async function createPublicBlogCommentSubmission(
  requestHeaders: Headers,
  input: Omit<PublicBlogCommentInput, "_honeypot">,
): Promise<BlogCommentActionResult> {
  if (isBotLikeRequest(requestHeaders)) {
    return {
      message: "This comment could not be accepted right now.",
      ok: false,
    };
  }

  const rateLimitResult = await enforceSubmissionRateLimit(requestHeaders);

  if (rateLimitResult) {
    return rateLimitResult;
  }

  try {
    const post = await findPublishedBlogPostBySlug(input.blogSlug);

    if (!post) {
      return {
        message: "This article is not available for discussion right now.",
        ok: false,
      };
    }

    if (input.parentId) {
      const parent = await prisma.blogComment.findFirst({
        select: {
          id: true,
        },
        where: {
          blogPostId: post.id,
          id: input.parentId,
          parentId: null,
          status: "APPROVED",
        },
      });

      if (!parent) {
        return {
          message: "That reply target is no longer available.",
          ok: false,
        };
      }
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedBody = normalizeCommentBody(input.body);
    const ipHash = getClientIpHash(requestHeaders);
    const fingerprint = buildCommentFingerprint(normalizedEmail, normalizedBody);
    const duplicateThreshold = new Date(Date.now() - COMMENT_DUPLICATE_WINDOW_MS);

    const duplicate = await prisma.blogComment.findFirst({
      select: {
        id: true,
      },
      where: {
        blogPostId: post.id,
        createdAt: {
          gte: duplicateThreshold,
        },
        fingerprint,
        OR: [
          {
            email: normalizedEmail,
          },
          {
            ipHash,
          },
        ],
      },
    });

    if (duplicate) {
      return {
        message:
          "That comment looks like a duplicate of a recent submission. Please wait for moderation before posting it again.",
        ok: false,
      };
    }

    await prisma.blogComment.create({
      data: {
        blogPostId: post.id,
        body: normalizedBody,
        displayName: input.displayName.trim(),
        email: normalizedEmail,
        fingerprint,
        ipHash,
        parentId: input.parentId?.trim() || null,
        status: "PENDING",
      },
    });

    return {
      message:
        input.parentId
          ? "Your reply is in the moderation queue and will appear after review."
          : "Your comment is in the moderation queue and will appear after review.",
      ok: true,
    };
  } catch (error) {
    return {
      message: getBlogCommentStorageMessage(error),
      ok: false,
    };
  }
}

export async function getAdminBlogComments(
  context: AdminBlogDiscussionContext,
  postId: string,
): Promise<AdminBlogCommentRecord[]> {
  if (!context.permissions.canReadComments) {
    throw new AdminBlogDiscussionAccessError(
      403,
      "You are not allowed to review blog comments.",
    );
  }

  try {
    const comments = await prisma.blogComment.findMany({
      include: {
        blogPost: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        parent: {
          select: {
            displayName: true,
            id: true,
          },
        },
        reviewedByUser: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      where: {
        blogPostId: postId,
      },
    });

    return comments.map((comment) => toAdminCommentRecord(comment as StoredBlogComment));
  } catch (error) {
    throw new BlogCommentStorageError(getBlogCommentStorageMessage(error));
  }
}

export async function moderateAdminBlogComment(
  context: AdminBlogDiscussionContext,
  commentId: string,
  action: BlogCommentModerationAction,
): Promise<BlogCommentActionResult> {
  if (!context.permissions.canModerateComments) {
    throw new AdminBlogDiscussionAccessError(
      403,
      "You are not allowed to moderate blog comments.",
    );
  }

  try {
    const existing = await findBlogCommentOrThrow(commentId);
    const nextStatus = getNextCommentStatus(existing.status, action);

    await prisma.blogComment.update({
      data: {
        reviewedAt: new Date(),
        reviewedByUserId: context.currentUserId,
        status: nextStatus,
      },
      where: {
        id: commentId,
      },
    });

    revalidateDiscussionSurfaces(existing.blogPost.slug);

    return {
      message:
        nextStatus === "APPROVED"
          ? "Comment approved and ready for the public discussion thread."
          : nextStatus === "REJECTED"
            ? "Comment rejected and removed from the public thread."
            : "Comment marked as spam.",
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogDiscussionAccessError) {
      throw error;
    }

    return {
      message: getBlogCommentStorageMessage(error),
      ok: false,
    };
  }
}

export async function deleteAdminBlogComment(
  context: AdminBlogDiscussionContext,
  commentId: string,
): Promise<BlogCommentActionResult> {
  if (!context.permissions.canDeleteComments) {
    throw new AdminBlogDiscussionAccessError(
      403,
      "You are not allowed to delete blog comments.",
    );
  }

  try {
    const existing = await findBlogCommentOrThrow(commentId);

    await prisma.blogComment.delete({
      where: {
        id: commentId,
      },
    });

    revalidateDiscussionSurfaces(existing.blogPost.slug);

    return {
      message:
        existing.parentId
          ? "Reply deleted from the discussion thread."
          : "Comment thread deleted from the discussion queue.",
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogDiscussionAccessError) {
      throw error;
    }

    return {
      message: getBlogCommentStorageMessage(error),
      ok: false,
    };
  }
}
