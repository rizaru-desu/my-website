import { RESUME_STORAGE_FILE_NAME } from "@/lib/resume.shared";
import type {
  AdminResumeAssetRecord,
  ResumeAssetActionResult,
} from "@/lib/resume.shared";

export const adminResumeAssetQueryKey = ["admin-resume", "asset"] as const;

async function readActionResult(
  response: Response,
  fallback: string,
): Promise<ResumeAssetActionResult> {
  try {
    const payload = (await response.json()) as Partial<ResumeAssetActionResult>;

    if (typeof payload.message === "string") {
      return {
        ok: Boolean(payload.ok),
        message: payload.message,
      } as ResumeAssetActionResult;
    }
  } catch {
    // ignore invalid payloads
  }

  return {
    ok: false,
    message: fallback,
  };
}

export async function fetchAdminResumeAsset(): Promise<AdminResumeAssetRecord> {
  const response = await fetch("/api/admin/resume", {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    const result = await readActionResult(
      response,
      "The resume asset could not be loaded right now.",
    );
    throw new Error(result.message);
  }

  return (await response.json()) as AdminResumeAssetRecord;
}

export async function updateAdminResumeAssetRequest(input: {
  downloadUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
}) {
  const response = await fetch("/api/admin/resume", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The resume asset could not be updated.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function uploadAdminResumeAssetRequest(file: File) {
  const formData = new FormData();
  formData.set("file", file, RESUME_STORAGE_FILE_NAME);

  const response = await fetch("/api/admin/resume", {
    body: formData,
    method: "POST",
  });

  const result = await readActionResult(
    response,
    "The resume upload could not be completed.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function clearAdminResumeAssetRequest() {
  const response = await fetch("/api/admin/resume", {
    method: "DELETE",
  });

  const result = await readActionResult(
    response,
    "The resume asset could not be cleared.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}
