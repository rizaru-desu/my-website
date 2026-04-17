import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { blogSchema, type BlogFormValues } from "@/app/admin/blog/blog.schema";
import { auth } from "@/lib/auth";
import { getBlogCommentCountsByPostId } from "@/lib/blog-discussions";
import {
  canManageBlogPost,
  formatBlogPublishDate,
  toBlogDateInputValue,
  type AdminBlogRecord,
  type BlogActionResult,
  type BlogPermissionSet,
  type PublicBlogDetail,
  type PublicBlogSummary,
} from "@/lib/blog.shared";
import {
  isMissingBlogPostTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

type StoredBlogPostStatus = "ARCHIVED" | "DRAFT" | "PUBLISHED";

type StoredBlogPost = {
  authorName: string;
  authorUserId: string;
  category: string;
  content: string;
  coverImagePlaceholder: string | null;
  createdAt: Date;
  excerpt: string;
  featured: boolean;
  id: string;
  publishDate: Date | null;
  readingTime: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: StoredBlogPostStatus;
  tags: string[];
  title: string;
  updatedAt: Date;
};

type AdminBlogContext = {
  currentUserId: string;
  currentUserName: string;
  headers: Headers;
  permissions: BlogPermissionSet;
};

const blogPostModel = (prisma as typeof prisma & {
  blogPost: {
    create: (args: unknown) => Promise<StoredBlogPost>;
    delete: (args: unknown) => Promise<StoredBlogPost>;
    findFirst: (args: unknown) => Promise<StoredBlogPost | null>;
    findMany: (args: unknown) => Promise<StoredBlogPost[]>;
    findUnique: (args: unknown) => Promise<StoredBlogPost | null>;
    update: (args: unknown) => Promise<StoredBlogPost>;
  };
}).blogPost;

export class AdminBlogAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminBlogAccessError";
    this.status = status;
  }
}

export class BlogStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlogStorageError";
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

function getBlogStorageMessage(error: unknown) {
  if (isMissingBlogPostTableError(error)) {
    return "Blog storage is not ready yet. Start the database and run `npx prisma db push` first.";
  }

  if (isPrismaConnectionError(error)) {
    return "The database is not reachable right now. Make sure PostgreSQL is running, then try again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "That slug is already in use. Choose a different post slug.";
    }

    if (error.code === "P2025") {
      return "That blog post could not be found.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The blog data could not be updated right now.";
}

function toStoredStatus(status: BlogFormValues["status"]): StoredBlogPostStatus {
  if (status === "published") {
    return "PUBLISHED";
  }

  if (status === "archived") {
    return "ARCHIVED";
  }

  return "DRAFT";
}

function toFormStatus(status: StoredBlogPostStatus): BlogFormValues["status"] {
  if (status === "PUBLISHED") {
    return "published";
  }

  if (status === "ARCHIVED") {
    return "archived";
  }

  return "draft";
}

function toAdminBlogRecord(post: StoredBlogPost): AdminBlogRecord {
  return {
    authorName: post.authorName,
    authorUserId: post.authorUserId,
    commentCount: 0,
    createdAt: normalizeDate(post.createdAt) ?? new Date(0).toISOString(),
    id: post.id,
    pendingCommentCount: 0,
    source: "database",
    updatedAt: normalizeDate(post.updatedAt) ?? new Date(0).toISOString(),
    values: {
      authorName: post.authorName,
      category: post.category,
      content: post.content,
      coverImagePlaceholder: post.coverImagePlaceholder ?? "",
      excerpt: post.excerpt,
      featured: post.featured,
      publishDate: toBlogDateInputValue(post.publishDate),
      readingTime: post.readingTime,
      seoDescription: post.seoDescription ?? "",
      seoTitle: post.seoTitle ?? "",
      slug: post.slug,
      status: toFormStatus(post.status),
      tags: post.tags,
      title: post.title,
    },
  };
}

function toPublicBlogDetail(post: StoredBlogPost): PublicBlogDetail {
  const publishDate = normalizeDate(post.publishDate);

  return {
    authorName: post.authorName,
    category: post.category,
    content: post.content,
    coverImagePlaceholder: post.coverImagePlaceholder ?? "",
    excerpt: post.excerpt,
    featured: post.featured,
    publishDate,
    publishDateLabel: formatBlogPublishDate(post.publishDate),
    readingTime: post.readingTime,
    seoDescription: post.seoDescription?.trim() || post.excerpt,
    seoTitle: post.seoTitle?.trim() || post.title,
    slug: post.slug,
    tags: post.tags,
    title: post.title,
  };
}

function toPublicBlogSummary(post: PublicBlogDetail): PublicBlogSummary {
  return {
    authorName: post.authorName,
    category: post.category,
    coverImagePlaceholder: post.coverImagePlaceholder,
    excerpt: post.excerpt,
    featured: post.featured,
    publishDate: post.publishDate,
    publishDateLabel: post.publishDateLabel,
    readingTime: post.readingTime,
    slug: post.slug,
    tags: post.tags,
    title: post.title,
  };
}

async function hasPermission(
  headers: Headers,
  userId: string,
  resource: "article" | "comment",
  action: "create" | "delete" | "draft" | "moderate" | "publish" | "read" | "update",
) {
  const result = await auth.api.userHasPermission({
    body: {
      permissions: {
        [resource]: [action],
      },
      userId,
    },
    headers,
  });

  return Boolean(result?.success);
}

function requiresOwnership(role: string) {
  return role === "artisan";
}

function canAccessForStatus(
  permissions: BlogPermissionSet,
  record: Pick<AdminBlogRecord, "authorUserId">,
  status: BlogFormValues["status"],
) {
  if (status === "archived") {
    return permissions.canDelete;
  }

  if (status === "published") {
    return canManageBlogPost(permissions, record, "publish");
  }

  return permissions.canDraft;
}

async function findBlogPostOrThrow(id: string) {
  const post = await blogPostModel.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    throw new BlogStorageError("That blog post could not be found.");
  }

  return post;
}

