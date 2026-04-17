import { NextResponse } from "next/server";

import {
  AdminMessagesAccessError,
  getAdminMessagesContext,
  updateInboxMessageStatus,
} from "@/lib/messages";
import { messageStatusValues } from "@/lib/messages.shared";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await getAdminMessagesContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as { status?: string };

    if (!payload.status || !messageStatusValues.includes(payload.status as never)) {
      return NextResponse.json(
        { message: "The next message status is invalid." },
        { status: 400 },
      );
    }

    const nextStatus = payload.status as (typeof messageStatusValues)[number];
    const result = await updateInboxMessageStatus(id, nextStatus);

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminMessagesAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The message status could not be updated." },
      { status: 500 },
    );
  }
}
