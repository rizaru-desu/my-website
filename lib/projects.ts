import "server-only";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { projectSchema, type ProjectFormValues } from "@/app/admin/projects/project.schema";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isMissingProjectTableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";
import {
  formatProjectUpdatedAt,
  sortPublicProjectSummaries,
  type AdminProjectRecord,
  type ProjectActionResult,
  type ProjectDashboardSummary,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from "@/lib/projects.shared";

type StoredProjectStatus = "ARCHIVED" | "DRAFT" | "PUBLISHED";
type StoredProjectAccent = "BLUE" | "CREAM" | "RED";

type StoredProject = {
  accent: StoredProjectAccent;
  category: string;
  challenge: string;
  clientOrCompany: string;
  createdAt: Date;
  duration: string;
  featured: boolean;
  gallery: Prisma.JsonValue;
  githubUrl: string | null;
  id: string;
  impactBullets: string[];
  impactSummary: string;
  metrics: Prisma.JsonValue;
  outcome: string;
  process: string[];
  projectUrl: string | null;
  role: string;
  slug: string;
  sortOrder: number | null;
  status: StoredProjectStatus;
  summary: string;
  tags: string[];
  techStack: string[];
  thumbnailPlaceholder: string;
  title: string;
  updatedAt: Date;
  year: string;
};

const projectAdminRoles = ["architect"] as const;

const projectModel = (prisma as typeof prisma & {
  project: {
    create: (args: unknown) => Promise<StoredProject>;
    delete: (args: unknown) => Promise<StoredProject>;
    findFirst: (args: unknown) => Promise<StoredProject | null>;
    findMany: (args: unknown) => Promise<StoredProject[]>;
    findUnique: (args: unknown) => Promise<StoredProject | null>;
    update: (args: unknown) => Promise<StoredProject>;
  };
}).project;

export class AdminProjectsAccessError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminProjectsAccessError";
    this.status = status;
  }
}

export class ProjectsStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectsStorageError";
  }
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return new Date(0).toISOString();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

function toStoredStatus(status: ProjectFormValues["status"]): StoredProjectStatus {
  if (status === "published") {
    return "PUBLISHED";
  }

  if (status === "archived") {
    return "ARCHIVED";
  }

  return "DRAFT";
}

function toStoredAccent(accent: ProjectFormValues["accent"]): StoredProjectAccent {
  if (accent === "blue") {
    return "BLUE";
  }

  if (accent === "cream") {
    return "CREAM";
  }

  return "RED";
}

function toFormStatus(status: StoredProjectStatus) {
  if (status === "PUBLISHED") {
    return "published" as const;
  }

  if (status === "ARCHIVED") {
    return "archived" as const;
  }

  return "draft" as const;
}

function toFormAccent(accent: StoredProjectAccent) {
  if (accent === "BLUE") {
    return "blue" as const;
  }

  if (accent === "CREAM") {
    return "cream" as const;
  }

  return "red" as const;
}