async function createDuplicateSlug(baseSlug: string) {
  const normalizedBase = baseSlug.trim();
  let attempt = 1;

  while (attempt < 100) {
    const candidate = attempt === 1 ? `${normalizedBase}-copy` : `${normalizedBase}-copy-${attempt}`;
    const existing = await blogPostModel.findUnique({
      where: {
        slug: candidate,
      },
    });

    if (!existing) {
      return candidate;
    }

    attempt += 1;
  }

  return `${normalizedBase}-copy-${Date.now()}`;
}

function revalidateBlogSurfaces(slug?: string, previousSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/admin/blog");

  if (previousSlug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

function assertPostMutationAccess(
  context: AdminBlogContext,
  record: AdminBlogRecord,
  nextStatus: BlogFormValues["status"],
) {
  if (!canManageBlogPost(context.permissions, record, "update")) {
    throw new AdminBlogAccessError(403, "You are not allowed to edit this blog post.");
  }

  if (!canAccessForStatus(context.permissions, record, nextStatus)) {
    if (nextStatus === "published") {
      throw new AdminBlogAccessError(403, "You are not allowed to publish this blog post.");
    }

    if (nextStatus === "archived") {
      throw new AdminBlogAccessError(403, "You are not allowed to archive this blog post.");
    }

    throw new AdminBlogAccessError(403, "You are not allowed to save this blog post as a draft.");
  }
}

export async function getAdminBlogContext(requestHeaders: Headers): Promise<AdminBlogContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminBlogAccessError(401, "You must be signed in to manage blog posts.");
  }

  const [
    canCreate,
    canDelete,
    canDraft,
    canPublish,
    canRead,
    canUpdate,
    canReadComments,
    canModerateComments,
    canDeleteComments,
  ] =
    await Promise.all([
      hasPermission(requestHeaders, session.user.id, "article", "create"),
      hasPermission(requestHeaders, session.user.id, "article", "delete"),
      hasPermission(requestHeaders, session.user.id, "article", "draft"),
      hasPermission(requestHeaders, session.user.id, "article", "publish"),
      hasPermission(requestHeaders, session.user.id, "article", "read"),
      hasPermission(requestHeaders, session.user.id, "article", "update"),
      hasPermission(requestHeaders, session.user.id, "comment", "read"),
      hasPermission(requestHeaders, session.user.id, "comment", "moderate"),
      hasPermission(requestHeaders, session.user.id, "comment", "delete"),
    ]);

  if (!canRead) {
    throw new AdminBlogAccessError(403, "You are not allowed to review blog posts.");
  }

  return {
    currentUserId: session.user.id,
    currentUserName: session.user.name?.trim() || "Workspace User",
    headers: requestHeaders,
    permissions: {
      canCreate,
      canDelete,
      canDeleteComments,
      canDraft,
      canModerateComments,
      canPublish,
      canRead,
      canReadComments,
      canUpdate,
      currentUserId: session.user.id,
      requiresOwnershipForWrite: requiresOwnership(session.user.role ?? ""),
      role: session.user.role ?? "",
    },
  };
}

