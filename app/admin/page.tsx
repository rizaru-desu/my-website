import { headers } from "next/headers";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { DashboardAnalytics } from "./dashboard-analytics";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { SectionShell } from "@/components/ui/section-shell";
import { auth } from "@/lib/auth";
import { getDashboardMessageAnalytics } from "@/lib/messages";
import {
  adminActivity,
  adminCollections,
  adminMetrics,
  adminQueue,
} from "@/lib/mock-content";

export default async function AdminDashboardPage() {
  noStore();

  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  const messageAnalytics = await getDashboardMessageAnalytics();
  const canManageResume = session?.user?.role === "architect";
  const syncedMetrics = adminMetrics.map((metric) =>
    metric.label === "Messages Flagged"
      ? {
          ...metric,
          change: messageAnalytics.metric.change,
          note: messageAnalytics.metric.note,
          value: messageAnalytics.metric.value,
        }
      : metric,
  );

  return (
    <div className="space-y-8">
      <section className="surface-panel relative overflow-hidden bg-panel px-6 py-8 sm:px-8">
        <div className="accent-plate left-8 top-8 hidden h-14 w-14 -rotate-6 rounded-[18px] bg-accent-red lg:block" />
        <div className="accent-plate bottom-8 right-10 hidden h-12 w-28 rotate-3 rounded-full bg-accent-blue lg:block" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Badge variant="red">Dashboard</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              A content workspace, not a default admin skin.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-ink/78 sm:text-lg">
              This side keeps the same yellow-black-red-blue energy as the
              public portfolio, but turns it into a working environment for
              shaping profile, projects, blog writing, and resume content.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/projects" className="button-link">
              Open Projects
            </Link>
            <Link href="/admin/blog" className="button-link button-link-blue">
              Open Blog
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {syncedMetrics.map((metric) => (
          <EditorialCard
            key={metric.label}
            accent={metric.accent}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                {metric.label}
              </p>
              <span className="sticker-chip sticker-chip-cream">{metric.change}</span>
            </div>
            <p className="font-display text-5xl uppercase leading-none text-ink">
              {metric.value}
            </p>
            <p className="text-sm leading-7 text-ink/78">{metric.note}</p>
          </EditorialCard>
        ))}
      </section>

      <DashboardAnalytics canManageResume={canManageResume} />

      <SectionShell
        label="Collections"
        title="Everything the public portfolio depends on."
        description="These collection surfaces feel curated and directional rather than spreadsheet-like."
        contentClassName="grid gap-6 xl:grid-cols-3"
      >
        {adminCollections.map((collection) => (
          <EditorialCard
            key={collection.title}
            accent={collection.accent}
            className="flex h-full flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-3">
              <Badge
                variant={
                  collection.accent === "cream" ? "yellow" : collection.accent
                }
              >
                {collection.status}
              </Badge>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
                {collection.itemCount}
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                {collection.title}
              </h2>
              <p className="text-sm leading-7 text-ink/78">
                {collection.description}
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Link href={collection.href} className="button-link">
                Open Collection
              </Link>
            </div>
          </EditorialCard>
        ))}
      </SectionShell>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionShell
          label="Recent Activity"
          title="Latest content moves."
          contentClassName="space-y-5"
        >
          {adminActivity.map((entry) => (
            <EditorialCard
              key={entry.title}
              accent={entry.accent}
              className="space-y-3"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                {entry.meta}
              </p>
              <h3 className="font-display text-3xl uppercase leading-none text-ink">
                {entry.title}
              </h3>
              <p className="text-sm leading-7 text-ink/78">{entry.detail}</p>
            </EditorialCard>
          ))}
        </SectionShell>

        <SectionShell
          label="Queue"
          title="What is ready, blocked, or in motion."
          contentClassName="space-y-5"
        >
          {adminQueue.map((item, index) => (
            <EditorialCard
              key={item.title}
              accent={index === 0 ? "blue" : index === 1 ? "red" : "cream"}
              className="space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {item.title}
                </h3>
                <Badge variant={index === 1 ? "red" : index === 0 ? "blue" : "cream"}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-ink/78">{item.note}</p>
            </EditorialCard>
          ))}
        </SectionShell>
      </section>
    </div>
  );
}
