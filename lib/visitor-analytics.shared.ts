export const VISITOR_COOKIE_NAME = "portfolio_visitor";
export const VISITOR_ANALYTICS_DAYS = 30;
export const VISITOR_ANALYTICS_TIMEZONE = "Asia/Jakarta";

export type ReferrerSource =
  | "linkedin"
  | "github"
  | "search"
  | "direct"
  | "other";

export type VisitorSeriesPoint = {
  dateKey: string;
  label: string;
  value: number;
};

export type TrafficSourceBreakdown = {
  label: string;
  source: ReferrerSource;
  value: number;
};

export type TopPageMetric = {
  label: string;
  path: string;
  value: number;
};

export type DashboardVisitorAnalytics = {
  visitors: {
    change: string;
    description: string;
    points: VisitorSeriesPoint[];
    summary: string;
  };
  topPages: {
    change: string;
    pages: TopPageMetric[];
    summary: string;
  };
  trafficSources: {
    change: string;
    sources: TrafficSourceBreakdown[];
    summary: string;
  };
};

export function normalizeTrackedPath(pathname: string) {
  const trimmed = pathname.trim();

  if (!trimmed) {
    return "/";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const withoutQuery = withLeadingSlash.split("#")[0]?.split("?")[0] ?? "/";

  if (withoutQuery !== "/" && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }

  return withoutQuery || "/";
}

export function isTrackedPublicPath(pathname: string) {
  const normalized = normalizeTrackedPath(pathname);

  return (
    normalized === "/" ||
    normalized === "/projects" ||
    normalized.startsWith("/projects/") ||
    normalized === "/blog" ||
    normalized.startsWith("/blog/") ||
    normalized === "/resume"
  );
}

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getReferrerSourceLabel(source: ReferrerSource) {
  switch (source) {
    case "linkedin":
      return "LinkedIn";
    case "github":
      return "GitHub";
    case "search":
      return "Search";
    case "direct":
      return "Direct";
    default:
      return "Other";
  }
}

export function formatTrackedPathLabel(pathname: string) {
  const normalized = normalizeTrackedPath(pathname);

  if (normalized === "/") {
    return "Homepage";
  }

  if (normalized === "/projects") {
    return "Projects";
  }

  if (normalized === "/blog") {
    return "Blog";
  }

  if (normalized === "/resume") {
    return "Resume";
  }

  if (normalized.startsWith("/projects/")) {
    return `Project: ${toTitleCase(normalized.slice("/projects/".length))}`;
  }

  if (normalized.startsWith("/blog/")) {
    return `Blog: ${toTitleCase(normalized.slice("/blog/".length))}`;
  }

  return normalized
    .split("/")
    .filter(Boolean)
    .map(toTitleCase)
    .join(" / ");
}
