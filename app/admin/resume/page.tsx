import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

import { ResumeCollectionsCms } from "./resume-collections-cms";
import { ResumeUpload } from "./resume-upload";

export default function AdminResumePage() {
  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
          <div className="space-y-4">
            <Badge variant="blue">Resume Manager</Badge>
            <h1 className="font-display text-5xl uppercase leading-none text-ink sm:text-6xl">
              Manage the resume file and the content behind it.
            </h1>
            <p className="text-base leading-8 text-ink/78">
              This admin route now covers the PDF asset plus the supporting timeline,
              education, and credential content that the resume experience depends on.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <EditorialCard className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Accepted Format
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                PDF only
              </p>
            </EditorialCard>
            <EditorialCard accent="red" className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Save Mode
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Local Review State
              </p>
            </EditorialCard>
            <EditorialCard accent="blue" className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/60">
                Content Coverage
              </p>
              <p className="font-display text-xl uppercase leading-none text-ink">
                Exp, edu, certs
              </p>
            </EditorialCard>
          </div>
        </div>
      </section>

      <ResumeUpload />
      <ResumeCollectionsCms />
    </div>
  );
}
