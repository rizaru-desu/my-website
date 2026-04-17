import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { getPublicProfileContent } from "@/lib/profile";
import { getPublicSkills } from "@/lib/skills";
import { getPublicExperiences, getPublicEducation } from "@/lib/resume";

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{
    download?: string;
  }>;
}) {
  const { download } = await searchParams;
  const showDownloadUnavailable = download === "unavailable";
  const [profile, skills, experiences, education] = await Promise.all([
    getPublicProfileContent(),
    getPublicSkills(),
    getPublicExperiences(),
    getPublicEducation(),
  ]);
  const groupedSkills = Array.from(
    skills.reduce((map, skill) => {
      const existingGroup = map.get(skill.values.category) ?? [];
      existingGroup.push(skill);
      map.set(skill.values.category, existingGroup);
      return map;
    }, new Map<string, typeof skills>()),
  );

  return (
    <div className="px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <PageHero
          label="Resume"
          title="A print-inspired CV translated for the web."
          description="This route is intentionally recruiter-friendly: scan fast, understand scope, and jump back into work samples when needed."
        >
          <div className="flex flex-wrap gap-4">
            <a href="/api/cv/download" className="button-link button-link-blue">
              Download CV
            </a>
            <Link href="/projects" className="button-link">
              Open Projects
            </Link>
          </div>
        </PageHero>

        {showDownloadUnavailable ? (
          <EditorialCard accent="red" className="space-y-3">
            <Badge variant="red">Download Unavailable</Badge>
            <h2 className="font-display text-3xl uppercase leading-none text-ink">
              CV download is not configured yet.
            </h2>
            <p className="text-sm leading-7 text-ink/78">
              Add `RESUME_DOWNLOAD_URL` on the server, then try the download button
              again. The resume page itself still stays available for recruiters to scan.
            </p>
          </EditorialCard>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <EditorialCard accent="blue" className="space-y-5">
            <Badge variant="blue">Profile</Badge>
            <div className="flex items-start gap-4">
              <ProfileAvatar
                name={profile.name}
                src={profile.profilePhotoUrl}
                className="h-20 w-20 rounded-[22px]"
                fallbackClassName="text-3xl"
              />
              <div className="space-y-3">
                <h2 className="font-display text-4xl uppercase leading-none text-ink">
                  {profile.name}
                </h2>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  {profile.role}
                </p>
              </div>
            </div>
            <p className="text-base leading-7 text-ink/80">{profile.intro}</p>
            <div className="space-y-3 border-t-[3px] border-dashed border-ink/25 pt-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Focus
              </p>
              {profile.focus.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border-[3px] border-ink bg-white/60 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  {item}
                </div>
              ))}
            </div>
          </EditorialCard>
          <EditorialCard className="paper-grid space-y-5">
            <Badge variant="cream">Summary</Badge>
            <h2 className="font-display text-5xl uppercase leading-none text-ink">
              Product-minded engineer with a strong visual point of view.
            </h2>
            <p className="max-w-4xl text-base leading-8 text-ink/80 sm:text-lg">
              I build interfaces that make complex work feel clear and memorable. My
              focus is on translating ambitious visual direction into UI systems that
              are still credible, scalable, and easy for teams to work with.
            </p>
          </EditorialCard>
        </section>

        <SectionShell
          label="Experience"
          title="Recent roles and what changed because of them."
          contentClassName="space-y-6"
        >
          {experiences.map((item, index) => (
            <EditorialCard
              key={`${item.company}-${item.role}`}
              accent={index % 2 === 0 ? "cream" : "red"}
              className="grid gap-6 lg:grid-cols-[0.34fr_1fr]"
            >
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  {item.period}
                </p>
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {item.role}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/65">
                  {item.company} • {item.location}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-base leading-7 text-ink/80">{item.summary}</p>
                <ul className="space-y-3">
                  {item.achievements.map((achievement) => (
                    <li
                      key={achievement}
                      className="rounded-[20px] border-[3px] border-ink bg-white/60 px-4 py-3 text-sm leading-7 text-ink/80"
                    >
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </EditorialCard>
          ))}
        </SectionShell>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionShell
            label="Education"
            title="Foundation"
            contentClassName="space-y-6"
            className="h-full"
          >
            {education.map((item) => (
              <EditorialCard key={item.school} accent="blue" className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                  {item.period}
                </p>
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {item.degree}
                </h3>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/65">
                  {item.school}
                </p>
                <p className="text-sm leading-7 text-ink/80">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.highlights.map((highlight) => (
                    <Badge key={highlight} variant="cream">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </EditorialCard>
            ))}
          </SectionShell>

          <SectionShell
            label="Capabilities"
            title="The stack behind the polish."
            contentClassName="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {groupedSkills.map(([category, groupSkills], index) => (
              <EditorialCard
                key={category}
                accent={index === 0 ? "cream" : index === 1 ? "red" : "blue"}
                className="space-y-4"
              >
                <h3 className="font-display text-3xl uppercase leading-none text-ink">
                  {category}
                </h3>
                <p className="text-sm leading-7 text-ink/80">
                  {groupSkills.filter((skill) => skill.values.featured).length > 0
                    ? "Featured strengths from the live skills workspace."
                    : "Capability group managed from the live skills workspace."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {groupSkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={skill.values.featured ? "blue" : "cream"}
                    >
                      {skill.values.name}
                    </Badge>
                  ))}
                </div>
              </EditorialCard>
            ))}
          </SectionShell>
        </section>
      </div>
    </div>
  );
}
