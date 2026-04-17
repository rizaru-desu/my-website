"use server";

import { headers } from "next/headers";
import { ZodError } from "zod";

import { createPublicBlogCommentSubmission } from "@/lib/blog-discussions";
import {
  getFirstBlogCommentZodMessage,
  blogCommentSchema,
} from "@/lib/validations/blog-comment.schema";
import type {
  BlogCommentActionResult,
  PublicBlogCommentInput,
} from "@/lib/blog-discussions.shared";

export async function submitBlogCommentAction(
  input: PublicBlogCommentInput,
): Promise<BlogCommentActionResult> {
  try {
    const values = blogCommentSchema.parse(input);

    if (values._honeypot) {
      return {
        message: "Thanks. Your comment is now waiting in the moderation queue.",
        ok: true,
      };
    }

    const requestHeaders = await headers();

    return createPublicBlogCommentSubmission(requestHeaders, {
      blogSlug: values.blogSlug,
      body: values.body,
      displayName: values.displayName,
      email: values.email,
      parentId: values.parentId,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        message: getFirstBlogCommentZodMessage(error),
        ok: false,
      };
    }

    return {
      message:
        error instanceof Error
          ? error.message
          : "The comment could not be submitted right now.",
      ok: false,
    };
  }
}
