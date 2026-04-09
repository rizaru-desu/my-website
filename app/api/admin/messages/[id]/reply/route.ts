import { NextResponse } from "next/server";

import {
  AdminMessagesAccessError,
  getAdminMessagesContext,
  sendInboxMessageReply,
} from "@/lib/messages";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await getAdminMessagesContext(request.headers);
    const { id } = await context.params;
    const payload = (await request.json()) as {
      body?: string;
      subject?: string;
    };

    const result = await sendInboxMessageReply(id, {
      body: payload.body ?? "",
      subject: payload.subject ?? "",
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminMessagesAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The reply could not be sent right now." },
      { status: 500 },
    );
  }
}
