import "server-only";

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { sendAppEmail } from "@/lib/mailer";
import {
  isMissingMessageTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  getMessageStatusLabel,
  getNextMessageState,
  normalizeReplySubject,
  type MessageActionResult,
  type MessageRecord,
  type MessageStatusValue,
} from "@/lib/messages.shared";
import { messageReplySchema } from "@/lib/validations/message-reply.schema";

type AdminMessagesContext = {
  currentUserId: string;
  headers: Headers;
};

export class AdminMessagesAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminMessagesAccessError";
    this.status = status;
  }
}

export class MessagesStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessagesStorageError";
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export async function getAdminMessagesContext(
  requestHeaders: Headers,
): Promise<AdminMessagesContext> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminMessagesAccessError(401, "You must be signed in to review messages.");
  }

  if (session.user.role !== "architect") {
    throw new AdminMessagesAccessError(403, "You are not allowed to review messages.");
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
  };
}

export async function getInboxMessages(): Promise<MessageRecord[]> {
  let messages;

  try {
    messages = await prisma.message.findMany({
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
  } catch (error) {
    if (isMissingMessageTableError(error)) {
      throw new MessagesStorageError(
        "Message storage is not ready yet. Start the database and run `npx prisma db push` first.",
      );
    }

    if (isPrismaConnectionError(error)) {
      throw new MessagesStorageError(
        "The database is not reachable right now. Make sure PostgreSQL is running, then reload the inbox.",
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.message) {
      throw new MessagesStorageError(error.message);
    }

    if (error instanceof Error && error.message) {
      throw new MessagesStorageError(error.message);
    }

    throw new MessagesStorageError("The inbox could not be loaded right now.");
  }

  return messages.map((message) => ({
    archivedAt: normalizeDate(message.archivedAt),
    body: message.body,
    createdAt: normalizeDate(message.createdAt) ?? new Date(0).toISOString(),
    id: message.id,
    readAt: normalizeDate(message.readAt),
    senderEmail: message.senderEmail,
    senderName: message.senderName,
    status: message.status,
    subject: message.subject,
  }));
}

export async function updateInboxMessageStatus(
  messageId: string,
  nextStatus: MessageStatusValue,
): Promise<MessageActionResult> {
  if (!messageId.trim()) {
    return {
      ok: false,
      message: "The selected message is missing.",
    };
  }

  try {
    const currentMessage = await prisma.message.findUnique({
      select: {
        id: true,
        status: true,
      },
      where: {
        id: messageId,
      },
    });

    if (!currentMessage) {
      return {
        ok: false,
        message: "That message could not be found anymore.",
      };
    }

    const nextState = getNextMessageState(currentMessage.status, nextStatus);

    if (currentMessage.status !== nextStatus) {
      await prisma.message.update({
        data: nextState,
        where: {
          id: currentMessage.id,
        },
      });
    }

    return {
      ok: true,
      message: `Message marked as ${getMessageStatusLabel(nextStatus).toLowerCase()}.`,
    };
  } catch (error) {
    if (error instanceof Error && error.message) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "The message status could not be updated.",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReplyEmailHtml(subject: string, body: string) {
  return `
    <div style="background:#dce8ff;padding:32px 16px;font-family:'Space Grotesk',Arial,sans-serif;">
      <div style="margin:0 auto;max-width:680px;border:3px solid #111111;border-radius:28px;background:#fffdf4;padding:32px;box-shadow:8px 8px 0 #111111;">
        <p style="margin:0 0 12px;color:#5b6470;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">Portfolio Reply</p>
        <h1 style="margin:0 0 16px;color:#111111;font-family:'Archivo Black',Arial,sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase;">${escapeHtml(subject)}</h1>
        ${body
          .split(/\n{2,}/)
          .map(
            (paragraph) =>
              `<p style="margin:0 0 16px;color:#1f2937;font-size:16px;line-height:1.7;">${escapeHtml(paragraph)}</p>`,
          )
          .join("")}
      </div>
    </div>
  `;
}

export async function sendInboxMessageReply(
  messageId: string,
  input: {
    body: string;
    subject: string;
  },
): Promise<MessageActionResult> {
  if (!messageId.trim()) {
    return {
      ok: false,
      message: "The selected message is missing.",
    };
  }

  try {
    const values = messageReplySchema.parse(input);

    const message = await prisma.message.findUnique({
      select: {
        id: true,
        senderEmail: true,
        status: true,
        subject: true,
      },
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return {
        ok: false,
        message: "That message could not be found anymore.",
      };
    }

    const replySubject = normalizeReplySubject(values.subject);
    const delivery = await sendAppEmail({
      html: buildReplyEmailHtml(replySubject, values.body),
      replyTo: undefined,
      subject: replySubject,
      text: values.body,
      to: message.senderEmail,
    });

    if (!delivery.ok) {
      return {
        ok: false,
        message:
          "SMTP is not configured yet. Add the Gmail mailer env vars before sending replies.",
      };
    }

    const nextState = getNextMessageState(message.status, "READ");

    await prisma.message.update({
      data: nextState,
      where: {
        id: message.id,
      },
    });

    return {
      ok: true,
      message: `Reply sent to ${message.senderEmail}.`,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Please review the reply draft.",
      };
    }

    if (error instanceof Error && error.message) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: false,
      message: "The reply could not be sent right now.",
    };
  }
}
