import { z } from "zod";

export const projectStatusValues = ["draft", "published", "archived"] as const;

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    "Enter a valid URL.",
  );

const listItemSchema = z
  .string()
  .trim()
  .min(1, "Remove empty items or add a value.")
  .max(40, "Keep each item under 40 characters.");

const bulletItemSchema = z
  .string()
  .trim()
  .min(4, "Each bullet should be at least 4 characters.")
  .max(120, "Keep each bullet under 120 characters.");

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Project title is required.")
    .max(72, "Keep the title under 72 characters."),
  slug: z
    .string()
    .trim()
    .min(3, "Project slug is required.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens only.",
    ),
  summary: z
    .string()
    .trim()
    .min(20, "Summary should be at least 20 characters.")
    .max(180, "Summary should stay under 180 characters."),
  description: z
    .string()
    .trim()
    .min(80, "Description should be at least 80 characters.")
    .max(1800, "Description should stay under 1800 characters."),
  category: z
    .string()
    .trim()
    .min(2, "Category is required.")
    .max(40, "Keep the category under 40 characters."),
  tags: z
    .array(listItemSchema)
    .min(1, "Add at least one tag.")
    .max(8, "Keep tags to eight items or fewer."),
  featured: z.boolean(),
  status: z.enum(projectStatusValues),
  year: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter a valid four-digit year."),
  clientOrCompany: z
    .string()
    .trim()
    .min(2, "Client or company is required.")
    .max(60, "Keep the client or company under 60 characters."),
  role: z
    .string()
    .trim()
    .min(2, "Role is required.")
    .max(60, "Keep the role under 60 characters."),
  thumbnailPlaceholder: z
    .string()
    .trim()
    .min(4, "Add a thumbnail placeholder note.")
    .max(80, "Keep the thumbnail note under 80 characters."),
  projectUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  impactBullets: z
    .array(bulletItemSchema)
    .min(1, "Add at least one impact bullet.")
    .max(6, "Keep impact bullets to six items or fewer."),
  techStack: z
    .array(listItemSchema)
    .min(1, "Add at least one tech stack item.")
    .max(10, "Keep the tech stack to ten items or fewer."),
  sortOrder: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Sort order should be a whole number.",
    ),
});

export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectFormValues = z.infer<typeof projectSchema>;
