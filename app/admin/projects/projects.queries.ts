import type { ProjectFormValues } from "@/app/admin/projects/project.schema";
import type { AdminProjectRecord, ProjectActionResult } from "@/lib/projects.shared";

export const adminProjectsQueryKey = ["admin-projects", "list"] as const;

async function readProjectActionResult(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | ProjectActionResult
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : fallback,
    );
  }

  return payload as ProjectActionResult;
}

export async function fetchAdminProjects(): Promise<AdminProjectRecord[]> {
  const response = await fetch("/api/admin/projects", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(payload?.message ?? "The projects board could not be loaded.");
  }

  return (await response.json()) as AdminProjectRecord[];
}

export async function createAdminProjectRequest(input: ProjectFormValues) {
  const response = await fetch("/api/admin/projects", {
    body: JSON.stringify(input),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return readProjectActionResult(response, "The project could not be created.");
}

export async function updateAdminProjectRequest(input: {
  id: string;
  values: ProjectFormValues;
}) {
  const response = await fetch(`/api/admin/projects/${input.id}`, {
    body: JSON.stringify(input.values),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  return readProjectActionResult(response, "The project could not be updated.");
}

export async function deleteAdminProjectRequest(id: string) {
  const response = await fetch(`/api/admin/projects/${id}`, {
    credentials: "include",
    method: "DELETE",
  });

  return readProjectActionResult(response, "The project could not be deleted.");
}
