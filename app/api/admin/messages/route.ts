import { NextResponse } from "next/server";

import {
  AdminMessagesAccessError,
  getAdminMessagesContext,
  getInboxMessages,
  MessagesStorageError,
} from "@/lib/messages";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await getAdminMessagesContext(request.headers);
    const messages = await getInboxMessages();

    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof AdminMessagesAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof MessagesStorageError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "The inbox could not be loaded right now." },
      { status: 500 },
    );
  }
}
