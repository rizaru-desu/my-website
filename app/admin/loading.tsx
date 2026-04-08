import { Badge } from "@/components/ui/badge";
import { EditorialCard } from "@/components/ui/editorial-card";

function LoadingBar({
  className,
}: {
  className: string;
}) {
  return <div aria-hidden="true" className={`animate-pulse rounded-full bg-ink/12 ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="space-y-8">
      <section className="surface-panel relative overflow-hidden bg-panel px-6 py-8 sm:px-8">
        <div className="accent-plate left-8 top-8 hidden h-14 w-14 -rotate-6 rounded-[18px] bg-accent-red lg:block" />
        <div className="accent-plate bottom-8 right-10 hidden h-12 w-28 rotate-3 rounded-full bg-accent-blue lg:block" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Badge variant="cream">Loading Admin</Badge>
            <LoadingBar className="h-12 w-full max-w-3xl sm:h-14" />
            <LoadingBar className="h-5 w-full max-w-2xl" />
            <LoadingBar className="h-5 w-4/5 max-w-xl" />
          </div>
          <div className="rounded-[24px] border-[3px] border-ink bg-white/75 px-5 py-4 shadow-[6px_6px_0_var(--ink)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
              Workspace
            </p>
            <p className="mt-2 font-display text-3xl uppercase leading-none text-ink">
              Syncing
            </p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-ink/72">
              Preparing the next admin surface and swapping in the live content.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <EditorialCard
            key={`admin-loading-metric-${index}`}
            accent={index % 3 === 0 ? "cream" : index % 3 === 1 ? "blue" : "red"}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <LoadingBar className="h-4 w-24" />
              <LoadingBar className="h-6 w-16" />
            </div>
            <LoadingBar className="h-12 w-28" />
            <LoadingBar className="h-4 w-full" />
            <LoadingBar className="h-4 w-3/4" />
          </EditorialCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <EditorialCard className="space-y-5">
          <div className="space-y-3">
            <Badge variant="blue">Streaming Content</Badge>
            <LoadingBar className="h-10 w-full max-w-xl" />
          </div>
          <div className="rounded-[24px] border-[3px] border-ink bg-white/72 p-5 shadow-[5px_5px_0_var(--ink)]">
            <LoadingBar className="h-48 w-full rounded-[18px]" />
          </div>
        </EditorialCard>

        <EditorialCard accent="red" className="space-y-5">
          <div className="space-y-3">
            <Badge variant="red">Current Section</Badge>
            <LoadingBar className="h-10 w-full max-w-md" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`admin-loading-queue-${index}`}
                className="rounded-[22px] border-[3px] border-ink bg-panel px-4 py-4 shadow-[5px_5px_0_var(--ink)]"
              >
                <LoadingBar className="h-4 w-20" />
                <LoadingBar className="mt-3 h-8 w-3/4" />
                <LoadingBar className="mt-3 h-4 w-full" />
              </div>
            ))}
          </div>
        </EditorialCard>
      </section>
    </div>
  );
}
