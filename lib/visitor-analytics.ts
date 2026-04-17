import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  VISITOR_ANALYTICS_DAYS,
  VISITOR_ANALYTICS_TIMEZONE,
  VISITOR_COOKIE_NAME,
  formatTrackedPathLabel,
  getReferrerSourceLabel,
  isTrackedPublicPath,
  normalizeTrackedPath,
  type DashboardVisitorAnalytics,
  type ReferrerSource,
  type TopPageMetric,
  type TrafficSourceBreakdown,
  type VisitorSeriesPoint,
} from "@/lib/visitor-analytics.shared";

const BOT_USER_AGENT_PATTERN =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|wget|curl|python|scrapy|headlesschrome|rendertron|facebookexternalhit|linkedinbot|whatsapp/i;

const SEARCH_HOST_PATTERN =
  /(^|\.)google\.|(^|\.)bing\.|(^|\.)duckduckgo\.|(^|\.)yahoo\.|(^|\.)baidu\.|(^|\.)yandex\./i;

const LINKEDIN_HOST_PATTERN = /(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/i;
const GITHUB_HOST_PATTERN = /(^|\.)github\.com$/i;

const ANALYTICS_DEBOUNCE_TTL_SECONDS = 30;
const ANALYTICS_UNIQUE_TTL_SECONDS = 24 * 60 * 60;

type TrackVisitPayload = {
  documentReferrer?: string | null;
  path: string;
  referrerPath?: string | null;
};

type PreparedVisitorTracking = {
  dayKey: string;
  documentReferrer: string | null;
  ipHash: string;
  path: string;
  referrer: string;
  referrerSource: ReferrerSource;
  userAgent: string;
  visitorId: string;
  visitedAt: Date;
};

type SummaryRow = {
  currentPageViews: number | bigint | string | null;
  currentUniqueVisitors: number | bigint | string | null;
  prevUniqueVisitors: number | bigint | string | null;
};

type DailyRow = {
  dayKey: string;
  pageViews: number | bigint | string;
  uniqueVisitors: number | bigint | string;
};

type SourceRow = {
  count: number | bigint | string;
  source: string;
};

type TopPageRow = {
  path: string;
  views: number | bigint | string;
};

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

function hasTrackingConfig() {
  const { token, url } = getUpstashConfig();
  return Boolean(url && token && getAnalyticsHashSalt());
}

function hashAnalyticsValue(value: string) {
  return createHash("sha256")
    .update(`${getAnalyticsHashSalt()}:${value}`)
    .digest("hex");
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

function formatVisitorsChange(current: number, previous: number, days: number) {
  if (previous === 0) {
    return current > 0 ? `New vs prev ${days}d` : "No change yet";
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

function buildFallbackVisitorId(ipHash: string) {
  return `v_${ipHash.slice(0, 32)}`;
}

function normalizeReferrer(
  documentReferrer: string | null,
  referrerPath: string | null,
  siteOrigin: string,
) {
  if (!documentReferrer) {
    return "direct";
  }

  try {
    const referrerUrl = new URL(documentReferrer);

    if (referrerUrl.origin === siteOrigin) {
      return referrerPath ? normalizeTrackedPath(referrerPath) : "direct";
    }

    return `${referrerUrl.origin}${referrerUrl.pathname}` || referrerUrl.origin;
  } catch {
    return "direct";
  }
}

function classifyReferrerSource(
  documentReferrer: string | null,
  siteOrigin: string,
): ReferrerSource {
  if (!documentReferrer) {
    return "direct";
  }

  try {
    const referrerUrl = new URL(documentReferrer);
    const hostname = referrerUrl.hostname.toLowerCase();

    if (referrerUrl.origin === siteOrigin) {
      return "direct";
    }

    if (LINKEDIN_HOST_PATTERN.test(hostname)) {
      return "linkedin";
    }

    if (GITHUB_HOST_PATTERN.test(hostname)) {
      return "github";
    }

    if (SEARCH_HOST_PATTERN.test(hostname)) {
      return "search";
    }

    return "other";
  } catch {
    return "direct";
  }
}

function isMissingVisitorLogTableError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2010" && String(error.meta?.code ?? "").includes("42P01");
  }

  return (
    error instanceof Error &&
    /42P01|VisitorLog|visitorLog|relation .* does not exist|table .* does not exist/i.test(
      error.message,
    )
  );
}

async function runUpstashCommand(command: string[]) {
  const { token, url } = getUpstashConfig();

  if (!token || !url) {
    throw new Error("Upstash Redis is not configured for visitor analytics.");
  }

  const commandPath = command.map((segment) => encodeURIComponent(segment)).join("/");
  const response = await fetch(`${url}/${commandPath}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: "POST",
  });

  const payload = (await response.json()) as { error?: string; result?: unknown };

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "The Redis analytics command failed.");
  }

  return payload.result;
}

async function incrementKeyWithExpiry(key: string, ttlSeconds: number) {
  const result = await runUpstashCommand(["incr", key]);
  const count = Number(result ?? 0);

  if (count === 1) {
    await runUpstashCommand(["expire", key, String(ttlSeconds)]);
  }

  return count;
}

async function deleteTrackingKeys(keys: string[]) {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));

  if (uniqueKeys.length === 0) {
    return;
  }

  await runUpstashCommand(["del", ...uniqueKeys]);
}

function buildDebounceKey(visitorId: string, path: string) {
  return `analytics:visit:debounce:${visitorId}:${path}`;
}

function buildUniqueDailyKey(visitorId: string, dayKey: string) {
  return `analytics:visit:unique:${visitorId}:${dayKey}`;
}

export function prepareVisitorTracking(
  payload: TrackVisitPayload,
  {
    cookieVisitorId,
    requestHeaders,
    requestUrl,
  }: {
    cookieVisitorId: string | null;
    requestHeaders: Headers;
    requestUrl: string;
  },
): PreparedVisitorTracking | null {
  if (!hasTrackingConfig()) {
    return null;
  }

  const normalizedPath = normalizeTrackedPath(payload.path);

  if (!isTrackedPublicPath(normalizedPath)) {
    return null;
  }

  const userAgent = requestHeaders.get("user-agent")?.trim() ?? "";

  if (!userAgent || BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return null;
  }

  const siteOrigin = new URL(requestUrl).origin;
  const ipAddress = resolveClientIp(requestHeaders);
  const ipHash = hashAnalyticsValue(`${ipAddress}|${userAgent.toLowerCase()}`);
  const visitorId = cookieVisitorId?.trim() || buildFallbackVisitorId(ipHash);
  const visitedAt = new Date();

  return {
    dayKey: getJakartaDayKey(visitedAt),
    documentReferrer: payload.documentReferrer?.trim() || null,
    ipHash,
    path: normalizedPath,
    referrer: normalizeReferrer(
      payload.documentReferrer?.trim() || null,
      payload.referrerPath?.trim() || null,
      siteOrigin,
    ),
    referrerSource: classifyReferrerSource(
      payload.documentReferrer?.trim() || null,
      siteOrigin,
    ),
    userAgent,
    visitorId,
    visitedAt,
  };
}

export async function writePreparedVisitorTracking(prepared: PreparedVisitorTracking) {
  const debounceKey = buildDebounceKey(prepared.visitorId, prepared.path);
  const debounceCount = await incrementKeyWithExpiry(
    debounceKey,
    ANALYTICS_DEBOUNCE_TTL_SECONDS,
  );

  if (debounceCount > 1) {
    return {
      tracked: false,
      visitorId: prepared.visitorId,
    } as const;
  }

  const uniqueDailyKey = buildUniqueDailyKey(prepared.visitorId, prepared.dayKey);
  const uniqueDailyCount = await incrementKeyWithExpiry(
    uniqueDailyKey,
    ANALYTICS_UNIQUE_TTL_SECONDS,
  );
  const isUniqueDailyVisitor = uniqueDailyCount === 1;

  try {
    const logId = randomUUID();

    await prisma.$executeRaw`
      INSERT INTO "visitorLog" (
        "id",
        "visitorId",
        "ipHash",
        "path",
        "referrer",
        "referrerSource",
        "userAgent",
        "isUniqueDailyVisitor",
        "visitedAt"
      )
      VALUES (
        ${logId},
        ${prepared.visitorId},
        ${prepared.ipHash},
        ${prepared.path},
        ${prepared.referrer},
        ${prepared.referrerSource},
        ${prepared.userAgent},
        ${isUniqueDailyVisitor},
        ${prepared.visitedAt}
      )
    `;
  } catch (error) {
    try {
      await deleteTrackingKeys([
        debounceCount === 1 ? debounceKey : "",
        uniqueDailyCount === 1 ? uniqueDailyKey : "",
      ]);
    } catch (rollbackError) {
      console.error("Visitor analytics rollback failed.", rollbackError);
    }

    if (isMissingVisitorLogTableError(error)) {
      return {
        tracked: false,
        visitorId: prepared.visitorId,
      } as const;
    }

    throw error;
  }

  return {
    isUniqueDailyVisitor,
    tracked: true,
    visitorId: prepared.visitorId,
  } as const;
}

function buildEmptyDashboardVisitorAnalytics(
  days = VISITOR_ANALYTICS_DAYS,
): DashboardVisitorAnalytics {
  return {
    topPages: {
      change: "Awaiting tracked traffic",
      pages: [],
      summary: "No live page data",
    },
    trafficSources: {
      change: "Awaiting tracked traffic",
      sources: [],
      summary: "No live source data",
    },
    visitors: {
      change: "Awaiting tracked traffic",
      description: "Unique daily visitors will appear here once public route tracking is live.",
      points: getJakartaDateRange(days).dayKeys.map((dayKey) => ({
        dateKey: dayKey,
        label: formatJakartaDayLabel(dayKey),
        value: 0,
      })),
      summary: "0 visitors",
    },
  };
}

export async function getDashboardVisitorAnalytics(
  days = VISITOR_ANALYTICS_DAYS,
): Promise<DashboardVisitorAnalytics> {
  const safeDays = Math.max(1, days);
  const range = getJakartaDateRange(safeDays);
  const prevEnd = new Date(range.start);
  const prevStart = new Date(range.start);
  prevStart.setUTCDate(prevStart.getUTCDate() - safeDays);

  try {
    const [summaryRows, dailyRows, sourceRows, topPageRows] = await Promise.all([
      prisma.$queryRaw<SummaryRow[]>`
        SELECT
          COUNT(*) FILTER (
            WHERE "visitedAt" >= ${range.start}
              AND "visitedAt" < ${range.endExclusive}
              AND "isUniqueDailyVisitor" = true
          )::int AS "currentUniqueVisitors",
          COUNT(*) FILTER (
            WHERE "visitedAt" >= ${prevStart}
              AND "visitedAt" < ${prevEnd}
              AND "isUniqueDailyVisitor" = true
          )::int AS "prevUniqueVisitors",
          COUNT(*) FILTER (
            WHERE "visitedAt" >= ${range.start}
              AND "visitedAt" < ${range.endExclusive}
          )::int AS "currentPageViews"
        FROM "visitorLog"
      `,
      prisma.$queryRaw<DailyRow[]>`
        SELECT
          TO_CHAR(("visitedAt" AT TIME ZONE 'Asia/Jakarta')::date, 'YYYY-MM-DD') AS "dayKey",
          COUNT(*) FILTER (WHERE "isUniqueDailyVisitor" = true)::int AS "uniqueVisitors",
          COUNT(*)::int AS "pageViews"
        FROM "visitorLog"
        WHERE "visitedAt" >= ${range.start}
          AND "visitedAt" < ${range.endExclusive}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.$queryRaw<SourceRow[]>`
        SELECT
          "referrerSource" AS "source",
          COUNT(*)::int AS "count"
        FROM "visitorLog"
        WHERE "visitedAt" >= ${range.start}
          AND "visitedAt" < ${range.endExclusive}
          AND "isUniqueDailyVisitor" = true
        GROUP BY "referrerSource"
        ORDER BY "count" DESC, "source" ASC
      `,
      prisma.$queryRaw<TopPageRow[]>`
        SELECT
          "path",
          COUNT(*)::int AS "views"
        FROM "visitorLog"
        WHERE "visitedAt" >= ${range.start}
          AND "visitedAt" < ${range.endExclusive}
        GROUP BY "path"
        ORDER BY "views" DESC, "path" ASC
        LIMIT 5
      `,
    ]);

    const summary = summaryRows[0];
    const currentUniqueVisitors = toNumber(summary?.currentUniqueVisitors);
    const prevUniqueVisitors = toNumber(summary?.prevUniqueVisitors);
    const currentPageViews = toNumber(summary?.currentPageViews);

    const dailyCounts = new Map(
      dailyRows.map((row) => [
        row.dayKey,
        {
          pageViews: toNumber(row.pageViews),
          uniqueVisitors: toNumber(row.uniqueVisitors),
        },
      ]),
    );

    const visitorPoints: VisitorSeriesPoint[] = range.dayKeys.map((dayKey) => ({
      dateKey: dayKey,
      label: formatJakartaDayLabel(dayKey),
      value: dailyCounts.get(dayKey)?.uniqueVisitors ?? 0,
    }));

    const trafficSources: TrafficSourceBreakdown[] = sourceRows.map((row) => {
      const source = (["linkedin", "github", "search", "direct"].includes(row.source)
        ? row.source
        : "other") as ReferrerSource;

      return {
        label: getReferrerSourceLabel(source),
        source,
        value: toNumber(row.count),
      };
    });

    const topPages: TopPageMetric[] = topPageRows.map((row) => ({
      label: formatTrackedPathLabel(row.path),
      path: row.path,
      value: toNumber(row.views),
    }));

    const leadSource = trafficSources[0]?.label ?? "No source";
    const leadPage = topPages[0]?.label ?? "No page";

    if (currentUniqueVisitors === 0 && currentPageViews === 0 && prevUniqueVisitors === 0) {
      return buildEmptyDashboardVisitorAnalytics(safeDays);
    }

    return {
      topPages: {
        change:
          topPages.length > 0
            ? `${formatCompactNumber(currentPageViews)} accepted views`
            : "Awaiting tracked traffic",
        pages: topPages,
        summary: topPages.length > 0 ? `${leadPage} leads` : "No live page data",
      },
      trafficSources: {
        change:
          trafficSources.length > 0 ? `${leadSource} leads` : "Awaiting tracked traffic",
        sources: trafficSources,
        summary:
          trafficSources.length > 0
            ? `${trafficSources.length} live sources`
            : "No live source data",
      },
      visitors: {
        change: formatVisitorsChange(currentUniqueVisitors, prevUniqueVisitors, safeDays),
        description: `Unique daily visitors across ${formatCompactNumber(currentPageViews)} accepted public page views in the last ${safeDays} days.`,
        points: visitorPoints,
        summary: `${formatCompactNumber(currentUniqueVisitors)} visitors`,
      },
    };
  } catch (error) {
    if (isMissingVisitorLogTableError(error)) {
      return buildEmptyDashboardVisitorAnalytics(safeDays);
    }

    throw error;
  }
}

export {
  BOT_USER_AGENT_PATTERN,
  VISITOR_ANALYTICS_DAYS,
  VISITOR_ANALYTICS_TIMEZONE,
  VISITOR_COOKIE_NAME,
  hasTrackingConfig as hasVisitorTrackingConfig,
};
