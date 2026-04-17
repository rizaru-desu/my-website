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
import { VISITOR_ANALYTICS_TIMEZONE } from "@/lib/visitor-analytics.shared";
import { messageReplySchema } from "@/lib/validations/message-reply.schema";

type AdminMessagesContext = {
  currentUserId: string;
  headers: Headers;
};

type MessageAnalyticsSummaryRow = {
  archivedTotal: number | bigint | string | null;
  currentTotal: number | bigint | string | null;
  inboxTotal: number | bigint | string | null;
  previousTotal: number | bigint | string | null;
  readTotal: number | bigint | string | null;
  unreadTotal: number | bigint | string | null;
};

type MessageAnalyticsDailyRow = {
  dayKey: string;
  messages: number | bigint | string;
};

export type DashboardMessageAnalyticsResult = DashboardMessageAnalytics;

type DashboardMessageAnalytics = {
  breakdown: Array<{
    accent: "cream" | "blue" | "red";
    label: string;
    note: string;
    value: string;
  }>;
  change: string;
  description: string;
  isEmpty: boolean;
  metric: {
    change: string;
    note: string;
    value: string;
  };
  points: Array<{
    dateKey: string;
    label: string;
    value: number;
  }>;
  summary: string;
};

const MESSAGE_ANALYTICS_DAYS = 7;

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

function toNumber(value: number | bigint | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string" && value) {
    return Number(value);
  }

  return 0;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 1_000 ? 1 : 0,
    notation: value >= 1_000 ? "compact" : "standard",
  }).format(value);
}

function formatMetricValue(value: number) {
  if (value < 100) {
    return String(value).padStart(2, "0");
  }

  return formatCompactNumber(value);
}

function formatPeriodChange(current: number, previous: number, days: number) {
  if (previous === 0) {
    return current > 0 ? `New vs prev ${days}d` : "Awaiting inbox activity";
  }

  const delta = ((current - previous) / previous) * 100;

  if (Math.abs(delta) < 0.5) {
    return `Flat vs prev ${days}d`;
  }

  const rounded = Math.abs(delta) < 10 ? delta.toFixed(1) : Math.round(delta).toString();
  return `${delta > 0 ? "+" : ""}${rounded}% vs prev ${days}d`;
}

function getJakartaDayFormatter() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: VISITOR_ANALYTICS_TIMEZONE,
    year: "numeric",
  });
}

function getJakartaLabelFormatter() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: VISITOR_ANALYTICS_TIMEZONE,
  });
}

