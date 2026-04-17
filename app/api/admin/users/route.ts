import { NextResponse } from "next/server";

import {
  AdminUsersAccessError,
  createManagedUserAccount,
  getManagedUsers,
  getManagedUsersContext,
} from "@/lib/admin-users";
import type { CreateManagedUserInput } from "@/app/admin/users/users-management.shared";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const context = await getManagedUsersContext(request.headers);
    const users = await getManagedUsers(context);

    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof AdminUsersAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The user directory could not be loaded." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const context = await getManagedUsersContext(request.headers);
    const payload = (await request.json()) as Partial<CreateManagedUserInput>;
    const result = await createManagedUserAccount(context, {
      email: payload.email ?? "",
      name: payload.name ?? "",
      password: payload.password ?? "",
      role: (payload.role ?? "") as CreateManagedUserInput["role"],
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminUsersAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The user account could not be created." },
      { status: 500 },
    );
  }
}
