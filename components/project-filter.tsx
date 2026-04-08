"use client";

import { useState } from "react";

import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/mock-content";

type ProjectFilterProps = {
  projects: Project[];
};

export function ProjectFilter({ projects }: ProjectFilterProps) {
  const categories = ["All", ...new Set(projects.map((project) => project.category))];
  const techOptions = ["All", ...new Set(projects.flatMap((project) => project.techStack))];
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTech, setActiveTech] = useState("All");

  const filteredProjects = projects.filter((project) => {
    const categoryMatch =
      activeCategory === "All" || project.category === activeCategory;
    const techMatch = activeTech === "All" || project.techStack.includes(activeTech);

    return categoryMatch && techMatch;
  });

  return (
    <div className="space-y-8">
      <div className="surface-panel bg-panel">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/65">
              Category
            </p>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={
                    activeCategory === category
                      ? "button-link"
                      : "button-link button-link-muted"
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/65">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-3">
              {techOptions.map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setActiveTech(tech)}
                  className={
                    activeTech === tech
                      ? "button-link button-link-blue"
                      : "button-link button-link-muted"
                  }
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t-[3px] border-dashed border-ink/30 pt-6">
          <Badge variant="cream">{filteredProjects.length} visible projects</Badge>
          <p className="text-sm text-ink/70">
            Filters run instantly and keep the archive easy to browse.
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
