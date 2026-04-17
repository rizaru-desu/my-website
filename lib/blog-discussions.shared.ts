export const blogCommentStatusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SPAM",
] as const;

export const blogCommentModerationActionValues = [
  "approve",
  "reject",
  "spam",
] as const;

export type BlogCommentStatusValue = (typeof blogCommentStatusValues)[number];
export type BlogCommentModerationAction =
  (typeof blogCommentModerationActionValues)[number];

export type BlogCommentActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type PublicBlogCommentInput = {
  _honeypot: string;
  blogSlug: string;
  body: string;
  displayName: string;
  email: string;
  parentId?: string;
};

export type PublicBlogCommentRecord = {
  body: string;
  createdAt: string;
  displayName: string;
  id: string;
  replies: Array<{
    body: string;
    createdAt: string;
    displayName: string;
    id: string;
  }>;
};

export type AdminBlogCommentRecord = {
  blogPostId: string;
  blogPostSlug: string;
  blogPostTitle: string;
  body: string;
  createdAt: string;
  depth: 0 | 1;
  displayName: string;
  email: string;
  id: string;
  parentDisplayName: string | null;
  parentId: string | null;
  reviewedAt: string | null;
  reviewedByUserName: string | null;
  status: BlogCommentStatusValue;
};

type FlatApprovedComment = {
  body: string;
  createdAt: string;
  displayName: string;
  id: string;
  parentId: string | null;
};

export function getBlogCommentStatusLabel(status: BlogCommentStatusValue) {
  if (status === "APPROVED") {
    return "Approved";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  if (status === "SPAM") {
    return "Spam";
  }

  return "Pending";
}

export function formatBlogCommentDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function buildPublicBlogCommentTree(
  records: FlatApprovedComment[],
): PublicBlogCommentRecord[] {
  const topLevel = records
    .filter((item) => !item.parentId)
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );

  const replyGroups = new Map<string, PublicBlogCommentRecord["replies"]>();

  records
    .filter((item) => item.parentId)
    .sort(
      (first, second) =>
        new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime(),
    )
    .forEach((item) => {
      if (!item.parentId) {
        return;
      }

      const group = replyGroups.get(item.parentId) ?? [];
      group.push({
        body: item.body,
        createdAt: item.createdAt,
        displayName: item.displayName,
        id: item.id,
      });
      replyGroups.set(item.parentId, group);
    });

  return topLevel.map((item) => ({
    body: item.body,
    createdAt: item.createdAt,
    displayName: item.displayName,
    id: item.id,
    replies: replyGroups.get(item.id) ?? [],
  }));
}
