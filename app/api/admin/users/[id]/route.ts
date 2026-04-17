import { NextResponse } from "next/server";

import type { BanManagedUserInput } from "@/app/admin/users/users-management.shared";
import {
  AdminUsersAccessError,
  banManagedUserAccount,
  getManagedUsersContext,
  revokeManagedUserSessionsAccess,
  unbanManagedUserAccount,
} from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const managedUsersContext = await getManagedUsersContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as {
      action?: string;
      banExpiresAt?: string;
      banReason?: string;
    };

    if (payload.action === "revoke-sessions") {
      const result = await revokeManagedUserSessionsAccess(managedUsersContext, id);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (payload.action === "unban") {
      const result = await unbanManagedUserAccount(managedUsersContext, id);
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (payload.action === "ban") {
      const result = await banManagedUserAccount(managedUsersContext, {
        banExpiresAt: payload.banExpiresAt ?? "",
        banReason: payload.banReason ?? "",
        userId: id,
      } satisfies BanManagedUserInput);

      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    return NextResponse.json(
      { ok: false, message: "The requested user action is invalid." },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof AdminUsersAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The user action could not be completed." },
      { status: 500 },
    );
  }
}
