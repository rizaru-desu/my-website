import { headers } from "next/headers";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { DashboardAnalytics } from "./dashboard-analytics";
import { ProfileAvatar } from "@/components/profile-avatar";
import { SocialLinkIcon } from "@/components/social-link-icon";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { SectionShell } from "@/components/ui/section-shell";
import { auth } from "@/lib/auth";
import { getAdminBlogs, BlogStorageError } from "@/lib/blog";
import { getDashboardMessageAnalytics } from "@/lib/messages";
import { getAdminProfileContent } from "@/lib/profile";
import { formatProfileUpdatedAt } from "@/lib/profile.shared";
import {
  getProjectDashboardSummary,
  ProjectsStorageError,
} from "@/lib/projects";
import { getDashboardResumeSyncMetric } from "@/lib/resume";
import { getAdminSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

function SummaryStatCard({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string | number;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-[20px] border-[3px] border-ink bg-white/72 px-4 py-3 shadow-[4px_4px_0_var(--ink)]">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink/50 sm:text-xs sm:tracking-[0.18em]">
        {label}
      </p>
      <p
        className={`mt-2 font-display uppercase text-ink text-balance ${valueClassName}`.trim()}
      >
        {value}
      </p>
    </div>
  );
}

function formatDashboardDate(value: string | null | undefined) {
  if (!value) {
    return "Not saved yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return "Fallback seed";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboardPage() {
  noStore();

  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
  const [
    messageAnalytics,
    profileContent,
    resumeSyncMetric,
    skills,
    projectSummaryResult,
    blogResult,
  ] = await Promise.all([
    getDashboardMessageAnalytics(),
    getAdminProfileContent(),
    getDashboardResumeSyncMetric(),
    getAdminSkills(),
    getProjectDashboardSummary()
      .then((summary) => ({ error: null, summary }))
      .catch((error) => ({
        error:
          error instanceof ProjectsStorageError
            ? error.message
            : "The live projects archive is unavailable right now.",
        summary: null,
      })),
    getAdminBlogs()
      .then((posts) => ({ error: null, posts }))
      .catch((error) => ({
        error:
          error instanceof BlogStorageError
            ? error.message
            : "Blog posts unavailable right now.",
        posts: [] as Awaited<ReturnType<typeof getAdminBlogs>>,
      })),
  ]);
  const blogPosts = blogResult.posts;
  const blogError = blogResult.error;
  const publishedBlogCount = blogPosts.filter(
    (p) => p.values.status === "published",
  ).length;
  const draftBlogCount = blogPosts.filter(
    (p) => p.values.status === "draft",
  ).length;
  const recentBlogPosts = blogPosts.slice(0, 3);
  const canManageResume = session?.user?.role === "architect";
  const canManageProfile = session?.user?.role === "architect";
  const projectSummary = projectSummaryResult.summary;
  const projectSummaryError = projectSummaryResult.error;
  const hasProfilePhoto = Boolean(profileContent.profilePhotoUrl);
  const profileSourceLabel =
    profileContent.source === "database"
      ? "Database Saved"
      : "Fallback Content";
  const profileStatusLabel = hasProfilePhoto
    ? "Photo Live"
    : "Initials Fallback";
  const skillCategories = Array.from(
    skills.reduce((map, skill) => {
      const existingSkills = map.get(skill.values.category) ?? [];
      existingSkills.push(skill);
      map.set(skill.values.category, existingSkills);
      return map;
    }, new Map<string, typeof skills>()),
  ).sort(([leftCategory], [rightCategory]) =>
    leftCategory.localeCompare(rightCategory),
  );
  const featuredSkills = skills.filter((skill) => skill.values.featured);
  const advancedSkills = skills.filter(
    (skill) => skill.values.level === "advanced",
  );
  const hasDatabaseSkills = skills.some((skill) => skill.source === "database");
  const latestSkillUpdate =
    skills
      .map((skill) => new Date(skill.updatedAt))
      .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() > 0)
      .sort(
        (leftDate, rightDate) => rightDate.getTime() - leftDate.getTime(),
      )[0] ?? null;
  const skillSourceLabel =
    skills.length === 0
      ? "Empty Board"
      : hasDatabaseSkills
        ? "Database Live"
        : "Fallback Seed";
  const projectStatusLabel = projectSummaryError
    ? "Unavailable"
    : !projectSummary || projectSummary.totalCount === 0
      ? "Empty Archive"
      : projectSummary.unpublishedCount > 0
        ? "Needs review"
        : "Live";
  const syncedMetrics = [
    {
      label: "Published Projects",
      accent: "red" as const,
      change: projectSummaryError
        ? "Storage issue"
        : `${projectSummary?.featuredCount ?? 0} featured`,
      note: projectSummaryError
        ? projectSummaryError
        : `${projectSummary?.totalCount ?? 0} total projects with ${projectSummary?.unpublishedCount ?? 0} not yet published.`,
      value: String(projectSummary?.publishedCount ?? 0).padStart(2, "0"),
    },
    {
      label: "Messages Flagged",
      accent: "cream" as const,
      change: messageAnalytics.metric.change,
      note: messageAnalytics.metric.note,
      value: messageAnalytics.metric.value,
    },
    {
      label: "Resume Sync",
      accent: "blue" as const,
      change: resumeSyncMetric.change,
      note: resumeSyncMetric.note,
      value: resumeSyncMetric.value,
    },
  ];

  const syncedCollections = [
    {
      title: "Profile & Resume",
      itemCount: `${profileContent.socialLinks.length} links`,
      status: profileContent.source === "database" ? "Live" : "Fallback",
      description:
        "Core identity, availability, links, and resume highlights that drive the public hero and resume route.",
      href: "/admin/profile",
      accent: "blue" as const,
    },
    {
      title: "Account Settings",
      itemCount: "6 controls",
      status: "Security Preview",
      description:
        "Login identity, password and email changes, 2FA setup, and delete-account confirmation in a dedicated surface.",
      href: "/admin/account",
      accent: "red" as const,
    },
    {
      title: "Projects Library",
      itemCount: `${projectSummary?.totalCount ?? 0} entries`,
      status: projectStatusLabel,
      description:
        "Case-study cards, detail-page content, metrics, and featured ordering for the public work archive.",
      href: "/admin/projects",
      accent: "red" as const,
    },
    {
      title: "Blog Editorial",
      itemCount: blogError ? "Unavailable" : `${blogPosts.length} entries`,
      status: blogError
        ? "Storage issue"
        : publishedBlogCount > 0
          ? `${publishedBlogCount} live`
          : draftBlogCount > 0
            ? "Drafting"
            : "Empty",
      description:
        "Article lineup with tag organization, featured stories, and editorial framing for the thought-leadership side.",
      href: "/admin/blog",
      accent: "cream" as const,
    },
    {
      title: "Skills Workspace",
      itemCount: `${skills.length} skills`,
      status: hasDatabaseSkills ? "Database live" : "Seed fallback",
      description:
        "Persisted capability tags, levels, featured flags, and category grouping for public skill sections.",
      href: "/admin/skills",
      accent: "blue" as const,
    },
  ];

  const syncedQueue = [
    {
      title: "Profile polish",
      note: `${profileContent.availability} Photo: ${hasProfilePhoto ? "uploaded" : "using initials"}. Social links: ${profileContent.socialLinks.length}.`,
      status:
        profileContent.source === "database"
          ? "Database live"
          : "Needs first save",
      accent: "blue" as const,
    },
    {
      title: "Project refresh",
      note: projectSummaryError
        ? projectSummaryError
        : `${projectSummary?.publishedCount ?? 0} published, ${projectSummary?.unpublishedCount ?? 0} awaiting review, ${projectSummary?.featuredCount ?? 0} featured.`,
      status: projectStatusLabel,
      accent: "red" as const,
    },
    {
      title: "Skill coverage",
      note: `${featuredSkills.length} featured, ${advancedSkills.length} advanced, ${skillCategories.length} categories.`,
      status: hasDatabaseSkills ? "Database live" : "Needs first save",
      accent: "cream" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="surface-panel relative overflow-hidden bg-panel px-6 py-8 sm:px-8">
        <div className="accent-plate left-8 top-8 hidden h-14 w-14 -rotate-6 rounded-[18px] bg-accent-red lg:block" />
        <div className="accent-plate bottom-8 right-10 hidden h-12 w-28 rotate-3 rounded-full bg-accent-blue lg:block" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Badge variant="red">Dashboard</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              A content workspace, not a default admin skin.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-ink/78 sm:text-lg">
              This side keeps the same yellow-black-red-blue energy as the
              public portfolio, but turns it into a working environment for
              shaping profile, projects, blog writing, and resume content.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/projects" className="button-link">
              Open Projects
            </Link>
            <Link href="/admin/blog" className="button-link button-link-blue">
              Open Blog
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <EditorialCard accent="blue" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="blue">Profile Snapshot</Badge>
              <div className="space-y-2">
                <h2 className="font-display text-4xl uppercase leading-none text-ink">
                  {profileContent.fullName}
                </h2>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/62">
                  {profileContent.headline}
                </p>
              </div>
            </div>
            <ProfileAvatar
              name={profileContent.fullName}
              src={profileContent.profilePhotoUrl}
              className="h-24 w-24 rounded-[24px]"
              fallbackClassName="text-4xl"
            />
          </div>

          <p className="text-sm leading-7 text-ink/78">
            {profileContent.shortIntro}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <SummaryStatCard
              label="Source"
              value={profileSourceLabel}
              valueClassName="text-[1.2rem] leading-[0.95] sm:text-[1.35rem] 2xl:text-2xl"
            />
            <SummaryStatCard
              label="Avatar"
              value={profileStatusLabel}
              valueClassName="text-[1.2rem] leading-[0.95] sm:text-[1.35rem] 2xl:text-2xl"
            />
            <SummaryStatCard
              label="Updated"
              value={formatProfileUpdatedAt(profileContent.updatedAt)}
              valueClassName="text-[1.2rem] leading-[0.95] sm:text-[1.35rem] 2xl:text-2xl"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {canManageProfile ? (
              <Link
                href="/admin/profile"
                className="button-link button-link-blue"
              >
                Edit Profile
              </Link>
            ) : null}
            <Link href="/" className="button-link">
              View Public
            </Link>
          </div>
        </EditorialCard>

        <EditorialCard accent="red" className="space-y-5">
          <div className="space-y-3">
            <Badge variant="red">Social Links</Badge>
            <h2 className="font-display text-4xl uppercase leading-none text-ink">
              {profileContent.socialLinks.length} public destinations.
            </h2>
            <p className="text-sm leading-7 text-ink/78">
              These links now use the same automatic icon resolver as the public
              contact and footer surfaces.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profileContent.socialLinks.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex min-w-0 items-center gap-3 rounded-[20px] border-[3px] border-ink bg-white/75 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-ink shadow-[4px_4px_0_var(--ink)] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-panel">
                  <SocialLinkIcon href={link.href} label={link.label} />
                </span>
                <span className="min-w-0 truncate">{link.label}</span>
              </a>
            ))}
          </div>
        </EditorialCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <EditorialCard accent="cream" className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="cream">Skills Snapshot</Badge>
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                {skills.length} live capability tags.
              </h2>
              <p className="text-sm leading-7 text-ink/78">
                The dashboard now reads the same persisted skills collection
                used by the public homepage, resume, and skills manager.
              </p>
            </div>
            {canManageProfile ? (
              <Link
                href="/admin/skills"
                className="button-link button-link-blue"
              >
                Manage Skills
              </Link>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <SummaryStatCard
              label="Source"
              value={skillSourceLabel}
              valueClassName="text-[1.15rem] leading-[0.95] sm:text-[1.2rem]"
            />
            <SummaryStatCard
              label="Categories"
              value={skillCategories.length}
              valueClassName="text-4xl leading-none"
            />
            <SummaryStatCard
              label="Featured"
              value={featuredSkills.length}
              valueClassName="text-4xl leading-none"
            />
            <SummaryStatCard
              label="Updated"
              value={formatDashboardDate(
                latestSkillUpdate?.toISOString() ?? null,
              )}
              valueClassName="text-[1.15rem] leading-[0.95] sm:text-[1.2rem]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {featuredSkills.length > 0 ? (
              featuredSkills.slice(0, 8).map((skill) => (
                <Badge key={skill.id} variant="blue">
                  {skill.values.name}
                </Badge>
              ))
            ) : (
              <Badge variant="yellow">No featured skills yet</Badge>
            )}
          </div>
        </EditorialCard>

        <EditorialCard accent="blue" className="space-y-5">
          <div className="space-y-3">
            <Badge variant="blue">Category Health</Badge>
            <h2 className="font-display text-4xl uppercase leading-none text-ink">
              Group balance at a glance.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {skillCategories.length > 0 ? (
              skillCategories.slice(0, 6).map(([category, categorySkills]) => {
                const categoryFeaturedCount = categorySkills.filter(
                  (skill) => skill.values.featured,
                ).length;
                const categoryAdvancedCount = categorySkills.filter(
                  (skill) => skill.values.level === "advanced",
                ).length;

                return (
                  <div
                    key={category}
                    className="min-w-0 rounded-[20px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[4px_4px_0_var(--ink)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-2xl uppercase leading-none text-ink wrap-anywhere">
                        {category}
                      </p>
                      <Badge
                        variant={categoryFeaturedCount > 0 ? "red" : "cream"}
                      >
                        {categorySkills.length}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink/58">
                      {categoryFeaturedCount} featured • {categoryAdvancedCount}{" "}
                      advanced
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[20px] border-[3px] border-dashed border-ink/25 bg-white/70 px-4 py-5 text-sm font-semibold uppercase tracking-[0.16em] text-ink/56">
                Add skills to populate category health.
              </div>
            )}
          </div>
        </EditorialCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {syncedMetrics.map((metric) => (
          <EditorialCard
            key={metric.label}
            accent={metric.accent}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                {metric.label}
              </p>
              <span className="sticker-chip sticker-chip-cream">
                {metric.change}
              </span>
            </div>
            <p className="font-display text-5xl uppercase leading-none text-ink">
              {metric.value}
            </p>
            <p className="text-sm leading-7 text-ink/78">{metric.note}</p>
          </EditorialCard>
        ))}
      </section>

      <DashboardAnalytics
        canManageResume={canManageResume}
        messageAnalytics={messageAnalytics}
      />

      <SectionShell
        label="Collections"
        title="Everything the public portfolio depends on."
        description="These collection surfaces feel curated and directional rather than spreadsheet-like."
        contentClassName="grid gap-6 xl:grid-cols-3"
      >
        {syncedCollections.map((collection) => (
          <EditorialCard
            key={collection.title}
            accent={collection.accent}
            className="flex h-full flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-3">
              <Badge
                variant={
                  collection.accent === "cream" ? "yellow" : collection.accent
                }
              >
                {collection.status}
              </Badge>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
                {collection.itemCount}
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                {collection.title}
              </h2>
              <p className="text-sm leading-7 text-ink/78">
                {collection.description}
              </p>
            </div>
            <div className="mt-auto pt-2">
              <Link href={collection.href} className="button-link">
                Open Collection
              </Link>
            </div>
          </EditorialCard>
        ))}
      </SectionShell>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionShell
          label="Recent Activity"
          title="Latest blog entries."
          contentClassName="space-y-5"
        >
          {blogError ? (
            <div className="rounded-[20px] border-[3px] border-dashed border-ink/25 bg-white/70 px-4 py-8 text-center text-sm font-semibold uppercase tracking-[0.16em] text-ink/56">
              {blogError}
            </div>
          ) : recentBlogPosts.length === 0 ? (
            <div className="rounded-[20px] border-[3px] border-dashed border-ink/25 bg-white/70 px-4 py-8 text-center text-sm font-semibold uppercase tracking-[0.16em] text-ink/56">
              No blog posts yet. Start writing in the Blog Editorial.
            </div>
          ) : (
            recentBlogPosts.map((post, index) => (
              <EditorialCard
                key={post.id}
                accent={index === 0 ? "red" : index === 1 ? "blue" : "cream"}
                className="space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                    {post.values.status} •{" "}
                    {post.values.tags?.slice(0, 2).join(", ") || "Untagged"}
                  </p>
                  <Badge
                    variant={
                      post.values.status === "published" ? "red" : "cream"
                    }
                  >
                    {post.values.status === "published" ? "Live" : "Draft"}
                  </Badge>
                </div>
                <h3 className="font-display text-3xl uppercase leading-none text-ink wrap-anywhere">
                  {post.values.title}
                </h3>
                <p className="text-sm leading-7 text-ink/78">
                  {post.values.excerpt}
                </p>
              </EditorialCard>
            ))
          )}
        </SectionShell>

        <SectionShell
          label="Queue"
          title="What is ready, blocked, or in motion."
          contentClassName="space-y-5"
        >
          {syncedQueue.map((item) => (
            <EditorialCard
              key={item.title}
              accent={item.accent}
              className="space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {item.title}
                </h3>
                <Badge variant={item.accent}>{item.status}</Badge>
              </div>
              <p className="text-sm leading-7 text-ink/78">{item.note}</p>
            </EditorialCard>
          ))}
        </SectionShell>
      </section>
    </div>
  );
}
