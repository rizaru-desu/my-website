import { auth } from "@/lib/auth";
import {
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
