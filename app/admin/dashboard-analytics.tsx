"use client";

import type { ReactNode } from "react";

import { AdminRoughChart } from "@/components/admin-rough-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { SectionShell } from "@/components/ui/section-shell";
import { adminAnalytics } from "@/lib/mock-content";

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

export function DashboardAnalytics() {
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
          description="Weekly traffic movement across the public portfolio."
          summary={adminAnalytics.visitors.summary}
          change={adminAnalytics.visitors.change}
          accent="blue"
        >
          <AdminRoughChart
            type="Line"
            data={{
              points: adminAnalytics.visitors.points.map((point) => ({
                x: point.label,
                y: point.value,
              })),
              seriesLabel: "Visitors",
            }}
            colors={["#2463eb"]}
            yLabel="Visitors"
            height={300}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Contact messages trend"
          description="Inbound conversation volume from the public contact flow."
          summary={adminAnalytics.messages.summary}
          change={adminAnalytics.messages.change}
          accent="red"
        >
          <AdminRoughChart
            type="Bar"
            data={{
              labels: adminAnalytics.messages.points.map((point) => point.label),
              values: adminAnalytics.messages.points.map((point) => point.value),
            }}
            colors={["#ef3b2d"]}
            yLabel="Messages"
            height={300}
          />
        </AnalyticsPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <AnalyticsPanel
          title="Resume downloads trend"
          description="Download demand for the recruiter-facing CV route."
          summary={adminAnalytics.resumeDownloads.summary}
          change={adminAnalytics.resumeDownloads.change}
        >
          <AdminRoughChart
            type="Line"
            data={{
              points: adminAnalytics.resumeDownloads.points.map((point) => ({
                x: point.label,
                y: point.value,
              })),
              seriesLabel: "Downloads",
            }}
            colors={["#111111"]}
            yLabel="Downloads"
            height={300}
          />
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Traffic sources"
          description="Where public portfolio visits are coming from in this analytics layer."
          summary={adminAnalytics.trafficSources.summary}
          change={adminAnalytics.trafficSources.change}
          accent="blue"
        >
          <AdminRoughChart
            type="Donut"
            data={{
              labels: adminAnalytics.trafficSources.sources.map((source) => source.label),
              values: adminAnalytics.trafficSources.sources.map((source) => source.value),
            }}
            colors={["#2463eb", "#ef3b2d", "#f7d20a", "#111111"]}
            height={280}
          />
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Top visited pages"
        description="Compact page-level view of where attention is concentrating."
        summary={adminAnalytics.topPages.summary}
        change={adminAnalytics.topPages.change}
        accent="red"
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <AdminRoughChart
            type="BarH"
            data={{
              labels: adminAnalytics.topPages.pages.map((page) => page.label),
              values: adminAnalytics.topPages.pages.map((page) => page.value),
            }}
            colors={["#ef3b2d"]}
            xLabel="Visits"
            height={300}
          />
          <div className="space-y-3">
            {adminAnalytics.topPages.pages.map((page, index) => (
              <div
                key={page.label}
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
                  </div>
                  <Badge variant={index === 0 ? "red" : index === 1 ? "blue" : "cream"}>
                    {page.value}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnalyticsPanel>
    </SectionShell>
  );
}
