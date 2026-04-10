import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { AdminSkillsAccessError, getAdminSkillsContext } from "@/lib/skills";

import { SkillsCms } from "./skills-cms";

export default async function AdminSkillsPage() {
  const requestHeaders = await headers();

  try {
    await getAdminSkillsContext(requestHeaders);
  } catch (error) {
    if (error instanceof AdminSkillsAccessError && error.status === 401) {
      redirect("/login?redirectTo=%2Fadmin%2Fskills");
    }

    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-red">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="red">Skills Manager</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Capabilities arranged with the same clarity as the work.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              Grouping, featured emphasis, and skill levels all live here so the public
              profile reads like an intentional capability system instead of a dump of tags.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/resume#certificates-manager" className="button-link">
              Add Certificate
            </Link>
            <Link href="/resume" className="button-link button-link-blue">
              View Public Resume
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EditorialCard className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Editor Foundation
          </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Structured Validation
              </p>
            </EditorialCard>
        <EditorialCard accent="blue" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Listing Style
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Grouped Skill Cards
          </p>
        </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Editor Container
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Resizable Skill Drawer
          </p>
        </EditorialCard>
        <EditorialCard accent="cream" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Certificates
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Managed In Resume
          </p>
          <p className="text-sm leading-6 text-ink/72">
            Credentials stay with resume content while skills stay focused on
            capability tags.
          </p>
          <Link
            href="/admin/resume#certificates-manager"
            className="button-link button-link-muted w-fit"
          >
            Open Certificates
          </Link>
        </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Capability Management</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Group the stack, feature standout strengths, and keep the board polished.
        </h2>
      </div>

      <SkillsCms />
    </div>
  );
}
