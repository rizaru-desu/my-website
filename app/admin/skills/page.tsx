import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

import { SkillsCms } from "./skills-cms";

export default function AdminSkillsPage() {
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
          <Link href="/resume" className="button-link button-link-blue">
            View Public Resume
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
