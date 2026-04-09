import type {
  BanManagedUserInput,
  CreateManagedUserInput,
  ManagedUserActionResult,
  ManagedUserRecord,
} from "@/app/admin/users/users-management.shared";

export const managedUsersQueryKey = ["admin-users", "list"] as const;

async function readActionResult(
  response: Response,
  fallback: string,
): Promise<ManagedUserActionResult> {
  try {
    const payload = (await response.json()) as Partial<ManagedUserActionResult>;

    if (typeof payload.message === "string") {
      return {
        ok: Boolean(payload.ok),
        message: payload.message,
      };
    }
  } catch {
    // Keep the fallback when the response body is missing or malformed.
  }

  return {
    ok: false,
    message: fallback,
  };
}

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

export async function createManagedUserRequest(input: CreateManagedUserInput) {
  const response = await fetch("/api/admin/users", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = await readActionResult(
    response,
    "The user account could not be created.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function banManagedUserRequest(input: BanManagedUserInput) {
  const response = await fetch(`/api/admin/users/${input.userId}`, {
    body: JSON.stringify({
      action: "ban",
      banExpiresAt: input.banExpiresAt,
      banReason: input.banReason,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The selected user could not be banned.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function unbanManagedUserRequest(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    body: JSON.stringify({
      action: "unban",
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The selected user could not be unbanned.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function revokeManagedUserSessionsRequest(userId: string) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    body: JSON.stringify({
      action: "revoke-sessions",
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The selected user sessions could not be revoked.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}
