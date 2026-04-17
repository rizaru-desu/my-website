import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { ProjectsCms } from "./projects-cms";

export default function AdminProjectsPage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-red">
        <div className="grid gap-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="space-y-4">
            <Badge variant="red">Projects Manager</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Manage case studies like a curated issue, not a database dump.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-ink/80">
              Featured ordering, category framing, tech stacks, and case-study copy all
              live here. The aim is to make project management feel visual and editorial.
            </p>
          </div>
          <Link href="/projects" className="button-link button-link-blue">
            View Public Archive
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
            Interaction Model
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            List + Editor Drawer
          </p>
        </EditorialCard>
        <EditorialCard accent="red" className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
            Save Mode
          </p>
          <p className="font-display text-xl uppercase leading-none text-ink">
            Live API Sync
          </p>
        </EditorialCard>
      </div>

      <div className="space-y-3">
        <Badge variant="cream">Project Management</Badge>
        <h2 className="font-display text-4xl uppercase leading-none text-ink sm:text-5xl">
          Build the archive, tune the publish state, and edit the story in one surface.
        </h2>
      </div>

      <ProjectsCms />
    </div>
  );
}
