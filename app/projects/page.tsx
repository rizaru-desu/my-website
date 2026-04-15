import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ProjectFilter } from "@/components/project-filter";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";
import { getPublicProjects, ProjectsStorageError } from "@/lib/projects";
import {
  getProjectRepositoryLabel,
  type PublicProjectSummary,
} from "@/lib/projects.shared";

function getProjectsErrorMessage(error: unknown) {
  if (error instanceof ProjectsStorageError) {
    return error.message;
  }

  return "The projects archive could not be loaded right now.";
}

export default async function ProjectsPage() {
  noStore();

  let projects: PublicProjectSummary[] = [];
  let loadError: string | null = null;

  try {
    projects = await getPublicProjects();
  } catch (error) {
    loadError = getProjectsErrorMessage(error);
  }

  const leadProject = projects.find((project) => project.featured) ?? projects[0] ?? null;

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

        {loadError ? (
          <EditorialCard accent="red" className="space-y-4">
            <Badge variant="red">Projects Unavailable</Badge>
            <h2 className="font-display text-4xl uppercase leading-none text-ink">
              The live project archive is not reachable.
            </h2>
            <p className="text-base leading-7 text-ink/80">{loadError}</p>
          </EditorialCard>
        ) : leadProject ? (
          <>
            <section className="surface-panel surface-panel-blue">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="space-y-4">
                  <Badge variant="blue">Featured Project</Badge>
                  <h2 className="font-display text-5xl uppercase leading-none text-ink">
                    {leadProject.title}
                  </h2>
                  <p className="text-base leading-7 text-ink/80">{leadProject.summary}</p>
                  <div className="flex flex-wrap gap-3">
                    {leadProject.projectUrl ? (
                      <a
                        href={leadProject.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-link"
                      >
                        Live Demo
                      </a>
                    ) : null}
                    {leadProject.githubUrl ? (
                      <a
                        href={leadProject.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-link button-link-muted"
                      >
                        {getProjectRepositoryLabel(leadProject.githubUrl)}
                      </a>
                    ) : null}
                    <Link
                      href={`/projects/${leadProject.slug}`}
                      className="button-link button-link-blue"
                    >
                      Open Case
                    </Link>
                  </div>
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
          </>
        ) : (
          <EditorialCard accent="cream" className="space-y-4">
            <Badge variant="cream">No Published Projects</Badge>
            <h2 className="font-display text-4xl uppercase leading-none text-ink">
              The live archive is ready for its first published case study.
            </h2>
            <p className="text-base leading-7 text-ink/80">
              Publish a project from the admin workspace to populate this archive.
            </p>
          </EditorialCard>
        )}
      </div>
    </div>
  );
}
