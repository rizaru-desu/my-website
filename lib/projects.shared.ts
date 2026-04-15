import type {
  ProjectAccent,
  ProjectFormValues,
  ProjectStatus,
} from "@/app/admin/projects/project.schema";

export type AdminProjectRecord = {
  createdAt: string;
  id: string;
  source: "database";
  updatedAt: string;
  values: ProjectFormValues;
};

export type ProjectActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type PublicProjectSummary = {
  accent: ProjectAccent;
  category: string;
  duration: string;
  featured: boolean;
  githubUrl: string;
  impactSummary: string;
  metrics: ProjectFormValues["metrics"];
  projectUrl: string;
  role: string;
  slug: string;
  summary: string;
  techStack: string[];
  title: string;
  year: string;
};

export type PublicProjectDetail = PublicProjectSummary & {
  challenge: string;
  clientOrCompany: string;
  gallery: ProjectFormValues["gallery"];
  impactBullets: string[];
  outcome: string;
  process: string[];
  tags: string[];
  thumbnailPlaceholder: string;
};

export type ProjectDashboardSummary = {
  archivedCount: number;
  featuredCount: number;
  latestUpdatedAt: string | null;
  publishedCount: number;
  totalCount: number;
  unpublishedCount: number;
};

export function normalizeProjectStatus(status: string): ProjectStatus {
  if (status === "published" || status === "archived") {
    return status;
  }

  return "draft";
}

export function normalizeProjectAccent(accent: string): ProjectAccent {
  if (accent === "blue" || accent === "cream") {
    return accent;
  }

  return "red";
}

export function formatProjectUpdatedAt(value: Date | string | null | undefined) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getProjectRepositoryLabel(value: string | null | undefined) {
  if (!value) {
    return "Repository";
  }

  try {
    const hostname = new URL(value).hostname.toLowerCase();

    if (hostname.includes("gitlab")) {
      return "GitLab";
    }

    if (hostname.includes("github")) {
      return "GitHub";
    }

    if (hostname.includes("bitbucket")) {
      return "Bitbucket";
    }
  } catch {
    return "Repository";
  }

  return "Repository";
}

export function sortPublicProjectSummaries<T extends Pick<PublicProjectSummary, "featured"> & {
  sortOrder: number | null;
  updatedAt: string;
}>(projects: T[]) {
  return [...projects].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.sortOrder ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}
