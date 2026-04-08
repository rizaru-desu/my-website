import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { getProjectBySlug, projects } from "@/lib/mock-content";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = projects
    .filter((item) => item.slug !== project.slug)
    .filter((item) => {
      return (
        item.category === project.category ||
        item.techStack.some((tech) => project.techStack.includes(tech))
      );
    })
    .slice(0, 2);

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <PageHero
          label={project.category}
          title={project.title}
          description={project.summary}
        >
          <div className="flex flex-wrap gap-3">
            <Badge variant={project.accent === "cream" ? "yellow" : project.accent}>
              {project.year}
            </Badge>
            <Badge variant="cream">{project.role}</Badge>
            <Badge variant="cream">{project.duration}</Badge>
          </div>
        </PageHero>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <EditorialCard accent={project.accent} className="space-y-5">
            <Badge variant={project.accent === "cream" ? "yellow" : project.accent}>
              Project Snapshot
            </Badge>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Client
              </p>
              <p className="font-display text-3xl uppercase leading-none text-ink">
                {project.client}
              </p>
            </div>
            <p className="text-base leading-7 text-ink/80">{project.impact}</p>
            <div className="flex flex-wrap gap-2 border-t-[3px] border-dashed border-ink/30 pt-5">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="cream">
                  {tech}
                </Badge>
              ))}
            </div>
          </EditorialCard>
          <div className="grid gap-4 sm:grid-cols-3">
            {project.metrics.map((metric, index) => (
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
          description={project.challenge}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <EditorialCard className="space-y-4">
              <Badge variant="red">Approach</Badge>
              <ul className="space-y-3 text-base leading-7 text-ink/80">
                {project.process.map((step) => (
                  <li key={step} className="rounded-[20px] border-[3px] border-ink bg-white/60 px-4 py-4">
                    {step}
                  </li>
                ))}
              </ul>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-4">
              <Badge variant="blue">Outcome</Badge>
              <p className="text-base leading-8 text-ink/80 sm:text-lg">
                {project.outcome}
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
          {project.gallery.map((item, index) => (
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

        <div className="flex flex-wrap gap-4">
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
