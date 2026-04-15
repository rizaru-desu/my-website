import { z } from "zod";

export const projectAccentValues = ["red", "blue", "cream"] as const;
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

const longTextSchema = z
  .string()
  .trim()
  .min(20, "Add a little more detail.")
  .max(500, "Keep this section under 500 characters.");

export const projectMetricSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Metric label is required.")
    .max(40, "Keep metric labels under 40 characters."),
  value: z
    .string()
    .trim()
    .min(1, "Metric value is required.")
    .max(32, "Keep metric values under 32 characters."),
});

export const projectGalleryItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Gallery title is required.")
    .max(48, "Keep gallery titles under 48 characters."),
  caption: z
    .string()
    .trim()
    .min(12, "Gallery captions should be at least 12 characters.")
    .max(180, "Keep gallery captions under 180 characters."),
});

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
  duration: z
    .string()
    .trim()
    .min(2, "Duration is required.")
    .max(40, "Keep the duration under 40 characters."),
  accent: z.enum(projectAccentValues),
  thumbnailPlaceholder: z
    .string()
    .trim()
    .min(4, "Add a thumbnail placeholder note.")
    .max(80, "Keep the thumbnail note under 80 characters."),
  projectUrl: optionalUrlSchema,
  githubUrl: optionalUrlSchema,
  impactSummary: z
    .string()
    .trim()
    .min(20, "Impact summary should be at least 20 characters.")
    .max(220, "Keep the impact summary under 220 characters."),
  impactBullets: z
    .array(bulletItemSchema)
    .min(1, "Add at least one impact bullet.")
    .max(6, "Keep impact bullets to six items or fewer."),
  techStack: z
    .array(listItemSchema)
    .min(1, "Add at least one tech stack item.")
    .max(10, "Keep the tech stack to ten items or fewer."),
  challenge: longTextSchema,
  process: z
    .array(
      z
        .string()
        .trim()
        .min(8, "Each process step should be at least 8 characters.")
        .max(220, "Keep each process step under 220 characters."),
    )
    .min(1, "Add at least one process step.")
    .max(8, "Keep process steps to eight items or fewer."),
  outcome: longTextSchema,
  metrics: z
    .array(projectMetricSchema)
    .min(1, "Add at least one metric.")
    .max(6, "Keep metrics to six items or fewer."),
  gallery: z
    .array(projectGalleryItemSchema)
    .min(1, "Add at least one gallery item.")
    .max(6, "Keep gallery items to six or fewer."),
  sortOrder: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d+$/.test(value),
      "Sort order should be a whole number.",
    ),
});

export type ProjectAccent = (typeof projectAccentValues)[number];
export type ProjectMetricInput = z.infer<typeof projectMetricSchema>;
export type ProjectGalleryItemInput = z.infer<typeof projectGalleryItemSchema>;
export type ProjectStatus = (typeof projectStatusValues)[number];
export type ProjectFormValues = z.infer<typeof projectSchema>;
