import type { ReactNode } from "react";
import { unstable_noStore as noStore } from "next/cache";

import { AdminRoughChart } from "@/components/admin-rough-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";
import { getDashboardVisitorAnalytics } from "@/lib/visitor-analytics";

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

export async function DashboardAnalytics() {
  noStore();

  const analytics = await getDashboardVisitorAnalytics();

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
          description={analytics.visitors.description}
          summary={analytics.visitors.summary}
          change={analytics.visitors.change}
          accent="blue"
        >
          <AdminRoughChart
            type="Line"
            data={{
              points: analytics.visitors.points.map((point) => ({
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
          description="Inbound message persistence is now wired, but trend aggregation still needs its own analytics query layer."
          summary="Pending"
          change="Live soon"
          accent="red"
        >
          <PendingLiveDataState
            title="Message analytics are not wired yet."
            note="Public contact submissions can now persist into the inbox, but this chart will stay pending until message-specific analytics aggregation is added."
          />
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AnalyticsPanel
          title="Resume downloads trend"
          description="Resume download analytics will follow once the recruiter-facing download flow has its own tracking pipeline."
          summary="Pending"
          change="Live soon"
        >
          <PendingLiveDataState
            title="Download tracking is not wired yet."
            note="The current /resume page is visible publicly, but download-specific telemetry still needs its own endpoint and persistence model."
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Traffic sources"
          description="Where public portfolio visits are coming from in this analytics layer."
          summary={analytics.trafficSources.summary}
          change={analytics.trafficSources.change}
          accent="blue"
        >
          <AdminRoughChart
            type="Donut"
            data={{
              labels: analytics.trafficSources.sources.map((source) => source.label),
              values: analytics.trafficSources.sources.map((source) => source.value),
            }}
            colors={["#2463eb", "#ef3b2d", "#f7d20a", "#111111"]}
            height={280}
          />
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Top visited pages"
        description="Compact page-level view of where attention is concentrating."
        summary={analytics.topPages.summary}
        change={analytics.topPages.change}
        accent="red"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AdminRoughChart
            type="BarH"
            data={{
              labels: analytics.topPages.pages.map((page) => page.label),
              values: analytics.topPages.pages.map((page) => page.value),
            }}
            colors={["#ef3b2d"]}
            xLabel="Visits"
            height={300}
          />
          <div className="space-y-3">
            {analytics.topPages.pages.length > 0 ? (
              analytics.topPages.pages.map((page, index) => (
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
                    <Badge variant={index === 0 ? "red" : index === 1 ? "blue" : "cream"}>
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
