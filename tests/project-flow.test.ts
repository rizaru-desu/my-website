import assert from "node:assert/strict";
import test from "node:test";

import { projectSchema } from "../app/admin/projects/project.schema.ts";
import {
  formatProjectUpdatedAt,
  getProjectRepositoryLabel,
  normalizeProjectAccent,
  normalizeProjectStatus,
  sortPublicProjectSummaries,
} from "../lib/projects.shared.ts";

const validProjectPayload = {
  accent: " blue ",
  category: " Portfolio Platform ",
  challenge:
    "  Most portfolio sites either look generic or bury proof beneath decoration, so the challenge was to keep the direction bold without losing hiring signal.  ",
  clientOrCompany: " Personal Product Concept ",
  duration: " 4 weeks ",
  featured: true,
  gallery: [
    {
      caption:
        " Layered title treatment and recruiter CTAs tuned for fast first impressions. ",
      title: " Hero Composition ",
    },
  ],
  githubUrl: " https://github.com/rizal-achmad/pulse-cms-portfolio ",
  impactBullets: [" Clarified content hierarchy ", " Reduced admin friction "],
  impactSummary:
    "  Clarified content hierarchy and reduced admin friction in the core showcase experience.  ",
  metrics: [
    {
      label: " Public sections ",
      value: " 6 ",
    },
  ],
  outcome:
    "  The final concept balances personality with trust while remaining easy to scan in hiring contexts.  ",
  process: [
    " Mapped the recruiter journey into credibility, work evidence, and contact confidence. ",
  ],
  projectUrl: " https://portfolio-rizal.dev/projects/pulse-cms-portfolio ",
  role: " Product Designer + Full-Stack Engineer ",
  slug: "pulse-cms-portfolio",
  sortOrder: "1",
  status: "published",
  summary:
    "  A recruiter-friendly portfolio and content studio concept built to let one creator manage projects without touching code.  ",
  tags: [" Portfolio ", " Case Study "],
  techStack: [" Next.js ", " TypeScript "],
  thumbnailPlaceholder: " Pulse CMS Portfolio cover frame ",
  title: " Pulse CMS Portfolio ",
  year: "2026",
} as const;

test("project schema trims nested values and preserves structured arrays", () => {
  const result = projectSchema.parse({
    ...validProjectPayload,
    accent: "blue",
  });

  assert.equal(result.title, "Pulse CMS Portfolio");
  assert.equal(result.category, "Portfolio Platform");
  assert.equal(result.duration, "4 weeks");
  assert.equal(result.impactSummary, "Clarified content hierarchy and reduced admin friction in the core showcase experience.");
  assert.deepEqual(result.tags, ["Portfolio", "Case Study"]);
  assert.deepEqual(result.techStack, ["Next.js", "TypeScript"]);
  assert.deepEqual(result.metrics, [{ label: "Public sections", value: "6" }]);
  assert.deepEqual(result.gallery, [
    {
      caption: "Layered title treatment and recruiter CTAs tuned for fast first impressions.",
      title: "Hero Composition",
    },
  ]);
});

test("project schema rejects incomplete metric or gallery rows", () => {
  const invalidMetrics = projectSchema.safeParse({
    ...validProjectPayload,
    accent: "blue",
    metrics: [{ label: "Only label", value: "" }],
  });
  const invalidGallery = projectSchema.safeParse({
    ...validProjectPayload,
    accent: "blue",
    gallery: [{ title: "Only title", caption: "short" }],
  });

  assert.equal(invalidMetrics.success, false);
  assert.equal(invalidGallery.success, false);
});

test("project accent and status normalizers fall back safely", () => {
  assert.equal(normalizeProjectAccent("blue"), "blue");
  assert.equal(normalizeProjectAccent("unknown"), "red");
  assert.equal(normalizeProjectStatus("archived"), "archived");
  assert.equal(normalizeProjectStatus("unexpected"), "draft");
});

test("public project sorting uses sortOrder first, featured second, and updatedAt desc", () => {
  const sorted = sortPublicProjectSummaries([
    {
      featured: false,
      sortOrder: null,
      updatedAt: "2026-04-12T00:00:00.000Z",
    },
    {
      featured: true,
      sortOrder: 2,
      updatedAt: "2026-04-10T00:00:00.000Z",
    },
    {
      featured: false,
      sortOrder: 1,
      updatedAt: "2026-04-09T00:00:00.000Z",
    },
    {
      featured: true,
      sortOrder: null,
      updatedAt: "2026-04-14T00:00:00.000Z",
    },
  ]);

  assert.deepEqual(
    sorted.map((project) => `${project.sortOrder ?? "null"}:${project.featured}:${project.updatedAt}`),
    [
      "1:false:2026-04-09T00:00:00.000Z",
      "2:true:2026-04-10T00:00:00.000Z",
      "null:true:2026-04-14T00:00:00.000Z",
      "null:false:2026-04-12T00:00:00.000Z",
    ],
  );
});

test("project updated date formatter handles invalid values", () => {
  assert.equal(formatProjectUpdatedAt("2026-04-14T00:00:00.000Z"), "Apr 14, 2026");
  assert.equal(formatProjectUpdatedAt("not-a-date"), "Unknown");
  assert.equal(formatProjectUpdatedAt(null), "Unknown");
});

test("project repository label reflects hosting provider with safe fallback", () => {
  assert.equal(getProjectRepositoryLabel("https://github.com/example/repo"), "GitHub");
  assert.equal(getProjectRepositoryLabel("https://gitlab.com/example/repo"), "GitLab");
  assert.equal(getProjectRepositoryLabel("https://bitbucket.org/example/repo"), "Bitbucket");
  assert.equal(getProjectRepositoryLabel("https://codeberg.org/example/repo"), "Repository");
  assert.equal(getProjectRepositoryLabel("not-a-url"), "Repository");
});
