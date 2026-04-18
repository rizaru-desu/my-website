import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { getPublicProjectBySlug, getPublicProjects, ProjectsStorageError } from "@/lib/projects";
import {
  getProjectRepositoryLabel,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from "@/lib/projects.shared";

export const revalidate = 300;
export const dynamic = "force-dynamic";

function getProjectErrorMessage(error: unknown) {
  if (error instanceof ProjectsStorageError) {
    return error.message;
  }

  return "The project detail could not be loaded right now.";
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project: PublicProjectDetail | null = null;
  let relatedProjects: PublicProjectSummary[] = [];
  let loadError: string | null = null;

  try {
    const [projectDetail, projects] = await Promise.all([
      getPublicProjectBySlug(slug),
      getPublicProjects(),
    ]);

    if (!projectDetail) {
      notFound();
    }

    project = projectDetail;
    relatedProjects = projects
      .filter((item) => item.slug !== projectDetail.slug)
      .filter((item) => {
        return (
          item.category === projectDetail.category ||
          item.techStack.some((tech) => projectDetail.techStack.includes(tech))
        );
      })
      .slice(0, 2);
  } catch (error) {
    loadError = getProjectErrorMessage(error);
  }

  if (loadError || !project) {
    return (
      <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
          <EditorialCard accent="red" className="space-y-4">
            <Badge variant="red">Project Unavailable</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              The live case study could not be loaded.
            </h1>
            <p className="text-base leading-8 text-ink/78">
              {loadError ?? "The selected project is not available right now."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/projects" className="button-link">
                Back to Projects
              </Link>
              <Link href="/admin/projects" className="button-link button-link-blue">
                Open Projects Workspace
              </Link>
            </div>
          </EditorialCard>
        </div>
      </div>
    );
  }

  const currentProject = project;

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <PageHero
          label={currentProject.category}
          title={currentProject.title}
          description={currentProject.summary}
        >
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={
                currentProject.accent === "cream" ? "yellow" : currentProject.accent
              }
            >
              {currentProject.year}
            </Badge>
            <Badge variant="cream">{currentProject.role}</Badge>
            <Badge variant="cream">{currentProject.duration}</Badge>
          </div>
        </PageHero>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <EditorialCard accent={currentProject.accent} className="space-y-5">
            <Badge
              variant={
                currentProject.accent === "cream" ? "yellow" : currentProject.accent
              }
            >
              Project Snapshot
            </Badge>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Client
              </p>
              <p className="font-display text-3xl uppercase leading-none text-ink">
                {currentProject.clientOrCompany}
              </p>
            </div>
            <p className="text-base leading-7 text-ink/80">{currentProject.impactSummary}</p>
            <div className="flex flex-wrap gap-2 border-t-[3px] border-dashed border-ink/30 pt-5">
              {currentProject.techStack.map((tech) => (
                <Badge key={tech} variant="cream">
                  {tech}
                </Badge>
              ))}
            </div>
          </EditorialCard>
          <div className="grid gap-4 sm:grid-cols-3">
            {currentProject.metrics.map((metric, index) => (
              <EditorialCard
                key={metric.label}
                accent={index === 1 ? "red" : index === 2 ? "blue" : "cream"}
                className="space-y-3"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
                  {metric.label}
                </p>
                <p className="font-display text-4xl uppercase leading-none text-ink">
                  {metric.value}
                </p>
              </EditorialCard>
            ))}
          </div>
        </section>

        <SectionShell
          label="Challenge"
          title="The brief behind the build."
          description={currentProject.challenge}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <EditorialCard className="space-y-4">
              <Badge variant="red">Approach</Badge>
              <ul className="space-y-3 text-base leading-7 text-ink/80">
                {currentProject.process.map((step) => (
                  <li key={step} className="rounded-[20px] border-[3px] border-ink bg-white/60 px-4 py-4">
                    {step}
                  </li>
                ))}
              </ul>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-4">
              <Badge variant="blue">Outcome</Badge>
              <p className="text-base leading-8 text-ink/80 sm:text-lg">
                {currentProject.outcome}
              </p>
            </EditorialCard>
          </div>
        </SectionShell>

        <SectionShell
          label="Gallery"
          title="Key composition moments."
          description="These visual beats show how the case study can surface product detail and pacing across the page."
          contentClassName="grid gap-6 lg:grid-cols-3"
        >
          {currentProject.gallery.map((item, index) => (
            <EditorialCard
              key={item.title}
              accent={index === 0 ? "cream" : index === 1 ? "red" : "blue"}
              className="min-h-64 space-y-5"
            >
              <div className="rounded-[24px] border-[3px] border-ink bg-white/55 p-5">
                <div className="paper-grid h-36 rounded-[20px] border-[3px] border-dashed border-ink/35 bg-white/50" />
              </div>
              <div className="space-y-3">
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {item.title}
                </h3>
                <p className="text-sm leading-7 text-ink/80">{item.caption}</p>
              </div>
            </EditorialCard>
          ))}
        </SectionShell>

        {relatedProjects.length > 0 ? (
          <SectionShell
            label="Related"
            title="More work in the same orbit."
            description="Related cases are chosen by category and shared stack so the portfolio feels intentionally connected."
            contentClassName="grid gap-6 lg:grid-cols-2"
          >
            {relatedProjects.map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
          </SectionShell>
        ) : null}

        <div className="flex flex-wrap gap-4">
          {currentProject.projectUrl ? (
            <a
              href={currentProject.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="button-link"
            >
              Live Demo
            </a>
          ) : null}
          {currentProject.githubUrl ? (
            <a
              href={currentProject.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="button-link button-link-muted"
            >
              {getProjectRepositoryLabel(currentProject.githubUrl)}
            </a>
          ) : null}
          <Link href="/projects" className="button-link">
            Back to Projects
          </Link>
          <Link href="/resume" className="button-link button-link-blue">
            Open Resume
          </Link>
        </div>
      </div>
    </div>
  );
}
