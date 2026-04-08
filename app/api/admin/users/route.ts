import { NextResponse } from "next/server";

import {
  AdminUsersAccessError,
  getManagedUsers,
  getManagedUsersContext,
} from "@/lib/admin-users";

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
