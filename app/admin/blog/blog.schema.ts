import { z } from "zod";

export const blogStatusValues = ["draft", "published", "archived"] as const;

const optionalDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || !Number.isNaN(Date.parse(value)),
    "Enter a valid publish date.",
  );

const listItemSchema = z
  .string()
  .trim()
  .min(1, "Remove empty tags or add a value.")
  .max(32, "Keep each tag under 32 characters.");

const optionalSeoTitleSchema = z
  .string()
  .trim()
  .max(70, "Keep the SEO title under 70 characters.");

const optionalSeoDescriptionSchema = z
  .string()
  .trim()
  .max(160, "Keep the SEO description under 160 characters.");

export const blogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Post title is required.")
    .max(90, "Keep the title under 90 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Post slug is required.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only.",
    ),
  excerpt: z
    .string()
    .trim()
    .min(24, "Excerpt should be at least 24 characters.")
    .max(220, "Excerpt should stay under 220 characters."),
  content: z
    .string()
    .trim()
    .min(120, "Content should be at least 120 characters.")
    .max(5000, "Content should stay under 5000 characters."),
  tags: z
    .array(listItemSchema)
    .min(1, "Add at least one tag.")
    .max(8, "Keep tags to eight entries or fewer."),
  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(40, "Keep the category under 40 characters."),
  coverImagePlaceholder: z
    .string()
    .trim()
    .max(120, "Keep the cover placeholder under 120 characters."),
  status: z.enum(blogStatusValues),
  featured: z.boolean(),
  publishDate: optionalDateSchema,
  readingTime: z
    .string()
    .trim()
    .min(3, "Reading time is required.")
    .max(24, "Keep the reading time under 24 characters."),
  seoTitle: optionalSeoTitleSchema,
  seoDescription: optionalSeoDescriptionSchema,
  authorName: z
    .string()
    .trim()
    .min(2, "Author name is required.")
    .max(48, "Keep the author name under 48 characters."),
});

export type BlogStatus = (typeof blogStatusValues)[number];
export type BlogFormValues = z.infer<typeof blogSchema>;
