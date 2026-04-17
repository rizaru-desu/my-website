import type { SkillFormValues } from "@/app/admin/skills/skill.schema";
import type { SkillActionResult, SkillRecord } from "@/lib/skills.shared";

export const adminSkillsQueryKey = ["admin-skills", "list"] as const;

async function readSkillActionResult(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as
    | SkillActionResult
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallbackMessage,
    );
  }

  return payload as SkillActionResult;
}

export async function fetchAdminSkills(): Promise<SkillRecord[]> {
  const response = await fetch("/api/admin/skills", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(payload?.message ?? "The skills board could not be loaded.");
  }

  return (await response.json()) as SkillRecord[];
}

export async function createAdminSkillRequest(input: SkillFormValues) {
  const response = await fetch("/api/admin/skills", {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return readSkillActionResult(response, "The skill could not be created.");
}

export async function updateAdminSkillRequest(input: {
  id: string;
  values: SkillFormValues;
}) {
  const response = await fetch(`/api/admin/skills/${input.id}`, {
    body: JSON.stringify(input.values),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return readSkillActionResult(response, "The skill could not be updated.");
}

export async function deleteAdminSkillRequest(id: string) {
  const response = await fetch(`/api/admin/skills/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  return readSkillActionResult(response, "The skill could not be deleted.");
}
