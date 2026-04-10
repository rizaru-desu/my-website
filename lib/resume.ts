import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { education, experiences } from "@/lib/mock-content";
import { hasPersistedProfileContentCoverage } from "@/lib/profile";
import { hasPersistedSkillsCoverage } from "@/lib/skills";
import {
  isMissingCvDownloadLogTableError,
  isMissingResumeAssetTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  type AdminResumeAssetRecord,
  type ResumeAssetActionResult,
} from "@/lib/resume.shared";
import {
  BOT_USER_AGENT_PATTERN,
  VISITOR_ANALYTICS_TIMEZONE,
} from "@/lib/visitor-analytics";
import { resumeAssetSchema } from "@/lib/validations/resume-asset.schema";

type ResumeDownloadSummaryRow = {
  currentTotal: number | bigint | string | null;
  previousTotal: number | bigint | string | null;
};

type ResumeDownloadDailyRow = {
  dayKey: string;
  downloads: number | bigint | string;
};

type DashboardResumeDownloadAnalytics = {
  change: string;
  description: string;
  isEmpty: boolean;
  points: Array<{
    dateKey: string;
    label: string;
    value: number;
  }>;
  summary: string;
};

type DashboardResumeSyncMetric = {
  change: string;
  note: string;
  value: string;
};

type ResumeDownloadRedirect =
  | {
      ok: true;
      location: string;
    }
  | {
      ok: false;
      location: string;
    };

type StoredResumeAsset = {
  createdAt: Date;
  downloadUrl: string;
  fileName: string | null;
  fileSizeBytes: number | null;
  id: string;
  mimeType: string;
  storageKey: string;
  updatedAt: Date;
};

const RESUME_DOWNLOAD_ANALYTICS_DAYS = 7;
const RESUME_DOWNLOAD_DEDUP_TTL_SECONDS = 24 * 60 * 60;
const PRIMARY_RESUME_STORAGE_KEY = "primary";
const resumeAdminRoles = ["architect"] as const;

const resumeAssetModel = (prisma as typeof prisma & {
  resumeAsset: {
    delete: (args: unknown) => Promise<StoredResumeAsset>;
    findUnique: (args: unknown) => Promise<StoredResumeAsset | null>;
    upsert: (args: unknown) => Promise<StoredResumeAsset>;
  };
}).resumeAsset;

export class AdminResumeAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminResumeAccessError";
    this.status = status;
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

function isResumeAdminRole(role: string | null | undefined) {
  if (!role) {
    return false;
  }

  return resumeAdminRoles.includes(role as (typeof resumeAdminRoles)[number]);
}

function getAnalyticsHashSalt() {
  return process.env.ANALYTICS_HASH_SALT?.trim() ?? "";
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

  return {
    token,
    url,
  };
}

