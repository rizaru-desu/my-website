import Link from "next/link";
import type { ReactNode } from "react";
import { unstable_noStore as noStore } from "next/cache";

import { AdminChart } from "@/components/admin-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";
import type { DashboardMessageAnalyticsResult } from "@/lib/messages";
import { formatResumeUpdatedAt } from "@/lib/resume.shared";
import { getAdminResumeAsset, getDashboardResumeDownloadAnalytics } from "@/lib/resume";
import { getDashboardVisitorAnalytics } from "@/lib/visitor-analytics";

function getResumeSourceMeta(source: "database" | "env" | "none") {
  switch (source) {
    case "database":
      return {
        accent: "blue" as const,
        label: "Database Saved",
        note: "Primary source",
      };
    case "env":
      return {
        accent: "cream" as const,
        label: "Env Fallback",
        note: "Fallback source",
      };
    default:
      return {
        accent: "red" as const,
        label: "Unavailable",
        note: "No active file",
      };
  }
}

function getResumeHostLabel(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  try {
    return new URL(
      value.startsWith("/") ? `https://portfolio.local${value}` : value,
    ).host;
  } catch {
    return "Relative path";
  }
}

function AnalyticsPanel({
  accent = "cream",
  title,
  description,
  summary,
  change,
  children,
}: {
  accent?: "cream" | "blue" | "red";
  title: string;
  description: string;
  summary: string;
  change: string;
  children: ReactNode;
}) {
  return (
    <Card accent={accent} className="overflow-hidden">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={accent === "cream" ? "yellow" : accent}>{change}</Badge>
        </div>
        <div className="rounded-[22px] border-[3px] border-ink bg-white/72 px-4 py-3 shadow-[5px_5px_0_var(--ink)]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
            Snapshot
          </p>
          <p className="mt-3 font-display text-4xl uppercase leading-none text-ink">
            {summary}
          </p>
        </div>
        <div className="rounded-[26px] border-[3px] border-ink bg-white/82 px-3 py-3 shadow-[6px_6px_0_var(--ink)]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function PendingLiveDataState({
  note,
  title,
}: {
  note: string;
  title: string;
}) {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-[22px] border-[3px] border-dashed border-ink bg-white/72 px-6 text-center shadow-[5px_5px_0_var(--ink)]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/58">
        Pending Live Data
      </p>
      <p className="font-display text-3xl uppercase leading-none text-ink">{title}</p>
      <p className="max-w-md text-sm leading-7 text-ink/72">{note}</p>
    </div>
  );
}

function MessageBreakdownCard({
  accent,
  label,
  note,
  value,
}: {
  accent: "cream" | "blue" | "red";
  label: string;
  note: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border-[3px] border-ink bg-panel px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
            {label}
          </p>
          <span
            className={
              accent === "red"
                ? "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent-red"
                : accent === "blue"
                  ? "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent-blue"
                  : "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink/62"
            }
          >
            {note}
          </span>
        </div>
        <p className="font-display text-4xl uppercase leading-none text-ink">{value}</p>
      </div>
    </div>
  );
}