function getProjectsStorageMessage(error: unknown) {
  if (isMissingProjectTableError(error)) {
    return "Project storage is not ready yet. Start the database and run `npx prisma db push` first.";
  }

  if (isPrismaConnectionError(error)) {
    return "The database is not reachable right now. Make sure PostgreSQL is running, then try again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "That project slug is already in use. Choose a different slug.";
    }

    if (error.code === "P2025") {
      return "That project could not be found.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The project data could not be updated right now.";
}

function parseStoredProjectValues(project: StoredProject): ProjectFormValues | null {
  const values = projectSchema.safeParse({
    accent: toFormAccent(project.accent),
    category: project.category,
    challenge: project.challenge,
    clientOrCompany: project.clientOrCompany,
    duration: project.duration,
    featured: project.featured,
    gallery: project.gallery,
    githubUrl: project.githubUrl ?? "",
    impactBullets: project.impactBullets,
    impactSummary: project.impactSummary,
    metrics: project.metrics,
    outcome: project.outcome,
    process: project.process,
    projectUrl: project.projectUrl ?? "",
    role: project.role,
    slug: project.slug,
    sortOrder: project.sortOrder === null ? "" : String(project.sortOrder),
    status: toFormStatus(project.status),
    summary: project.summary,
    tags: project.tags,
    techStack: project.techStack,
    thumbnailPlaceholder: project.thumbnailPlaceholder,
    title: project.title,
    year: project.year,
  });

  if (!values.success) {
    return null;
  }

  return values.data;
}

function toAdminProjectRecord(project: StoredProject): AdminProjectRecord | null {
  const values = parseStoredProjectValues(project);

  if (!values) {
    return null;
  }

  return {
    createdAt: normalizeDate(project.createdAt),
    id: project.id,
    source: "database",
    updatedAt: normalizeDate(project.updatedAt),
    values,
  };
}

function toPublicProjectDetail(project: StoredProject): PublicProjectDetail | null {
  const values = parseStoredProjectValues(project);

  if (!values || values.status !== "published") {
    return null;
  }

  return {
    accent: values.accent,
    category: values.category,
    challenge: values.challenge,
    clientOrCompany: values.clientOrCompany,
    duration: values.duration,
    featured: values.featured,
    gallery: values.gallery,
    githubUrl: values.githubUrl,
    impactBullets: values.impactBullets,
    impactSummary: values.impactSummary,
    metrics: values.metrics,
    outcome: values.outcome,
    process: values.process,
    projectUrl: values.projectUrl,
    role: values.role,
    slug: values.slug,
    summary: values.summary,
    tags: values.tags,
    techStack: values.techStack,
    thumbnailPlaceholder: values.thumbnailPlaceholder,
    title: values.title,
    year: values.year,
  };
}

function revalidateProjectSurfaces(previousSlug?: string | null, nextSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");

  if (previousSlug) {
    revalidatePath(`/projects/${previousSlug}`);
  }

  if (nextSlug && nextSlug !== previousSlug) {
    revalidatePath(`/projects/${nextSlug}`);
  }
}

function toProjectPersistenceInput(values: ProjectFormValues) {
  return {
    accent: toStoredAccent(values.accent),
    category: values.category,
    challenge: values.challenge,
    clientOrCompany: values.clientOrCompany,
    duration: values.duration,
    featured: values.featured,
    gallery: values.gallery,
    githubUrl: values.githubUrl || null,
    impactBullets: values.impactBullets,
    impactSummary: values.impactSummary,
    metrics: values.metrics,
    outcome: values.outcome,
    process: values.process,
    projectUrl: values.projectUrl || null,
    role: values.role,
    slug: values.slug,
    sortOrder: values.sortOrder === "" ? null : Number(values.sortOrder),
    status: toStoredStatus(values.status),
    summary: values.summary,
    tags: values.tags,
    techStack: values.techStack,
    thumbnailPlaceholder: values.thumbnailPlaceholder,
    title: values.title,
    year: values.year,
  };
}

export async function getAdminProjectsContext(requestHeaders: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    throw new AdminProjectsAccessError(401, "You must be signed in to manage projects.");
  }

  if (!projectAdminRoles.includes(session.user.role as (typeof projectAdminRoles)[number])) {
    throw new AdminProjectsAccessError(403, "You are not allowed to manage projects.");
  }

  return {
    currentUserId: session.user.id,
    headers: requestHeaders,
    role: session.user.role ?? "",
  };
}

export async function getAdminProjects(): Promise<AdminProjectRecord[]> {
  try {
    const projects = await projectModel.findMany({
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
    });

    return projects
      .map((project) => toAdminProjectRecord(project))
      .filter((project): project is AdminProjectRecord => Boolean(project));
  } catch (error) {
    throw new ProjectsStorageError(getProjectsStorageMessage(error));
  }
}

