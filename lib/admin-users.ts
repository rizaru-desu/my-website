import { auth } from "@/lib/auth";
import {
  managedUserRoleOptions,
  type BanManagedUserInput,
  type CreateManagedUserInput,
  type ManagedUserActionResult,
  type ManagedUserRole,
  getUserStatus,
  type ManagedUserRecord,
} from "@/app/admin/users/users-management.shared";

type ManagedUsersContext = {
  currentUserId: string;
  headers: Headers;
};

export class AdminUsersAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminUsersAccessError";
    this.status = status;
  }
}

function normalizeDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getLatestSessionTimestamp(
  sessions: Array<{
    createdAt: string | Date;
    updatedAt?: string | Date | null;
  }>,
) {
  let latestTimestamp: number | null = null;

  for (const session of sessions) {
    const timestamp = new Date(session.updatedAt ?? session.createdAt).getTime();

    if (Number.isNaN(timestamp)) {
      continue;
    }

    if (latestTimestamp === null || timestamp > latestTimestamp) {
      latestTimestamp = timestamp;
    }
  }

  return latestTimestamp === null ? null : new Date(latestTimestamp).toISOString();
}

export async function getManagedUsersContext(requestHeaders: Headers): Promise<ManagedUsersContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminUsersAccessError(401, "You must be signed in to manage users.");
  }

  if (session.user.role !== "architect") {
    throw new AdminUsersAccessError(403, "You are not allowed to manage users.");
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
  };
}

export async function getManagedUsers({
  currentUserId,
  headers,
}: ManagedUsersContext): Promise<ManagedUserRecord[]> {
  const usersResponse = await auth.api.listUsers({
    headers,
    query: {
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  const users = usersResponse.users ?? [];

  return Promise.all(
    users.map(async (user) => {
      const sessionsResponse = await auth.api.listUserSessions({
        headers,
        body: {
          userId: user.id,
        },
      });

      const sessions = sessionsResponse.sessions ?? [];
      const lastSeenAt = getLatestSessionTimestamp(sessions);
      const inactive = sessions.length === 0;
      const banned = Boolean(user.banned);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        emailVerified: Boolean(user.emailVerified),
        banned,
        banReason: user.banReason ?? null,
        banExpires: normalizeDate(user.banExpires),
        createdAt: normalizeDate(user.createdAt) ?? new Date(0).toISOString(),
        updatedAt: normalizeDate(user.updatedAt) ?? new Date(0).toISOString(),
        sessionCount: sessions.length,
        inactive,
        lastSeenAt,
        statusKey: getUserStatus({ banned, inactive }),
        isCurrentUser: user.id === currentUserId,
      } satisfies ManagedUserRecord;
    }),
  );
}

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AdminUsersAccessError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function validateCreateUserInput({
  email,
  name,
  password,
  role,
}: CreateManagedUserInput) {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const nextRole = role as ManagedUserRole;

  if (!trimmedName) {
    return {
      ok: false,
      message: "Full name is required before creating the account.",
    } satisfies ManagedUserActionResult;
  }

  if (!trimmedEmail) {
    return {
      ok: false,
      message: "Email is required before creating the account.",
    } satisfies ManagedUserActionResult;
  }

  if (!password) {
    return {
      ok: false,
      message: "Password is required before creating the account.",
    } satisfies ManagedUserActionResult;
  }

  if (!managedUserRoleOptions.includes(nextRole)) {
    return {
      ok: false,
      message: "Choose a valid role before creating the account.",
    } satisfies ManagedUserActionResult;
  }

  return {
    ok: true,
    message: "",
    payload: {
      email: trimmedEmail,
      name: trimmedName,
      password,
      role: nextRole,
    },
  } as const;
}

function protectCurrentUser(currentUserId: string, userId: string, fallback: string) {
  if (currentUserId === userId) {
    return {
      ok: false,
      message: fallback,
    } satisfies ManagedUserActionResult;
  }

  return null;
}

function validateBanUserInput({
  userId,
  banReason,
  banExpiresAt,
}: BanManagedUserInput) {
  const trimmedReason = banReason.trim();
  const expiresAt = new Date(banExpiresAt);
  const banExpiresIn = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

  if (!userId) {
    return {
      ok: false,
      message: "The selected user is missing.",
    } satisfies ManagedUserActionResult;
  }

  if (!trimmedReason) {
    return {
      ok: false,
      message: "Ban reason is required before restricting account access.",
    } satisfies ManagedUserActionResult;
  }

  if (Number.isNaN(expiresAt.getTime())) {
    return {
      ok: false,
      message: "Choose a valid ban expiry date and time.",
    } satisfies ManagedUserActionResult;
  }

  if (banExpiresIn <= 0) {
    return {
      ok: false,
      message: "Ban expiry must be set to a future date and time.",
    } satisfies ManagedUserActionResult;
  }

  return {
    ok: true,
    message: "",
    payload: {
      userId,
      banReason: trimmedReason,
      banExpiresIn,
    },
  } as const;
}

export async function createManagedUserAccount(
  context: ManagedUsersContext,
  input: CreateManagedUserInput,
): Promise<ManagedUserActionResult> {
  const validation = validateCreateUserInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    await auth.api.createUser({
      headers: context.headers,
      body: {
        email: validation.payload.email,
        name: validation.payload.name,
        password: validation.payload.password,
        role: validation.payload.role,
      },
    });

    return {
      ok: true,
      message: "User created successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Failed to create the user account."),
    };
  }
}

export async function banManagedUserAccount(
  context: ManagedUsersContext,
  input: BanManagedUserInput,
): Promise<ManagedUserActionResult> {
  const validation = validateBanUserInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const protection = protectCurrentUser(
      context.currentUserId,
      validation.payload.userId,
      "Your current session cannot be banned.",
    );

    if (protection) {
      return protection;
    }

    await auth.api.banUser({
      headers: context.headers,
      body: {
        userId: validation.payload.userId,
        banReason: validation.payload.banReason,
        banExpiresIn: validation.payload.banExpiresIn,
      },
    });

    return {
      ok: true,
      message: "User banned successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Failed to ban the selected user."),
    };
  }
}

export async function unbanManagedUserAccount(
  context: ManagedUsersContext,
  userId: string,
): Promise<ManagedUserActionResult> {
  try {
    await auth.api.unbanUser({
      headers: context.headers,
      body: {
        userId,
      },
    });

    return {
      ok: true,
      message: "User unbanned successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Failed to unban the selected user."),
    };
  }
}

export async function revokeManagedUserSessionsAccess(
  context: ManagedUsersContext,
  userId: string,
): Promise<ManagedUserActionResult> {
  try {
    const protection = protectCurrentUser(
      context.currentUserId,
      userId,
      "Your current session cannot be revoked from this screen.",
    );

    if (protection) {
      return protection;
    }

    await auth.api.revokeUserSessions({
      headers: context.headers,
      body: {
        userId,
      },
    });

    return {
      ok: true,
      message: "User sessions revoked successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Failed to revoke sessions for the selected user."),
    };
  }
}