export async function DashboardAnalytics({
  canManageResume = false,
  messageAnalytics,
}: {
  canManageResume?: boolean;
  messageAnalytics: DashboardMessageAnalyticsResult;
}) {
  noStore();

  const [visitorAnalytics, resumeAnalytics, resumeAsset] = await Promise.all([
    getDashboardVisitorAnalytics(),
    getDashboardResumeDownloadAnalytics(),
    getAdminResumeAsset(),
  ]);
  const resumeSourceMeta = getResumeSourceMeta(resumeAsset.source);
  const resumeHost = getResumeHostLabel(resumeAsset.downloadUrl);
  const resumeFileLabel = resumeAsset.fileName ?? "No active resume file";
  const resumeUpdatedAt = formatResumeUpdatedAt(resumeAsset.updatedAt);

  return (
    <SectionShell
      label="Analytics"
      title="Traffic and engagement with a clearer editorial read."
      description="These charts add visibility without breaking the existing admin layout."
      contentClassName="space-y-6"
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsPanel
          title="Visitors trend"
          description={visitorAnalytics.visitors.description}
          summary={visitorAnalytics.visitors.summary}
          change={visitorAnalytics.visitors.change}
          accent="blue"
        >
          <AdminChart
            type="Line"
            data={{
              points: visitorAnalytics.visitors.points.map((point) => ({
                x: point.label,
                y: point.value,
              })),
              seriesLabel: "Unique visitors",
            }}
            colors={["#2463eb"]}
            yLabel="Visitors"
            height={300}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Contact messages trend"
          description={messageAnalytics.description}
          summary={messageAnalytics.summary}
          change={messageAnalytics.change}
          accent="red"
        >
          <div className="space-y-4">
            {messageAnalytics.isEmpty ? (
              <PendingLiveDataState
                title="No inbox activity yet."
                note="The public contact form is already wired. Once messages arrive, this panel will chart daily inbox volume automatically."
              />
            ) : (
              <div className="overflow-hidden rounded-[22px] border-[3px] border-ink bg-white/72 px-3 py-3 shadow-[5px_5px_0_var(--ink)]">
                <AdminChart
                  type="Line"
                  data={{
                    points: messageAnalytics.points.map((point) => ({
                      x: point.label,
                      y: point.value,
                    })),
                    seriesLabel: "New messages",
                  }}
                  colors={["#ef3b2d"]}
                  yLabel="Messages"
                  height={260}
                />
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {messageAnalytics.breakdown.map((item) => (
                <MessageBreakdownCard
                  key={item.label}
                  accent={item.accent}
                  label={item.label}
                  note={item.note}
                  value={item.value}
                />
              ))}
            </div>
          </div>
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AnalyticsPanel
          title="Resume downloads trend"
          description={resumeAnalytics.description}
          summary={resumeAnalytics.summary}
          change={resumeAnalytics.change}
        >
          {resumeAnalytics.isEmpty ? (
            <PendingLiveDataState
              title="No tracked downloads yet."
              note="Once recruiters use the server-side CV download route, real download volume will chart here automatically."
            />
          ) : (
            <AdminChart
              type="Line"
              data={{
                points: resumeAnalytics.points.map((point) => ({
                  x: point.label,
                  y: point.value,
                })),
                seriesLabel: "CV downloads",
              }}
              colors={["#f7d20a"]}
              yLabel="Downloads"
              height={300}
            />
          )}
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Resume delivery status"
          description="Quick operational read on the file powering the public CV route."
          summary={resumeSourceMeta.label}
          change={resumeSourceMeta.note}
          accent={resumeSourceMeta.accent}
        >
          <div className="space-y-4">
            <div className="rounded-[22px] border-[3px] border-ink bg-panel px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
                    Active file
                  </p>
                  <p className="font-display text-3xl uppercase leading-none text-ink">
                    {resumeFileLabel}
                  </p>
                </div>
                <Badge variant={resumeSourceMeta.accent === "cream" ? "yellow" : resumeSourceMeta.accent}>
                  {resumeSourceMeta.label}
                </Badge>
              </div>
              <p className="mt-4 wrap-break-word text-sm leading-7 text-ink/76">
                {resumeAsset.downloadUrl ?? "No public CV URL is configured yet."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border-[3px] border-ink bg-white/72 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
                  Host
                </p>
                <p className="mt-2 wrap-break-word font-display text-2xl uppercase leading-none text-ink">
                  {resumeHost}
                </p>
              </div>
              <div className="rounded-[22px] border-[3px] border-ink bg-white/72 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
                  Updated
                </p>
                <p className="mt-2 font-display text-2xl uppercase leading-none text-ink">
                  {resumeUpdatedAt}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/resume" className="button-link button-link-blue">
                Open Resume
              </Link>
              <Link href="/api/cv/download" className="button-link">
                Test Download
              </Link>
              {canManageResume ? (
                <Link href="/admin/resume" className="button-link">
                  Manage Resume
                </Link>
              ) : null}
            </div>
          </div>
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Traffic sources"
        description="Where public portfolio visits are coming from in this analytics layer."
        summary={visitorAnalytics.trafficSources.summary}
        change={visitorAnalytics.trafficSources.change}
        accent="blue"
      >
        <AdminChart
          type="Donut"
          data={{
            labels: visitorAnalytics.trafficSources.sources.map((source) => source.label),
            values: visitorAnalytics.trafficSources.sources.map((source) => source.value),
          }}
          colors={["#2463eb", "#ef3b2d", "#f7d20a", "#111111"]}
          height={280}
        />
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Top visited pages"
        description="Compact page-level view of where attention is concentrating."
        summary={visitorAnalytics.topPages.summary}
        change={visitorAnalytics.topPages.change}
        accent="red"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AdminChart
            type="BarH"
            data={{
              labels: visitorAnalytics.topPages.pages.map((page) => page.label),
              values: visitorAnalytics.topPages.pages.map((page) => page.value),
            }}
            colors={["#ef3b2d"]}
            xLabel="Visits"
            height={300}
          />
          <div className="space-y-3">
            {visitorAnalytics.topPages.pages.length > 0 ? (
              visitorAnalytics.topPages.pages.map((page, index) => (
                <div
                  key={page.path}
                  className="rounded-[22px] border-[3px] border-ink bg-panel px-4 py-4 shadow-[5px_5px_0_var(--ink)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
                        0{index + 1}
                      </p>
                      <p className="font-display text-2xl uppercase leading-none text-ink">
                        {page.label}
                      </p>
                      <p className="text-sm leading-6 text-ink/70">{page.path}</p>
                    </div>
                    <Badge variant={index === 0 ? "red" : "blue"}>
                      {page.value}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border-[3px] border-dashed border-ink bg-white/72 px-5 py-8 text-center shadow-[5px_5px_0_var(--ink)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
                  Awaiting tracked traffic
                </p>
                <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                  No page leaders yet
                </p>
                <p className="mt-3 text-sm leading-7 text-ink/72">
                  Once public visitors start landing on tracked routes, the leading pages
                  will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </AnalyticsPanel>
    </SectionShell>
  );
}
