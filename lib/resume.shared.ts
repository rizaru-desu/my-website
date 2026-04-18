export type ResumeAssetActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export const RESUME_STORAGE_FILE_NAME = "resume.pdf";
export const MAX_RESUME_FILE_BYTES = 50 * 1024 * 1024;

export type AdminResumeAssetRecord = {
  downloadUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  id: string | null;
  mimeType: string | null;
  source: "database" | "env" | "none";
  updatedAt: string | null;
};

export function formatResumeFileSize(size: number | null) {
  if (size === null || Number.isNaN(size)) {
    return "Unknown";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatResumeUpdatedAt(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
