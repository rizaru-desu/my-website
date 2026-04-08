"use server";

import { headers } from "next/headers";

import {
  managedUserRoleOptions,
  type BanManagedUserInput,
  type CreateManagedUserInput,
  type ManagedUserActionResult,
  type ManagedUserRole,
} from "@/app/admin/users/users-management.shared";
import { auth } from "@/lib/auth";
import {
  AdminUsersAccessError,
  getManagedUsersContext,
} from "@/lib/admin-users";

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AdminUsersAccessError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function getActionContext() {
  return getManagedUsersContext(await headers());
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

export async function banManagedUser(input: BanManagedUserInput): Promise<ManagedUserActionResult> {
  const validation = validateBanUserInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const context = await getActionContext();
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

export async function unbanManagedUser(userId: string): Promise<ManagedUserActionResult> {
  try {
    const context = await getActionContext();
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

export async function revokeManagedUserSessions(userId: string): Promise<ManagedUserActionResult> {
  try {
    const context = await getActionContext();
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

export async function createManagedUser(
  input: CreateManagedUserInput,
): Promise<ManagedUserActionResult> {
  const validation = validateCreateUserInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const context = await getActionContext();

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
      message: `${validation.payload.email} was created as ${validation.payload.role}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: getActionErrorMessage(error, "Failed to create the user account."),
    };
  }
}
