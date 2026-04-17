import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import {
  getProjectRepositoryLabel,
  type PublicProjectSummary,
} from "@/lib/projects.shared";

type ProjectCardProps = {
  project: PublicProjectSummary;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <EditorialCard accent={project.accent} className="flex h-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <Badge variant={project.accent === "cream" ? "yellow" : project.accent}>
          {project.category}
        </Badge>
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/65">
          {project.year}
        </span>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-3xl uppercase leading-none text-ink">
          {project.title}
        </h3>
        <p className="text-sm leading-7 text-ink/80 sm:text-base">
          {project.summary}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border-[2px] border-ink bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t-[3px] border-dashed border-ink/30 pt-5">
        <p className="max-w-xs text-sm leading-6 text-ink/70">{project.impactSummary}</p>
        <div className="flex flex-wrap justify-end gap-3">
          {project.projectUrl ? (
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="button-link"
            >
              Live Demo
            </a>
          ) : null}
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="button-link button-link-muted"
            >
              {getProjectRepositoryLabel(project.githubUrl)}
            </a>
          ) : null}
          <Link href={`/projects/${project.slug}`} className="button-link button-link-blue">
            Open Case
          </Link>
        </div>
      </div>
    </EditorialCard>
  );
}
