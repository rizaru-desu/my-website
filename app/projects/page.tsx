import Link from "next/link";

import { ProjectFilter } from "@/components/project-filter";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/ui/page-hero";
import { featuredProjects, projects } from "@/lib/mock-content";

export default function ProjectsPage() {
  const leadProject = featuredProjects[0]!;

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <PageHero
          label="Projects"
          title="A poster-wall of recent product work."
          description="This screen keeps the grid energetic without losing hiring signal. Filters stay fast, clear, and intentionally lightweight."
        >
          <div className="flex flex-wrap gap-4">
            <Link href="/resume" className="button-link">
              Resume View
            </Link>
            <Link href="/blog" className="button-link button-link-blue">
              Writing Archive
            </Link>
          </div>
        </PageHero>

        <section className="surface-panel surface-panel-blue">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-4">
              <Badge variant="blue">Featured Project</Badge>
              <h2 className="font-display text-5xl uppercase leading-none text-ink">
                {leadProject.title}
              </h2>
              <p className="text-base leading-7 text-ink/80">{leadProject.summary}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {leadProject.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border-[3px] border-ink bg-white/60 px-4 py-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                    {metric.label}
                  </p>
                  <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ProjectFilter projects={projects} />
      </div>
    </div>
  );
}
