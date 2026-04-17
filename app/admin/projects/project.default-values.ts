import type { ProjectFormValues } from "./project.schema";

export function createProjectDefaultValues(): ProjectFormValues {
  return {
    title: "",
    slug: "",
    summary: "",
    category: "",
    tags: [],
    featured: false,
    status: "draft",
    year: "2026",
    clientOrCompany: "",
    role: "",
    duration: "",
    accent: "red",
    thumbnailPlaceholder: "",
    projectUrl: "",
    githubUrl: "",
    impactSummary: "",
    impactBullets: [],
    techStack: [],
    challenge: "",
    process: [],
    outcome: "",
    metrics: [],
    gallery: [],
    sortOrder: "",
  };
}
