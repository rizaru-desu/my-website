import type { BlogFormValues } from "@/app/admin/blog/blog.schema";
import type { AdminBlogRecord, BlogActionResult } from "@/lib/blog.shared";
import type {
  AdminBlogCommentRecord,
  BlogCommentActionResult,
  BlogCommentModerationAction,
} from "@/lib/blog-discussions.shared";

export const adminBlogQueryKey = ["admin-blog", "list"] as const;
export const adminBlogCommentsQueryKey = (postId: string) =>
  ["admin-blog", "comments", postId] as const;

async function readBlogActionResult(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as
    | BlogActionResult
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallbackMessage,
    );
  }

  return payload as BlogActionResult;
}

async function readBlogCommentActionResult(
  response: Response,
  fallbackMessage: string,
) {
  const payload = (await response.json().catch(() => null)) as
    | BlogCommentActionResult
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallbackMessage,
    );
  }

  return payload as BlogCommentActionResult;
}

export async function fetchAdminBlogPosts(): Promise<AdminBlogRecord[]> {
  const response = await fetch("/api/admin/blog", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(payload?.message ?? "The blog board could not be loaded.");
  }

  return (await response.json()) as AdminBlogRecord[];
}

export async function createAdminBlogRequest(input: BlogFormValues) {
  const response = await fetch("/api/admin/blog", {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return readBlogActionResult(response, "The blog post could not be created.");
}

export async function updateAdminBlogRequest(input: {
  id: string;
  values: BlogFormValues;
}) {
  const response = await fetch(`/api/admin/blog/${input.id}`, {
    body: JSON.stringify(input.values),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return readBlogActionResult(response, "The blog post could not be updated.");
}

export async function deleteAdminBlogRequest(id: string) {
  const response = await fetch(`/api/admin/blog/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  return readBlogActionResult(response, "The blog post could not be deleted.");
}

export async function duplicateAdminBlogRequest(id: string) {
  const response = await fetch("/api/admin/blog", {
    body: JSON.stringify({
      duplicateFromId: id,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return readBlogActionResult(response, "The blog post could not be duplicated.");
}

export async function fetchAdminBlogComments(postId: string): Promise<AdminBlogCommentRecord[]> {
  const response = await fetch(`/api/admin/blog/comments?postId=${encodeURIComponent(postId)}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(payload?.message ?? "The discussion queue could not be loaded.");
  }

  return (await response.json()) as AdminBlogCommentRecord[];
}

export async function moderateAdminBlogCommentRequest(input: {
  action: BlogCommentModerationAction;
  id: string;
}) {
  const response = await fetch(`/api/admin/blog/comments/${input.id}`, {
    body: JSON.stringify({
      action: input.action,
    }),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return readBlogCommentActionResult(
    response,
    "The comment moderation action could not be completed.",
  );
}

export async function deleteAdminBlogCommentRequest(id: string) {
  const response = await fetch(`/api/admin/blog/comments/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  return readBlogCommentActionResult(response, "The comment could not be deleted.");
}