export async function getAdminBlogs(): Promise<AdminBlogRecord[]> {
  try {
    const posts = await blogPostModel.findMany({
      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const counts = await getBlogCommentCountsByPostId(posts.map((post) => post.id));

    return posts.map((post) => {
      const record = toAdminBlogRecord(post);
      const commentCounts = counts.get(post.id);

      return {
        ...record,
        commentCount: commentCounts?.total ?? 0,
        pendingCommentCount: commentCounts?.pending ?? 0,
      };
    });
  } catch (error) {
    throw new BlogStorageError(getBlogStorageMessage(error));
  }
}

export async function getPublicBlogPosts(): Promise<PublicBlogSummary[]> {
  try {
    const posts = await blogPostModel.findMany({
      orderBy: [
        {
          publishDate: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      where: {
        status: "PUBLISHED",
      },
    });

    return posts.map((post) => toPublicBlogSummary(toPublicBlogDetail(post)));
  } catch (error) {
    if (isMissingBlogPostTableError(error) || isPrismaConnectionError(error)) {
      return [];
    }

    throw new BlogStorageError(getBlogStorageMessage(error));
  }
}

export async function getFeaturedPublicBlogPosts(limit?: number): Promise<PublicBlogSummary[]> {
  const posts = await getPublicBlogPosts();
  const featured = posts.filter((post) => post.featured);

  if (featured.length === 0) {
    return typeof limit === "number" ? posts.slice(0, limit) : posts;
  }

  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}

export async function getPublicBlogPostBySlug(slug: string): Promise<PublicBlogDetail | null> {
  try {
    const post = await blogPostModel.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
    });

    return post ? toPublicBlogDetail(post) : null;
  } catch (error) {
    if (isMissingBlogPostTableError(error) || isPrismaConnectionError(error)) {
      return null;
    }

    throw new BlogStorageError(getBlogStorageMessage(error));
  }
}

export async function createAdminBlog(
  context: AdminBlogContext,
  input: BlogFormValues,
): Promise<BlogActionResult> {
  if (!context.permissions.canCreate) {
    throw new AdminBlogAccessError(403, "You are not allowed to create blog posts.");
  }

  try {
    const values = blogSchema.parse(input);

    if (!canAccessForStatus(context.permissions, {
      authorUserId: context.currentUserId,
    }, values.status)) {
      throw new AdminBlogAccessError(
        403,
        values.status === "published"
          ? "You are not allowed to publish this blog post."
          : values.status === "archived"
            ? "You are not allowed to archive this blog post."
            : "You are not allowed to save this blog post as a draft.",
      );
    }

    await blogPostModel.create({
      data: {
        authorName: values.authorName.trim() || context.currentUserName,
        authorUserId: context.currentUserId,
        category: values.category,
        content: values.content,
        coverImagePlaceholder: values.coverImagePlaceholder || null,
        excerpt: values.excerpt,
        featured: values.featured,
        publishDate: values.publishDate ? new Date(values.publishDate) : null,
        readingTime: values.readingTime,
        seoDescription: values.seoDescription || null,
        seoTitle: values.seoTitle || null,
        slug: values.slug,
        status: toStoredStatus(values.status),
        tags: values.tags,
        title: values.title,
      },
    });

    revalidateBlogSurfaces(values.slug);

    return {
      message: `${values.title} was saved to the editorial database.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      throw error;
    }

    if (error instanceof ZodError) {
      return {
        message: error.issues[0]?.message ?? "Please review the blog fields.",
        ok: false,
      };
    }

    return {
      message: getBlogStorageMessage(error),
      ok: false,
    };
  }
}

export async function updateAdminBlog(
  context: AdminBlogContext,
  id: string,
  input: BlogFormValues,
): Promise<BlogActionResult> {
  try {
    const values = blogSchema.parse(input);
    const existing = toAdminBlogRecord(await findBlogPostOrThrow(id));

    assertPostMutationAccess(context, existing, values.status);

    await blogPostModel.update({
      data: {
        authorName: values.authorName,
        category: values.category,
        content: values.content,
        coverImagePlaceholder: values.coverImagePlaceholder || null,
        excerpt: values.excerpt,
        featured: values.featured,
        publishDate: values.publishDate ? new Date(values.publishDate) : null,
        readingTime: values.readingTime,
        seoDescription: values.seoDescription || null,
        seoTitle: values.seoTitle || null,
        slug: values.slug,
        status: toStoredStatus(values.status),
        tags: values.tags,
        title: values.title,
      },
      where: {
        id,
      },
    });

    revalidateBlogSurfaces(values.slug, existing.values.slug);

    return {
      message: `${values.title} was updated in the editorial database.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      throw error;
    }

    if (error instanceof ZodError) {
      return {
        message: error.issues[0]?.message ?? "Please review the blog fields.",
        ok: false,
      };
    }

    return {
      message: getBlogStorageMessage(error),
      ok: false,
    };
  }
}

export async function deleteAdminBlog(
  context: AdminBlogContext,
  id: string,
): Promise<BlogActionResult> {
  try {
    const existing = toAdminBlogRecord(await findBlogPostOrThrow(id));

    if (!canManageBlogPost(context.permissions, existing, "delete")) {
      throw new AdminBlogAccessError(403, "You are not allowed to delete this blog post.");
    }

    await blogPostModel.delete({
      where: {
        id,
      },
    });

    revalidateBlogSurfaces(undefined, existing.values.slug);

    return {
      message: `${existing.values.title} was removed from the editorial database.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      throw error;
    }

    return {
      message: getBlogStorageMessage(error),
      ok: false,
    };
  }
}

export async function duplicateAdminBlog(
  context: AdminBlogContext,
  id: string,
): Promise<BlogActionResult> {
  if (!context.permissions.canCreate) {
    throw new AdminBlogAccessError(403, "You are not allowed to duplicate blog posts.");
  }

  try {
    const source = toAdminBlogRecord(await findBlogPostOrThrow(id));

    if (
      context.permissions.requiresOwnershipForWrite &&
      source.authorUserId !== context.currentUserId
    ) {
      throw new AdminBlogAccessError(403, "You are not allowed to duplicate this blog post.");
    }

    const nextSlug = await createDuplicateSlug(source.values.slug);
    const nextTitle = `${source.values.title} Copy`;

    await blogPostModel.create({
      data: {
        authorName: context.currentUserName,
        authorUserId: context.currentUserId,
        category: source.values.category,
        content: source.values.content,
        coverImagePlaceholder: source.values.coverImagePlaceholder || null,
        excerpt: source.values.excerpt,
        featured: false,
        publishDate: null,
        readingTime: source.values.readingTime,
        seoDescription: source.values.seoDescription || null,
        seoTitle: source.values.seoTitle || null,
        slug: nextSlug,
        status: "DRAFT",
        tags: source.values.tags,
        title: nextTitle,
      },
    });

    revalidateBlogSurfaces(nextSlug);

    return {
      message: `${source.values.title} was duplicated into a new draft.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof AdminBlogAccessError) {
      throw error;
    }

    return {
      message: getBlogStorageMessage(error),
      ok: false,
    };
  }
}
