import { z } from "zod";

import { MAX_RESUME_FILE_BYTES } from "@/lib/resume.shared";

function isValidResumeUrl(value: string) {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const resumeAssetSchema = z.object({
  downloadUrl: z
    .string()
    .trim()
    .min(1, "Resume URL is required.")
    .refine(isValidResumeUrl, {
      message: "Enter a valid absolute URL or site-relative PDF path.",
    }),
  fileName: z
    .string()
    .trim()
    .max(160, "Keep the file name under 160 characters.")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
  fileSizeBytes: z
    .number({
      error: "Resume file size is invalid.",
    })
    .int()
    .min(0, "Resume file size cannot be negative.")
    .max(MAX_RESUME_FILE_BYTES, "Resume file size must stay under 50MB.")
    .optional(),
  mimeType: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : undefined;
    }),
});

export type ResumeAssetSchemaValues = z.infer<typeof resumeAssetSchema>;