function getJakartaDayKey(date: Date) {
  const parts = getJakartaDayFormatter().formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function getJakartaDayDate(dayKey: string) {
  return new Date(`${dayKey}T00:00:00+07:00`);
}

function formatJakartaDayLabel(dayKey: string) {
  return getJakartaLabelFormatter().format(getJakartaDayDate(dayKey));
}

function getJakartaDateRange(days: number, referenceDate = new Date()) {
  const safeDays = Math.max(1, days);
  const lastDayKey = getJakartaDayKey(referenceDate);
  const currentDayStart = getJakartaDayDate(lastDayKey);
  const start = new Date(currentDayStart);
  start.setUTCDate(start.getUTCDate() - (safeDays - 1));

  const endExclusive = new Date(currentDayStart);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  const dayKeys: string[] = [];

  for (let index = 0; index < safeDays; index += 1) {
    const current = new Date(start);
    current.setUTCDate(current.getUTCDate() + index);
    dayKeys.push(getJakartaDayKey(current));
  }

  return {
    dayKeys,
    endExclusive,
    start,
  };
}

function buildEmptyDashboardMessageAnalytics(
  days = MESSAGE_ANALYTICS_DAYS,
): DashboardMessageAnalytics {
  return {
    breakdown: [
      {
        accent: "red",
        label: "Unread",
        note: "Needs review",
        value: "0",
      },
      {
        accent: "blue",
        label: "Read",
        note: "Opened",
        value: "0",
      },
      {
        accent: "cream",
        label: "Archived",
        note: "Filed away",
        value: "0",
      },
    ],
    change: "Awaiting inbox activity",
    description:
      "Public contact submissions will start drawing a live message trend after the first valid note reaches the inbox.",
    isEmpty: true,
    metric: {
      change: "Inbox idle",
      note: "New recruiter and collaborator outreach will surface here automatically.",
      value: "00",
    },
    points: getJakartaDateRange(days).dayKeys.map((dayKey) => ({
      dateKey: dayKey,
      label: formatJakartaDayLabel(dayKey),
      value: 0,
    })),
    summary: "0 new msgs",
  };
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

export async function getDashboardMessageAnalytics(
  days = MESSAGE_ANALYTICS_DAYS,
): Promise<DashboardMessageAnalytics> {
  const safeDays = Math.max(1, days);
  const range = getJakartaDateRange(safeDays);
  const previousPeriodEnd = new Date(range.start);
  const previousPeriodStart = new Date(range.start);
  previousPeriodStart.setUTCDate(previousPeriodStart.getUTCDate() - safeDays);

  try {
    const [summaryRows, dailyRows] = await Promise.all([
      prisma.$queryRaw<MessageAnalyticsSummaryRow[]>`
        SELECT
          COUNT(*) FILTER (
            WHERE "createdAt" >= ${range.start}
              AND "createdAt" < ${range.endExclusive}
          )::int AS "currentTotal",
          COUNT(*) FILTER (
            WHERE "createdAt" >= ${previousPeriodStart}
              AND "createdAt" < ${previousPeriodEnd}
          )::int AS "previousTotal",
          COUNT(*) FILTER (WHERE "status" = 'UNREAD')::int AS "unreadTotal",
          COUNT(*) FILTER (WHERE "status" = 'READ')::int AS "readTotal",
          COUNT(*) FILTER (WHERE "status" = 'ARCHIVED')::int AS "archivedTotal",
          COUNT(*)::int AS "inboxTotal"
        FROM "message"
      `,
      prisma.$queryRaw<MessageAnalyticsDailyRow[]>`
        SELECT
          TO_CHAR(("createdAt" AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM-DD') AS "dayKey",
          COUNT(*)::int AS "messages"
        FROM "message"
        WHERE "createdAt" >= ${range.start}
          AND "createdAt" < ${range.endExclusive}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    const summary = summaryRows[0];
    const currentTotal = toNumber(summary?.currentTotal);
    const previousTotal = toNumber(summary?.previousTotal);
    const unreadTotal = toNumber(summary?.unreadTotal);
    const readTotal = toNumber(summary?.readTotal);
    const archivedTotal = toNumber(summary?.archivedTotal);
    const inboxTotal = toNumber(summary?.inboxTotal);

    if (currentTotal === 0 && previousTotal === 0 && inboxTotal === 0) {
      return buildEmptyDashboardMessageAnalytics(safeDays);
    }

    const dailyCounts = new Map(
      dailyRows.map((row) => [row.dayKey, toNumber(row.messages)]),
    );

    return {
      breakdown: [
        {
          accent: "red",
          label: "Unread",
          note: "Needs review",
          value: formatCompactNumber(unreadTotal),
        },
        {
          accent: "blue",
          label: "Read",
          note: "Opened",
          value: formatCompactNumber(readTotal),
        },
        {
          accent: "cream",
          label: "Archived",
          note: "Filed away",
          value: formatCompactNumber(archivedTotal),
        },
      ],
      change: formatPeriodChange(currentTotal, previousTotal, safeDays),
      description: `${formatCompactNumber(inboxTotal)} total inbox messages right now, with ${formatCompactNumber(unreadTotal)} unread, ${formatCompactNumber(readTotal)} read, and ${formatCompactNumber(archivedTotal)} archived.`,
      isEmpty: false,
      metric: {
        change:
          unreadTotal > 0
            ? `${formatCompactNumber(unreadTotal)} unread now`
            : inboxTotal > 0
              ? "All caught up"
              : "Inbox idle",
        note:
          currentTotal > 0
            ? `${formatCompactNumber(currentTotal)} new message${currentTotal === 1 ? "" : "s"} landed in the last ${safeDays} days.`
            : "No new inbound messages landed during this window.",
        value: formatMetricValue(unreadTotal),
      },
      points: range.dayKeys.map((dayKey) => ({
        dateKey: dayKey,
        label: formatJakartaDayLabel(dayKey),
        value: dailyCounts.get(dayKey) ?? 0,
      })),
      summary: `${formatCompactNumber(currentTotal)} new msgs`,
    };
  } catch (error) {
    if (isMissingMessageTableError(error) || isPrismaConnectionError(error)) {
      return buildEmptyDashboardMessageAnalytics(safeDays);
    }

    throw error;
  }
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
