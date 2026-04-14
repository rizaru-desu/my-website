import type { BlogFormValues, BlogStatus } from "@/app/admin/blog/blog.schema";

export type BlogActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type AdminBlogRecord = {
  authorName: string;
  authorUserId: string;
  commentCount: number;
  createdAt: string;
  id: string;
  pendingCommentCount: number;
  source: "database" | "fallback";
  updatedAt: string;
  values: BlogFormValues;
};

export type PublicBlogSummary = {
  authorName: string;
  category: string;
  coverImagePlaceholder: string;
  excerpt: string;
  featured: boolean;
  publishDate: string | null;
  publishDateLabel: string;
  readingTime: string;
  slug: string;
  tags: string[];
  title: string;
};

export type PublicBlogDetail = PublicBlogSummary & {
  content: string;
  seoDescription: string;
  seoTitle: string;
};

export type BlogPermissionSet = {
  canCreate: boolean;
  canDelete: boolean;
  canDeleteComments: boolean;
  canDraft: boolean;
  canModerateComments: boolean;
  canPublish: boolean;
  canRead: boolean;
  canReadComments: boolean;
  canUpdate: boolean;
  currentUserId: string;
  requiresOwnershipForWrite: boolean;
  role: string;
};

export function normalizeBlogStatus(status: string): BlogStatus {
  if (status === "published" || status === "archived") {
    return status;
  }

  return "draft";
}

export function formatBlogUpdatedAt(value: Date | string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatBlogPublishDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Unscheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unscheduled";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toBlogDateInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function canManageBlogPost(
  permissions: BlogPermissionSet,
  record: Pick<AdminBlogRecord, "authorUserId">,
  action: "delete" | "publish" | "update",
) {
  const ownsRecord = permissions.currentUserId === record.authorUserId;
  const passesOwnership = !permissions.requiresOwnershipForWrite || ownsRecord;

  if (action === "delete") {
    return permissions.canDelete && passesOwnership;
  }

  if (action === "publish") {
    return permissions.canPublish && passesOwnership;
  }

  return permissions.canUpdate && passesOwnership;
}
