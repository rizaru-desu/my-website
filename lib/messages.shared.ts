export const messageStatusValues = ["UNREAD", "READ", "ARCHIVED"] as const;

export type MessageStatusValue = (typeof messageStatusValues)[number];

export type MessageFilter = "all" | "unread" | "archived";

export type MessageActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type MessageReplyInput = {
  body: string;
  subject: string;
};

export type MessageRecord = {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  status: MessageStatusValue;
  createdAt: string;
  readAt: string | null;
  archivedAt: string | null;
};

export function getMessagePreview(body: string) {
  const collapsed = body.replace(/\s+/g, " ").trim();

  if (collapsed.length <= 120) {
    return collapsed;
  }

  return `${collapsed.slice(0, 117).trimEnd()}...`;
}

export function formatMessageDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isMessageUnread(status: MessageStatusValue) {
  return status === "UNREAD";
}

export function isMessageArchived(status: MessageStatusValue) {
  return status === "ARCHIVED";
}

export function getMessageStatusLabel(status: MessageStatusValue) {
  if (status === "UNREAD") {
    return "Unread";
  }

  if (status === "ARCHIVED") {
    return "Archived";
  }

  return "Read";
}

export function getMessageStatusSummary(status: MessageStatusValue) {
  if (status === "UNREAD") {
    return "Needs review";
  }

  if (status === "ARCHIVED") {
    return "Filed away";
  }

  return "Opened";
}

export function normalizeReplySubject(subject: string) {
  const trimmed = subject.trim();

  if (!trimmed) {
    return "";
  }

  return /^re:/i.test(trimmed) ? trimmed : `Re: ${trimmed}`;
}

export function getNextMessageState(
  currentStatus: MessageStatusValue,
  nextStatus: MessageStatusValue,
  now = new Date(),
) {
  if (currentStatus === nextStatus) {
    return {
      archivedAt: undefined,
      readAt: undefined,
      status: nextStatus,
    };
  }

  if (nextStatus === "UNREAD") {
    if (currentStatus !== "READ") {
      throw new Error("Only read messages can return to unread.");
    }

    return {
      archivedAt: null,
      readAt: null,
      status: nextStatus,
    };
  }

  if (nextStatus === "READ") {
    if (currentStatus !== "UNREAD" && currentStatus !== "ARCHIVED") {
      throw new Error("This message is already marked as read.");
    }

    return {
      archivedAt: null,
      readAt: now,
      status: nextStatus,
    };
  }

  if (currentStatus === "ARCHIVED") {
    throw new Error("Archived messages must be restored before any other status change.");
  }

  return {
    archivedAt: now,
    readAt: now,
    status: nextStatus,
  };
}
