import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";
import { AdminResumeAccessError, getAdminResumeContext } from "@/lib/resume";

import { ResumeCollectionsCms } from "./resume-collections-cms";
import { ResumeUpload } from "./resume-upload";

export default async function AdminResumePage() {
  const requestHeaders = await headers();

  try {
    await getAdminResumeContext(requestHeaders);
  } catch (error) {
    if (error instanceof AdminResumeAccessError && error.status === 401) {
      redirect("/login?redirectTo=%2Fadmin%2Fresume");
    }

    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <section className="surface-panel surface-panel-blue">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)] xl:items-start">
          <div className="space-y-4 xl:max-w-3xl">
            <Badge variant="blue">Resume Manager</Badge>
            <h1 className="font-display text-4xl uppercase leading-[0.9] text-ink sm:text-5xl xl:text-[4.25rem]">
              Manage the resume file and the content behind it.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-ink/78 sm:text-base">
              This admin route now covers the PDF asset plus the supporting timeline,
              education, and credential content that the resume experience depends on.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <EditorialCard className="min-h-[148px] space-y-2 overflow-hidden p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/60 sm:text-xs">
                Asset Mode
              </p>
              <p className="max-w-full text-balance break-words font-display text-[1.45rem] uppercase leading-[0.92] text-ink sm:text-[1.6rem]">
                Hosted PDF
              </p>
              <p className="text-sm leading-6 text-ink/74">
                One stable public file target.
              </p>
            </EditorialCard>
            <EditorialCard accent="red" className="min-h-[148px] space-y-2 overflow-hidden p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/60 sm:text-xs">
                Save Mode
              </p>
              <p className="max-w-full text-balance break-words font-display text-[1.45rem] uppercase leading-[0.92] text-ink sm:text-[1.6rem]">
                Persisted Asset
              </p>
              <p className="text-sm leading-6 text-ink/74">
                Saves stick and feed the CV route.
              </p>
            </EditorialCard>
            <EditorialCard accent="blue" className="min-h-[148px] space-y-2 overflow-hidden p-5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/60 sm:text-xs">
                Content Coverage
              </p>
              <p className="max-w-full text-balance break-words font-display text-[1.34rem] uppercase leading-[0.92] text-ink sm:text-[1.5rem]">
                Experience, Education
              </p>
              <p className="text-sm leading-6 text-ink/74">
                Supporting collections stay aligned.
              </p>
            </EditorialCard>

            <EditorialCard
              accent="cream"
              className="space-y-4 p-5 md:col-span-3 xl:grid xl:grid-cols-[1fr_auto] xl:items-center"
            >
              <div className="space-y-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink/60 sm:text-xs">
                  Public Route
                </p>
                <p className="font-display text-2xl uppercase leading-none text-ink sm:text-3xl">
                  Preview the recruiter-facing resume without leaving the workflow.
                </p>
                <p className="max-w-xl text-sm leading-6 text-ink/74">
                  Verify the page and the current download target in one quick pass.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/resume" className="button-link button-link-blue">
                  Open Resume
                </Link>
                <Link href="/api/cv/download" className="button-link">
                  Test Download
                </Link>
              </div>
            </EditorialCard>
          </div>
        </div>
      </section>

      <ResumeUpload />
      <ResumeCollectionsCms />
    </div>
  );
}
