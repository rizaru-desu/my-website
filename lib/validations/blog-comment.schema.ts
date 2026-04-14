import { z } from "zod";

import type { PublicBlogCommentInput } from "@/lib/blog-discussions.shared";

export const blogCommentSchema = z.object({
  _honeypot: z
    .string()
    .trim()
    .max(0, "Please leave this field empty."),
  blogSlug: z
    .string()
    .trim()
    .min(1, "This article is missing its discussion context."),
  body: z
    .string()
    .trim()
    .min(8, "Write a fuller comment before submitting.")
    .max(2000, "Keep the comment under 2000 characters."),
  displayName: z
    .string()
    .trim()
    .min(2, "Share at least 2 characters for your name.")
    .max(80, "Keep the name under 80 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(160, "Keep the email under 160 characters."),
  parentId: z
    .string()
    .trim()
    .max(64, "The reply target is invalid.")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type BlogCommentFormValues = PublicBlogCommentInput;

export function getFirstBlogCommentZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please review the discussion form and try again.";
}
