import type {
  MessageActionResult,
  MessageRecord,
  MessageReplyInput,
  MessageStatusValue,
} from "@/lib/messages.shared";

export const adminMessagesQueryKey = ["admin-messages", "list"] as const;

async function readActionResult(
  response: Response,
  fallback: string,
): Promise<MessageActionResult> {
  try {
    const payload = (await response.json()) as Partial<MessageActionResult>;

    if (typeof payload.message === "string") {
      return {
        ok: Boolean(payload.ok),
        message: payload.message,
      } as MessageActionResult;
    }
  } catch {
    // ignore invalid payloads
  }

  return {
    ok: false,
    message: fallback,
  };
}

export async function fetchAdminMessages(): Promise<MessageRecord[]> {
  const response = await fetch("/api/admin/messages", {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    const result = await readActionResult(response, "The inbox could not be loaded right now.");
    throw new Error(result.message);
  }

  return (await response.json()) as MessageRecord[];
}

export async function updateAdminMessageStatus(input: {
  id: string;
  status: MessageStatusValue;
}) {
  const response = await fetch(`/api/admin/messages/${input.id}`, {
    body: JSON.stringify({
      status: input.status,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  const result = await readActionResult(
    response,
    "The message status could not be updated.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function sendAdminMessageReply(input: {
  id: string;
  reply: MessageReplyInput;
}) {
  const response = await fetch(`/api/admin/messages/${input.id}/reply`, {
    body: JSON.stringify(input.reply),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = await readActionResult(
    response,
    "The reply could not be sent right now.",
  );

  if (!response.ok || !result.ok) {
    throw new Error(result.message);
  }

  return result;
}
