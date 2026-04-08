import type { ManagedUserRecord } from "@/app/admin/users/users-management.shared";

export const managedUsersQueryKey = ["admin-users", "list"] as const;

export async function fetchManagedUsers(): Promise<ManagedUserRecord[]> {
  const response = await fetch("/api/admin/users", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "The user directory could not be loaded.";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // Keep the generic fallback when the response body is empty or invalid.
    }

    throw new Error(message);
  }

  return (await response.json()) as ManagedUserRecord[];
}
