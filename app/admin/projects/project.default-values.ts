import { projects, type Project } from "@/lib/mock-content";

import type { ProjectFormValues, ProjectStatus } from "./project.schema";

export type ProjectRecord = {
  id: string;
  values: ProjectFormValues;
  lastUpdated: string;
};

const mockStatuses: ProjectStatus[] = ["published", "published", "draft"];
const mockUpdatedAt = ["Mar 18, 2026", "Mar 07, 2026", "Feb 12, 2026"];

export function createProjectDefaultValues(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    summary: "",
    description: "",
    category: "",
    tags: [],
    featured: false,
    status: "draft",
    year: "2026",
    clientOrCompany: "",
    role: "",
    thumbnailPlaceholder: "",
    projectUrl: "",
    githubUrl: "",
    impactBullets: [],
    techStack: [],
    sortOrder: "",
  };
}

function createProjectDescription(project: Project) {
  return [
    project.challenge,
    ...project.process.map((step) => `- ${step}`),
    project.outcome,
  ].join("\n\n");
}

function createProjectTags(project: Project) {
  return [project.category, project.client, project.role]
    .map((item) => item.trim())
    .filter(Boolean);
}

function createProjectLinks(project: Project, index: number) {
  const projectUrl = `https://portfolio-rizal.dev/projects/${project.slug}`;
  const githubUrl =
    index === 0 ? "https://github.com/rizal-achmad/pulse-cms-portfolio" : "";

  return { projectUrl, githubUrl };
}

function toProjectRecord(project: Project, index: number): ProjectRecord {
  const links = createProjectLinks(project, index);

  return {
    id: `project-${project.slug}`,
    lastUpdated: mockUpdatedAt[index] ?? formatProjectUpdatedAt(),
    values: {
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: createProjectDescription(project),
      category: project.category,
      tags: createProjectTags(project),
      featured: project.featured,
      status: mockStatuses[index] ?? "draft",
      year: project.year,
      clientOrCompany: project.client,
      role: project.role,
      thumbnailPlaceholder: `${project.title} cover frame`,
      projectUrl: links.projectUrl,
      githubUrl: links.githubUrl,
      impactBullets: [
        project.impact,
        ...project.metrics.map((metric) => `${metric.label}: ${metric.value}`),
      ],
      techStack: project.techStack,
      sortOrder: String(index + 1),
    },
  };
}

export const projectSeedRecords: ProjectRecord[] = projects.map(toProjectRecord);

export function formatProjectUpdatedAt(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
