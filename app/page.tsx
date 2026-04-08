import Link from "next/link";

import { skillSeedRecords } from "@/app/admin/skills/skill.default-values";
import { BlogCard } from "@/components/blog-card";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { SectionShell } from "@/components/ui/section-shell";
import { StatTile } from "@/components/ui/stat-tile";
import {
  featuredPosts,
  featuredProjects,
  profile,
  testimonials,
} from "@/lib/mock-content";

export default function Home() {
  const groupedSkills = Array.from(
    skillSeedRecords.reduce((map, skill) => {
      const existingGroup = map.get(skill.values.category) ?? [];
      existingGroup.push(skill);
      map.set(skill.values.category, existingGroup);
      return map;
    }, new Map<string, typeof skillSeedRecords>()),
  );

  const totalFeaturedSkills = skillSeedRecords.filter(
    (skill) => skill.values.featured,
  ).length;

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
        <section className="relative overflow-hidden rounded-[36px] border-[3px] border-ink bg-panel px-6 py-10 shadow-[10px_10px_0_var(--ink)] sm:px-8 lg:px-10 lg:py-12">
          <div className="hero-shadow hidden lg:block" />
          <div className="accent-plate left-8 top-8 hidden h-16 w-16 -rotate-6 rounded-[22px] bg-accent-red lg:block" />
          <div className="accent-plate bottom-10 left-[44%] hidden h-12 w-32 -rotate-3 rounded-full bg-accent-blue lg:block" />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-8">
              <Badge>{profile.availability}</Badge>
              <div className="space-y-5">
                <p className="max-w-md text-sm font-semibold uppercase tracking-[0.3em] text-ink/65">
                  Portfolio Platform • {profile.role} • {profile.location}
                </p>
                <h1 className="font-display text-6xl uppercase leading-[0.88] tracking-tight text-ink sm:text-7xl lg:text-[7.5rem]">
                  <span className="hero-outline block">Portfolio</span>
                  <span className="block text-accent-red">Outside.</span>
                  <span className="block text-accent-blue">Control Inside.</span>
                </h1>
                <p className="max-w-2xl text-base leading-8 text-ink/75 sm:text-lg">
                  {profile.intro}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/projects" className="button-link">
                  View Projects
                </Link>
                <Link href="/resume" className="button-link button-link-blue">
                  Read Resume
                </Link>
                <Link href="/admin" className="button-link">
                  Open Workspace
                </Link>
                <a href={`mailto:${profile.email}`} className="button-link button-link-muted">
                  Email Me
                </a>
              </div>
            </div>
            <EditorialCard accent="blue" className="relative space-y-5">
              <Badge variant="blue">Public Meets Workspace</Badge>
              <h2 className="font-display text-4xl uppercase leading-none text-ink">
                {profile.tagline}
              </h2>
              <div className="space-y-3 border-t-[3px] border-dashed border-ink/25 pt-5">
                {profile.focus.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border-[3px] border-ink bg-white/60 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </EditorialCard>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profile.stats.map((stat) => (
            <StatTile
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
            />
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <EditorialCard accent="red" className="space-y-5">
            <Badge variant="red">Product Direction</Badge>
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              A recruiter-facing front stage with a bold content studio behind it.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-ink/80 sm:text-lg">
              The public experience stays polished and convincing for recruiters, while
              the workspace uses the same visual DNA to manage profile, projects, writing,
              and resume content without slipping into generic dashboard UI.
            </p>
          </EditorialCard>

          <EditorialCard className="paper-grid space-y-5">
            <Badge variant="cream">Workspace Overview</Badge>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
                  Content control
                </p>
                <p className="mt-3 font-display text-3xl uppercase leading-none text-ink">
                  Projects, blog, resume
                </p>
              </div>
              <div className="rounded-[24px] border-[3px] border-ink bg-accent-blue px-4 py-4 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Visual logic
                </p>
                <p className="mt-3 font-display text-3xl uppercase leading-none">
                  Editorial, not templated
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin" className="button-link">
                Enter Workspace
              </Link>
              <Link href="/projects" className="button-link button-link-blue">
                See Public Work
              </Link>
            </div>
          </EditorialCard>
        </section>

        <SectionShell
          label="Skill Mix"
          title="Capabilities grouped the same way the workspace manages them."
          description="This section reflects the same skills structure used in the workspace: grouped categories, featured strengths, and lightweight proficiency signals that stay readable for recruiters."
          contentClassName="space-y-6"
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <EditorialCard accent="blue" className="space-y-5">
              <Badge variant="blue">Featured Skills</Badge>
              <h3 className="font-display text-4xl uppercase leading-none text-ink">
                Strong frontend systems, product delivery, and content range.
              </h3>
              <p className="text-sm leading-7 text-ink/78">
                The public landing page now mirrors the same grouped capability model
                used inside the skills workspace, so the portfolio and the admin surface stay
                aligned instead of drifting into separate content structures.
              </p>
              <div className="flex flex-wrap gap-2">
                {skillSeedRecords
                  .filter((skill) => skill.values.featured)
                  .map((skill) => (
                    <Badge key={skill.id} variant="cream">
                      {skill.values.name}
                    </Badge>
                  ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Categories
                  </p>
                  <p className="mt-3 font-display text-4xl uppercase leading-none text-ink">
                    {groupedSkills.length}
                  </p>
                </div>
                <div className="rounded-[24px] border-[3px] border-ink bg-white/70 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/55">
                    Featured
                  </p>
                  <p className="mt-3 font-display text-4xl uppercase leading-none text-ink">
                    {totalFeaturedSkills}
                  </p>
                </div>
              </div>
            </EditorialCard>

            <div className="grid gap-6 lg:grid-cols-2">
              {groupedSkills.map(([category, skills], index) => {
                const featuredSkills = skills.filter((skill) => skill.values.featured);
                const advancedSkills = skills.filter(
                  (skill) => skill.values.level === "advanced",
                ).length;
                const proficiencyWidth = Math.max(
                  28,
                  Math.round((advancedSkills / skills.length) * 100),
                );

                return (
                  <EditorialCard
                    key={category}
                    accent={
                      index % 4 === 1
                        ? "red"
                        : index % 4 === 2
                          ? "blue"
                          : "cream"
                    }
                    className="space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-3xl uppercase leading-none text-ink">
                          {category}
                        </h3>
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/58">
                          {skills.length} skills
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-ink/75">
                        {featuredSkills.length > 0
                          ? `Highlighted by ${featuredSkills
                              .map((skill) => skill.values.name)
                              .join(", ")}.`
                          : "Balanced capability group for production-facing portfolio work."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink/58">
                        <span>Proficiency signal</span>
                        <span>{advancedSkills} advanced</span>
                      </div>
                      <div className="h-4 rounded-full border-[3px] border-ink bg-white/70 p-1">
                        <div
                          className="h-full rounded-full bg-accent-blue transition-all"
                          style={{ width: `${proficiencyWidth}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant={skill.values.featured ? "blue" : "cream"}
                        >
                          {skill.values.name}
                        </Badge>
                      ))}
                    </div>
                  </EditorialCard>
                );
              })}
            </div>
          </div>
        </SectionShell>

        <SectionShell
          label="Featured Work"
          title="Case studies with a clear story arc."
          description="Selected projects are framed to surface role, impact, and delivery logic before the deeper details."
          contentClassName="grid gap-6 lg:grid-cols-3"
        >
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </SectionShell>

        <SectionShell
          label="Selected Writing"
          title="Short reads that show how I think."
          description="Writing focuses on portfolio strategy, premium UI choices, and product communication."
          contentClassName="grid gap-6 lg:grid-cols-2"
        >
          {featuredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </SectionShell>

        <SectionShell
          label="Proof"
          title="Testimonials shaped like sharp recommendations."
          description="These quotes show how social proof can sit inside the same visual language without becoming an afterthought."
          contentClassName="grid gap-6 lg:grid-cols-2"
        >
          {testimonials.map((testimonial, index) => (
            <EditorialCard
              key={testimonial.name}
              accent={index % 2 === 0 ? "red" : "blue"}
              className="space-y-5"
            >
              <p className="font-display text-4xl uppercase leading-none text-ink">
                “
              </p>
              <p className="text-base leading-8 text-ink/80 sm:text-lg">
                {testimonial.quote}
              </p>
              <div className="border-t-[3px] border-dashed border-ink/25 pt-4">
                <p className="font-display text-2xl uppercase leading-none text-ink">
                  {testimonial.name}
                </p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-ink/65">
                  {testimonial.role}
                </p>
              </div>
            </EditorialCard>
          ))}
        </SectionShell>

        <section className="surface-panel surface-panel-red paper-grid overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-4">
              <Badge variant="red">Final CTA</Badge>
              <h2 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
                Ready for the full story?
              </h2>
              <p className="max-w-2xl text-base leading-7 text-ink/80 sm:text-lg">
                Browse the project archive, read a few notes, or jump straight to the
                resume page. Every route is designed to feel like part of one
                cohesive portfolio system.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/projects" className="button-link">
                Explore Work
              </Link>
              <Link href="/blog" className="button-link button-link-blue">
                Read Blog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
