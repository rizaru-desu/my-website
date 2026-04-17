import type { AdminProfileRecord, ProfileActionResult } from "@/lib/profile.shared";

export const adminProfileQueryKey = ["admin-profile", "content"] as const;

async function readActionResult(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as
    | ProfileActionResult
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallbackMessage,
    );
  }

  return payload as ProfileActionResult;
}

export async function fetchAdminProfileContent(): Promise<AdminProfileRecord> {
  const response = await fetch("/api/admin/profile", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "The profile could not be loaded right now.");
  }

  return (await response.json()) as AdminProfileRecord;
}

export async function updateAdminProfileContentRequest(
  input: Omit<AdminProfileRecord, "source" | "updatedAt">,
) {
  const response = await fetch("/api/admin/profile", {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return readActionResult(response, "The profile could not be updated.");
}
