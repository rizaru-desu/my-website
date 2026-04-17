import {
  projectAccentValues,
  projectStatusValues,
  type ProjectFormValues,
} from "@/app/admin/projects/project.schema";

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item : ""));
}

function asMetricArray(value: unknown): ProjectFormValues["metrics"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const metric = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    return {
      label: asString(metric.label),
      value: asString(metric.value),
    };
  });
}

function asGalleryArray(value: unknown): ProjectFormValues["gallery"] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const galleryItem =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    return {
      caption: asString(galleryItem.caption),
      title: asString(galleryItem.title),
    };
  });
}

export function coerceProjectFormValues(payload: unknown): ProjectFormValues {
  const record =
    payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};

  return {
    accent: projectAccentValues.includes(record.accent as ProjectFormValues["accent"])
      ? (record.accent as ProjectFormValues["accent"])
      : "red",
    category: asString(record.category),
    challenge: asString(record.challenge),
    clientOrCompany: asString(record.clientOrCompany),
    duration: asString(record.duration),
    featured: Boolean(record.featured),
    gallery: asGalleryArray(record.gallery),
    githubUrl: asString(record.githubUrl),
    impactBullets: asStringArray(record.impactBullets),
    impactSummary: asString(record.impactSummary),
    metrics: asMetricArray(record.metrics),
    outcome: asString(record.outcome),
    process: asStringArray(record.process),
    projectUrl: asString(record.projectUrl),
    role: asString(record.role),
    slug: asString(record.slug),
    sortOrder: asString(record.sortOrder),
    status: projectStatusValues.includes(record.status as ProjectFormValues["status"])
      ? (record.status as ProjectFormValues["status"])
      : "draft",
    summary: asString(record.summary),
    tags: asStringArray(record.tags),
    techStack: asStringArray(record.techStack),
    thumbnailPlaceholder: asString(record.thumbnailPlaceholder),
    title: asString(record.title),
    year: asString(record.year),
  };
}