function hasResumeDedupConfig() {
  const { token, url } = getUpstashConfig();
  return Boolean(token && url && getAnalyticsHashSalt());
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

function formatDownloadChange(current: number, previous: number, days: number) {
  if (previous === 0) {
    return current > 0 ? `New vs prev ${days}d` : "Awaiting downloads";
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

function buildEmptyResumeDownloadAnalytics(
  days = RESUME_DOWNLOAD_ANALYTICS_DAYS,
): DashboardResumeDownloadAnalytics {
  return {
    change: "Awaiting downloads",
    description:
      "Tracked CV downloads will appear here once the public resume route starts sending real download requests through the server.",
    isEmpty: true,
    points: getJakartaDateRange(days).dayKeys.map((dayKey) => ({
      dateKey: dayKey,
      label: formatJakartaDayLabel(dayKey),
      value: 0,
    })),
    summary: "0 downloads",
  };
}

function hashAnalyticsValue(value: string) {
  return createHash("sha256")
    .update(`${getAnalyticsHashSalt()}:${value}`)
    .digest("hex");
}

function resolveClientIp(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("fly-client-ip") ||
    "unknown"
  );
}

async function runUpstashCommand(command: string[]) {
  const { token, url } = getUpstashConfig();

  if (!url || !token) {
    throw new Error("Upstash Redis is not configured.");
  }

  const response = await fetch(`${url}/pipeline`, {
    body: JSON.stringify([command]),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("The resume download dedup store could not be reached.");
  }

  const payload = (await response.json()) as Array<{
    error?: string;
    result?: number | string | null;
  }>;

  const result = payload[0];

  if (result?.error) {
    throw new Error(result.error);
  }

  return result?.result;
}

function getResumeDownloadUrlFromEnv() {
  const explicitUrl = process.env.RESUME_DOWNLOAD_URL?.trim();

  if (!explicitUrl) {
    return null;
  }

  return explicitUrl;
}

function hasExperienceResumeCoverage() {
  return (
    experiences.length > 0 &&
    experiences.every(
      (item) =>
        item.role.trim() &&
        item.company.trim() &&
        item.period.trim() &&
        item.summary.trim(),
    )
  );
}

function hasEducationResumeCoverage() {
  return (
    education.length > 0 &&
    education.every(
      (item) =>
        item.degree.trim() &&
        item.school.trim() &&
        item.period.trim() &&
        item.description.trim(),
    )
  );
}

function inferResumeFileName(downloadUrl: string) {
  try {
    const pathname = new URL(
      downloadUrl.startsWith("/") ? `https://portfolio.local${downloadUrl}` : downloadUrl,
    ).pathname;
    const segment = pathname.split("/").filter(Boolean).at(-1)?.trim();

    if (segment) {
      return decodeURIComponent(segment);
    }
  } catch {
    // ignore invalid URL parsing and fall back
  }

  return "resume.pdf";
}

function toAdminResumeRecord(asset: StoredResumeAsset): AdminResumeAssetRecord {
  return {
    downloadUrl: asset.downloadUrl,
    fileName: asset.fileName,
    fileSizeBytes: asset.fileSizeBytes,
    id: asset.id,
    mimeType: asset.mimeType,
    source: "database",
    updatedAt: normalizeDate(asset.updatedAt),
  };
}

function getFallbackResumeRecord(): AdminResumeAssetRecord {
  const envDownloadUrl = getResumeDownloadUrlFromEnv();

  if (!envDownloadUrl) {
    return {
      downloadUrl: null,
      fileName: null,
      fileSizeBytes: null,
      id: null,
      mimeType: null,
      source: "none",
      updatedAt: null,
    };
  }

  return {
    downloadUrl: envDownloadUrl,
    fileName: inferResumeFileName(envDownloadUrl),
    fileSizeBytes: null,
    id: null,
    mimeType: "application/pdf",
    source: "env",
    updatedAt: null,
  };
}

async function getStoredResumeAsset() {
  try {
    return await resumeAssetModel.findUnique({
      where: {
        storageKey: PRIMARY_RESUME_STORAGE_KEY,
      },
    });
  } catch (error) {
    if (isMissingResumeAssetTableError(error) || isPrismaConnectionError(error)) {
      return null;
    }

    throw error;
  }
}

async function getResolvedResumeDownloadUrl() {
  const storedAsset = await getStoredResumeAsset();

  if (storedAsset?.downloadUrl) {
    return storedAsset.downloadUrl;
  }

  return getResumeDownloadUrlFromEnv();
}

function getResumeDownloadUnavailablePath(requestUrl: string) {
  const url = new URL("/resume?download=unavailable", requestUrl);
  return `${url.pathname}${url.search}`;
}

function toAbsoluteDownloadUrl(requestUrl: string, value: string) {
  return new URL(value, requestUrl).toString();
}

export async function trackResumeDownloadRequest(
  requestHeaders: Headers,
  requestUrl: string,
): Promise<ResumeDownloadRedirect> {
  const target = await getResolvedResumeDownloadUrl();

  if (!target) {
    return {
      ok: false,
      location: getResumeDownloadUnavailablePath(requestUrl),
    };
  }

  const userAgent = requestHeaders.get("user-agent")?.trim() ?? "";

  if (!userAgent || BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return {
      ok: true,
      location: toAbsoluteDownloadUrl(requestUrl, target),
    };
  }

  const ipAddress = resolveClientIp(requestHeaders);
  const ipHash = hashAnalyticsValue(`${ipAddress}|${userAgent.toLowerCase()}`);
  const referrer = requestHeaders.get("referer")?.trim() || "direct";
  const shouldDedup = hasResumeDedupConfig();

  let shouldLog = true;

  if (shouldDedup) {
    try {
      const key = `resume:download:${ipHash}:${getJakartaDayKey(new Date())}`;
      const currentCount = Number(await runUpstashCommand(["incr", key]) ?? 0);

      if (currentCount === 1) {
        await runUpstashCommand([
          "expire",
          key,
          String(RESUME_DOWNLOAD_DEDUP_TTL_SECONDS),
        ]);
      }

      shouldLog = currentCount === 1;
    } catch (error) {
      console.error("[resume.download] Dedup check failed, continuing without Redis.", error);
    }
  }

  if (shouldLog) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "cvDownloadLog" (
          "id",
          "ipHash",
          "userAgent",
          "referrer",
          "downloadedAt"
        )
        VALUES (
          ${randomUUID()},
          ${ipHash},
          ${userAgent},
          ${referrer},
          ${new Date()}
        )
      `;
    } catch (error) {
      if (
        !isMissingCvDownloadLogTableError(error) &&
        !isPrismaConnectionError(error)
      ) {
        console.error("[resume.download] Failed to log CV download.", error);
      }
    }
  }

  return {
    ok: true,
    location: toAbsoluteDownloadUrl(requestUrl, target),
  };
}

export async function getAdminResumeContext(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminResumeAccessError(401, "You must be signed in to manage resume assets.");
  }

  if (!isResumeAdminRole(session.user.role)) {
    throw new AdminResumeAccessError(403, "You are not allowed to manage resume assets.");
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
    role: session.user.role ?? "",
  };
}

export async function getAdminResumeAsset(): Promise<AdminResumeAssetRecord> {
  const storedAsset = await getStoredResumeAsset();

  if (!storedAsset) {
    return getFallbackResumeRecord();
  }

  return toAdminResumeRecord(storedAsset);
}

export async function updateAdminResumeAsset(input: {
  downloadUrl: string;
  fileName?: string;
  fileSizeBytes?: number;
  mimeType?: string;
}): Promise<ResumeAssetActionResult> {
  try {
    const values = resumeAssetSchema.parse(input);
    const nextFileName = values.fileName ?? inferResumeFileName(values.downloadUrl);

    await resumeAssetModel.upsert({
      where: {
        storageKey: PRIMARY_RESUME_STORAGE_KEY,
      },
      update: {
        downloadUrl: values.downloadUrl,
        fileName: nextFileName,
        fileSizeBytes: values.fileSizeBytes ?? null,
        mimeType: values.mimeType ?? "application/pdf",
      },
      create: {
        storageKey: PRIMARY_RESUME_STORAGE_KEY,
        downloadUrl: values.downloadUrl,
        fileName: nextFileName,
        fileSizeBytes: values.fileSizeBytes ?? null,
        mimeType: values.mimeType ?? "application/pdf",
      },
    });

    return {
      ok: true,
      message: "Resume asset saved. Public CV downloads now point to the latest configured file.",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message ?? "Please review the resume asset form.",
      };
    }

    if (isMissingResumeAssetTableError(error)) {
      return {
        ok: false,
        message: "Resume storage is not ready yet. Start the database and run `npx prisma db push` first.",
      };
    }

    if (isPrismaConnectionError(error)) {
      return {
        ok: false,
        message: "The database is not reachable right now. Make sure PostgreSQL is running, then try again.",
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
      message: "The resume asset could not be saved right now.",
    };
  }
}

export async function clearAdminResumeAsset(): Promise<ResumeAssetActionResult> {
  try {
    const existing = await getStoredResumeAsset();

    if (!existing) {
      return {
        ok: true,
        message:
          getResumeDownloadUrlFromEnv()
            ? "Stored resume asset cleared. Public downloads now fall back to the environment URL."
            : "No stored resume asset was configured.",
      };
    }

    await resumeAssetModel.delete({
      where: {
        storageKey: PRIMARY_RESUME_STORAGE_KEY,
      },
    });

    return {
      ok: true,
      message:
        getResumeDownloadUrlFromEnv()
          ? "Stored resume asset cleared. Public downloads now fall back to the environment URL."
          : "Stored resume asset cleared. Public downloads are unavailable until a new file URL is saved.",
    };
  } catch (error) {
    if (isMissingResumeAssetTableError(error) || isPrismaConnectionError(error)) {
      return {
        ok: false,
        message: "Resume storage is not ready yet. Start the database and try again.",
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
      message: "The stored resume asset could not be cleared right now.",
    };
  }
}

export async function getDashboardResumeDownloadAnalytics(
  days = RESUME_DOWNLOAD_ANALYTICS_DAYS,
): Promise<DashboardResumeDownloadAnalytics> {
  const safeDays = Math.max(1, days);
  const range = getJakartaDateRange(safeDays);
  const previousPeriodEnd = new Date(range.start);
  const previousPeriodStart = new Date(range.start);
  previousPeriodStart.setUTCDate(previousPeriodStart.getUTCDate() - safeDays);

  try {
    const [summaryRows, dailyRows] = await Promise.all([
      prisma.$queryRaw<ResumeDownloadSummaryRow[]>`
        SELECT
          COUNT(*) FILTER (
            WHERE "downloadedAt" >= ${range.start}
              AND "downloadedAt" < ${range.endExclusive}
          )::int AS "currentTotal",
          COUNT(*) FILTER (
            WHERE "downloadedAt" >= ${previousPeriodStart}
              AND "downloadedAt" < ${previousPeriodEnd}
          )::int AS "previousTotal"
        FROM "cvDownloadLog"
      `,
      prisma.$queryRaw<ResumeDownloadDailyRow[]>`
        SELECT
          TO_CHAR(("downloadedAt" AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM-DD') AS "dayKey",
          COUNT(*)::int AS "downloads"
        FROM "cvDownloadLog"
        WHERE "downloadedAt" >= ${range.start}
          AND "downloadedAt" < ${range.endExclusive}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
    ]);

    const summary = summaryRows[0];
    const currentTotal = toNumber(summary?.currentTotal);
    const previousTotal = toNumber(summary?.previousTotal);

    if (currentTotal === 0 && previousTotal === 0) {
      return buildEmptyResumeDownloadAnalytics(safeDays);
    }

    const dailyCounts = new Map(
      dailyRows.map((row) => [row.dayKey, toNumber(row.downloads)]),
    );

    return {
      change: formatDownloadChange(currentTotal, previousTotal, safeDays),
      description: `${formatCompactNumber(currentTotal)} real CV download${currentTotal === 1 ? "" : "s"} were tracked in the last ${safeDays} days through the server-side download route.`,
      isEmpty: false,
      points: range.dayKeys.map((dayKey) => ({
        dateKey: dayKey,
        label: formatJakartaDayLabel(dayKey),
        value: dailyCounts.get(dayKey) ?? 0,
      })),
      summary: `${formatCompactNumber(currentTotal)} downloads`,
    };
  } catch (error) {
    if (isMissingCvDownloadLogTableError(error) || isPrismaConnectionError(error)) {
      return buildEmptyResumeDownloadAnalytics(safeDays);
    }

    throw error;
  }
}

export async function getDashboardResumeSyncMetric(): Promise<DashboardResumeSyncMetric> {
  const [resumeAsset, hasProfileCoverage, hasSkillsCoverage] = await Promise.all([
    getAdminResumeAsset(),
    hasPersistedProfileContentCoverage(),
    hasPersistedSkillsCoverage(),
  ]);

  const checks = [
    {
      label: "resume asset",
      passed: resumeAsset.source === "database",
      partial: resumeAsset.source === "env",
      weight: 30,
    },
    {
      label: "profile",
      passed: hasProfileCoverage,
      partial: false,
      weight: 25,
    },
    {
      label: "experience",
      passed: hasExperienceResumeCoverage(),
      partial: false,
      weight: 20,
    },
    {
      label: "education",
      passed: hasEducationResumeCoverage(),
      partial: false,
      weight: 10,
    },
    {
      label: "skills",
      passed: hasSkillsCoverage,
      partial: false,
      weight: 15,
    },
  ];

  const score = checks.reduce((total, check) => {
    if (check.passed) {
      return total + check.weight;
    }

    if (check.partial) {
      return total + Math.round(check.weight * 0.65);
    }

    return total;
  }, 0);

  const missing = checks.filter((check) => !check.passed && !check.partial);

  if (score >= 100) {
    return {
      change: "Database live",
      note: "Public profile, skills, education, experience, and CV delivery are aligned.",
      value: "100%",
    };
  }

  if (resumeAsset.source === "env" && missing.length === 0) {
    return {
      change: "Env fallback",
      note: "Resume content is aligned, but the CV file still relies on the environment fallback.",
      value: `${score}%`,
    };
  }

  return {
    change: missing.length > 0 ? `${missing.length} gaps left` : "Needs review",
    note:
      missing.length > 0
        ? `Finish ${missing.map((item) => item.label).join(", ")} coverage to fully align the resume workflow.`
        : "Resume content exists, but the delivery setup still needs a final review.",
    value: `${score}%`,
  };
}