export async function getPublicProjects(): Promise<PublicProjectSummary[]> {
  try {
    const projects = await projectModel.findMany({
      where: {
        status: "PUBLISHED",
      },
    });

    return sortPublicProjectSummaries(
      projects
        .map((project) => {
          const detail = toPublicProjectDetail(project);

          if (!detail) {
            return null;
          }

          return {
            ...detail,
            sortOrder: project.sortOrder,
            updatedAt: normalizeDate(project.updatedAt),
          };
        })
        .filter(
          (
            project,
          ): project is PublicProjectDetail & { sortOrder: number | null; updatedAt: string } =>
            Boolean(project),
        ),
    ).map(({ sortOrder: _sortOrder, updatedAt: _updatedAt, ...project }) => project);
  } catch (error) {
    throw new ProjectsStorageError(getProjectsStorageMessage(error));
  }
}

export async function getFeaturedPublicProjects(limit?: number) {
  const projects = await getPublicProjects();
  const featuredProjects = projects.filter((project) => project.featured);

  return typeof limit === "number" ? featuredProjects.slice(0, limit) : featuredProjects;
}

export async function getPublicProjectBySlug(slug: string) {
  try {
    const project = await projectModel.findUnique({
      where: {
        slug,
      },
    });

    if (!project) {
      return null;
    }

    return toPublicProjectDetail(project);
  } catch (error) {
    throw new ProjectsStorageError(getProjectsStorageMessage(error));
  }
}

export async function getProjectDashboardSummary(): Promise<ProjectDashboardSummary> {
  const projects = await getAdminProjects();
  const publishedCount = projects.filter((project) => project.values.status === "published").length;
  const featuredCount = projects.filter((project) => project.values.featured).length;
  const archivedCount = projects.filter((project) => project.values.status === "archived").length;
  const latestUpdatedAt =
    projects
      .map((project) => project.updatedAt)
      .filter((value) => value && value !== new Date(0).toISOString())
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;

  return {
    archivedCount,
    featuredCount,
    latestUpdatedAt,
    publishedCount,
    totalCount: projects.length,
    unpublishedCount: projects.length - publishedCount,
  };
}

export async function createAdminProject(input: ProjectFormValues): Promise<ProjectActionResult> {
  try {
    const values = projectSchema.parse(input);

    await projectModel.create({
      data: toProjectPersistenceInput(values),
    });
    revalidateProjectSurfaces(null, values.slug);

    return {
      message: `${values.title} was saved to the project database.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        message: error.issues[0]?.message ?? "Please review the project fields.",
        ok: false,
      };
    }

    return {
      message: getProjectsStorageMessage(error),
      ok: false,
    };
  }
}

export async function updateAdminProject(
  id: string,
  input: ProjectFormValues,
): Promise<ProjectActionResult> {
  try {
    const values = projectSchema.parse(input);
    const existingProject = await projectModel.findUnique({
      where: {
        id,
      },
    });

    if (!existingProject) {
      return {
        message: "That project could not be found.",
        ok: false,
      };
    }

    await projectModel.update({
      data: toProjectPersistenceInput(values),
      where: {
        id,
      },
    });
    revalidateProjectSurfaces(existingProject.slug, values.slug);

    return {
      message: `${values.title} was updated in the project database.`,
      ok: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        message: error.issues[0]?.message ?? "Please review the project fields.",
        ok: false,
      };
    }

    return {
      message: getProjectsStorageMessage(error),
      ok: false,
    };
  }
}

export async function deleteAdminProject(id: string): Promise<ProjectActionResult> {
  try {
    const deletedProject = await projectModel.delete({
      where: {
        id,
      },
    });
    revalidateProjectSurfaces(deletedProject.slug, deletedProject.slug);

    return {
      message: "Project removed from the database.",
      ok: true,
    };
  } catch (error) {
    return {
      message: getProjectsStorageMessage(error),
      ok: false,
    };
  }
}

export { formatProjectUpdatedAt };
